import type {
  InFlightWorkflowRun,
  MatrixCell,
  RunnerArch,
  RunnerOS,
  RunnerProvider,
  WorkflowMatrixSpec,
  ZombieCancellationAction,
  ZombieDetectionOptions,
  ZombieDetectionResult
} from '../types.ts';

type Primitive = string | number | boolean;

function stripYamlComment(line: string): string {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle && line[i - 1] !== '\\') {
      inDouble = !inDouble;
    } else if (ch === '#' && !inSingle && !inDouble) {
      if (i === 0 || /\s/.test(line[i - 1])) {
        return line.slice(0, i).trimEnd();
      }
    }
  }
  return line.trimEnd();
}

function parseScalar(raw: string): Primitive {
  const s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s === 'true') {
    return true;
  }
  if (s === 'false') {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    return Number(s);
  }
  return s;
}

function splitInlineCollection(inner: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      current += ch;
      if (ch === quote && inner[i - 1] !== '\\') {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '[' || ch === '{') {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ']' || ch === '}') {
      depth--;
      current += ch;
      continue;
    }
    if (ch === ',' && depth === 0) {
      if (current.trim().length > 0) {
        parts.push(current.trim());
      }
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim().length > 0) {
    parts.push(current.trim());
  }
  return parts;
}

function parseInlineArray(raw: string): Primitive[] {
  const body = raw.trim().slice(1, -1).trim();
  if (!body) {
    return [];
  }
  return splitInlineCollection(body).map(parseScalar);
}

function parseInlineObject(raw: string): Record<string, Primitive> {
  const body = raw.trim().slice(1, -1).trim();
  const obj: Record<string, Primitive> = {};
  if (!body) {
    return obj;
  }
  for (const entry of splitInlineCollection(body)) {
    const colon = entry.indexOf(':');
    if (colon > 0) {
      const k = entry.slice(0, colon).trim().replace(/^['"]|['"]$/g, '');
      const v = parseScalar(entry.slice(colon + 1));
      obj[k] = v;
    }
  }
  return obj;
}

function extractMatrixFromParsedJson(parsed: Record<string, unknown>): WorkflowMatrixSpec {
  if (parsed.axes && typeof parsed.axes === 'object' && !Array.isArray(parsed.axes)) {
    return {
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      axes: parsed.axes as Record<string, Primitive[]>,
      include: Array.isArray(parsed.include)
        ? (parsed.include as Array<Record<string, Primitive>>)
        : undefined,
      exclude: Array.isArray(parsed.exclude)
        ? (parsed.exclude as Array<Record<string, Primitive>>)
        : undefined,
      defaultEstimatedMinutes:
        typeof parsed.defaultEstimatedMinutes === 'number'
          ? parsed.defaultEstimatedMinutes
          : undefined,
      provider:
        parsed.provider === 'github' || parsed.provider === 'aws' ? parsed.provider : undefined
    };
  }

  let matrixObj: Record<string, unknown> | undefined;
  let workflowName: string | undefined =
    typeof parsed.name === 'string' ? parsed.name : undefined;

  if (parsed.jobs && typeof parsed.jobs === 'object') {
    const jobs = parsed.jobs as Record<string, Record<string, unknown>>;
    for (const [jobName, jobDef] of Object.entries(jobs)) {
      const strategy = jobDef?.strategy as Record<string, unknown> | undefined;
      if (strategy?.matrix && typeof strategy.matrix === 'object') {
        matrixObj = strategy.matrix as Record<string, unknown>;
        if (!workflowName) {
          workflowName = jobName;
        }
        break;
      }
    }
  } else if (parsed.matrix && typeof parsed.matrix === 'object') {
    matrixObj = parsed.matrix as Record<string, unknown>;
  } else {
    matrixObj = parsed;
  }

  const axes: Record<string, Primitive[]> = {};
  let include: Array<Record<string, Primitive>> | undefined;
  let exclude: Array<Record<string, Primitive>> | undefined;

  for (const [key, val] of Object.entries(matrixObj ?? {})) {
    if (key === 'include' && Array.isArray(val)) {
      include = val as Array<Record<string, Primitive>>;
    } else if (key === 'exclude' && Array.isArray(val)) {
      exclude = val as Array<Record<string, Primitive>>;
    } else if (Array.isArray(val)) {
      axes[key] = val as Primitive[];
    }
  }

  return { name: workflowName, axes, include, exclude };
}

export function parseWorkflowSpec(raw: string): WorkflowMatrixSpec {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return extractMatrixFromParsedJson(parsed);
  }

  const cleanLines = raw
    .split(/\r?\n/)
    .map(stripYamlComment)
    .filter((line) => line.trim().length > 0);

  let workflowName: string | undefined;
  let matrixStartIdx = -1;
  let matrixIndent = -1;

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];
    const indent = line.search(/\S/);
    const content = line.trim();
    if (indent === 0 && content.startsWith('name:')) {
      workflowName = String(parseScalar(content.slice(5)));
    }
    if (content === 'matrix:') {
      matrixStartIdx = i + 1;
      matrixIndent = indent;
      break;
    }
  }

  const startIdx = matrixStartIdx >= 0 ? matrixStartIdx : 0;
  const parentIndent = matrixStartIdx >= 0 ? matrixIndent : -1;

  const axes: Record<string, Primitive[]> = {};
  const include: Array<Record<string, Primitive>> = [];
  const exclude: Array<Record<string, Primitive>> = [];

  let keyIndent: number | null = null;
  let activeKey: string | null = null;
  let activeObj: Record<string, Primitive> | null = null;
  let objIndent = -1;

  for (let i = startIdx; i < cleanLines.length; i++) {
    const line = cleanLines[i];
    const indent = line.search(/\S/);
    const content = line.trim();

    if (parentIndent >= 0 && indent <= parentIndent) {
      break;
    }
    if (keyIndent === null && !content.startsWith('-')) {
      keyIndent = indent;
    }

    if (keyIndent !== null && indent === keyIndent && !content.startsWith('-')) {
      activeObj = null;
      const colon = content.indexOf(':');
      if (colon < 0) {
        continue;
      }
      const key = content.slice(0, colon).trim();
      const rest = content.slice(colon + 1).trim();
      activeKey = key;

      if (key === 'include' || key === 'exclude') {
        if (rest.startsWith('[')) {
          const items = splitInlineCollection(rest.slice(1, -1)).map(parseInlineObject);
          if (key === 'include') {
            include.push(...items);
          } else {
            exclude.push(...items);
          }
          activeKey = null;
        }
      } else if (rest.startsWith('[')) {
        axes[key] = parseInlineArray(rest);
        activeKey = null;
      } else if (rest.length === 0) {
        axes[key] = [];
      }
      continue;
    }

    if (!activeKey) {
      continue;
    }

    if (activeKey === 'include' || activeKey === 'exclude') {
      const targetList = activeKey === 'include' ? include : exclude;
      if (content.startsWith('-')) {
        const afterDash = content.slice(1).trim();
        if (afterDash.startsWith('{')) {
          targetList.push(parseInlineObject(afterDash));
          activeObj = null;
        } else {
          activeObj = {};
          targetList.push(activeObj);
          objIndent = indent;
          const colon = afterDash.indexOf(':');
          if (colon > 0) {
            const k = afterDash.slice(0, colon).trim();
            const v = parseScalar(afterDash.slice(colon + 1));
            activeObj[k] = v;
          }
        }
      } else if (activeObj && indent > objIndent) {
        const colon = content.indexOf(':');
        if (colon > 0) {
          const k = content.slice(0, colon).trim();
          const v = parseScalar(content.slice(colon + 1));
          activeObj[k] = v;
        }
      }
    } else if (content.startsWith('-')) {
      const val = parseScalar(content.slice(1));
      if (!axes[activeKey]) {
        axes[activeKey] = [];
      }
      axes[activeKey].push(val);
    }
  }

  return {
    name: workflowName,
    axes,
    include: include.length > 0 ? include : undefined,
    exclude: exclude.length > 0 ? exclude : undefined
  };
}

function inferOsAndArch(vars: Record<string, Primitive>): { os: RunnerOS; arch: RunnerArch } {
  const rawRunner = String(
    vars.os ?? vars['runs-on'] ?? vars.runner ?? vars.platform ?? 'linux'
  ).toLowerCase();
  const explicitArch = vars.arch !== undefined ? String(vars.arch).toLowerCase() : '';

  let os: RunnerOS = 'linux';
  if (rawRunner.includes('mac') || rawRunner.includes('darwin') || rawRunner.includes('osx')) {
    os = 'macos';
  } else if (rawRunner.includes('win')) {
    os = 'windows';
  }

  let arch: RunnerArch = 'x64';
  if (explicitArch.includes('arm') || explicitArch.includes('aarch64')) {
    arch = 'arm64';
  } else if (explicitArch.includes('x64') || explicitArch.includes('amd64')) {
    arch = 'x64';
  } else if (rawRunner.includes('arm') || rawRunner.includes('aarch64') || rawRunner.includes('graviton')) {
    arch = 'arm64';
  } else if (
    os === 'macos' &&
    (rawRunner.includes('14') || rawRunner.includes('15') || rawRunner.includes('latest') || rawRunner.includes('m1') || rawRunner.includes('m2'))
  ) {
    arch = 'arm64';
  }

  return { os, arch };
}

function inferDefaultMinutes(suite: string | undefined, fallback: number): number {
  const s = (suite ?? '').toLowerCase();
  if (s === 'smoke' || s === 'lint' || s === 'typecheck') {
    return 3;
  }
  if (s === 'unit') {
    return 6;
  }
  if (s === 'integration') {
    return 12;
  }
  if (s === 'e2e') {
    return 18;
  }
  return fallback;
}

function matchesSubset(
  combo: Record<string, Primitive>,
  pattern: Record<string, Primitive>
): boolean {
  const keys = Object.keys(pattern);
  if (keys.length === 0) {
    return false;
  }
  for (const k of keys) {
    if (!(k in combo) || String(combo[k]) !== String(pattern[k])) {
      return false;
    }
  }
  return true;
}

function buildCellFromVars(
  vars: Record<string, Primitive>,
  index: number,
  defaultMinutes: number,
  defaultProvider: RunnerProvider
): MatrixCell {
  const { os, arch } = inferOsAndArch(vars);
  const rawRuntime =
    vars.runtime ??
    vars.node ??
    vars['node-version'] ??
    vars.python ??
    vars['python-version'] ??
    vars.go;
  const runtime = rawRuntime !== undefined ? String(rawRuntime) : undefined;
  const rawSuite = vars.suite ?? vars['test-suite'] ?? vars.group;
  const suite = rawSuite !== undefined ? String(rawSuite) : undefined;
  const rawPkg = vars.targetPackage ?? vars.package ?? vars.workspace ?? vars.scope;
  const targetPackage = rawPkg !== undefined ? String(rawPkg) : undefined;
  const provider: RunnerProvider =
    vars.provider === 'aws' || vars.provider === 'github' ? vars.provider : defaultProvider;
  const vcpu = typeof vars.vcpu === 'number' ? vars.vcpu : undefined;
  const estimatedMinutes =
    typeof vars.estimatedMinutes === 'number'
      ? vars.estimatedMinutes
      : inferDefaultMinutes(suite, defaultMinutes);
  const required = Boolean(vars.required);

  const idParts = [os, arch];
  if (runtime) {
    idParts.push(`rt-${runtime}`);
  }
  if (suite) {
    idParts.push(suite);
  }
  if (targetPackage) {
    idParts.push(targetPackage.replace(/[^a-zA-Z0-9_-]/g, '_'));
  }
  const explicitId = typeof vars.id === 'string' && vars.id.length > 0 ? vars.id : null;
  const id = explicitId ?? `${idParts.join('-')}-${index}`;

  return {
    id,
    os,
    arch,
    runtime,
    suite,
    targetPackage,
    provider,
    vcpu,
    estimatedMinutes,
    required,
    variables: { ...vars }
  };
}

export function expandWorkflowMatrix(
  input: MatrixCell[] | WorkflowMatrixSpec | string,
  defaultProvider: RunnerProvider = 'github'
): MatrixCell[] {
  if (Array.isArray(input)) {
    return input.map((cell) => ({
      ...cell,
      provider: cell.provider ?? defaultProvider,
      estimatedMinutes:
        cell.estimatedMinutes ?? inferDefaultMinutes(cell.suite, 8),
      variables: { ...(cell.variables ?? {}) }
    }));
  }

  const spec = typeof input === 'string' ? parseWorkflowSpec(input) : input;
  const axisEntries = Object.entries(spec.axes).filter(([, vals]) => vals.length > 0);
  const provider = spec.provider ?? defaultProvider;
  const fallbackMinutes = spec.defaultEstimatedMinutes ?? 8;

  let combinations: Array<Record<string, Primitive>> = [];
  if (axisEntries.length > 0) {
    combinations = [{}];
    for (const [axisKey, axisValues] of axisEntries) {
      const next: Array<Record<string, Primitive>> = [];
      for (const existing of combinations) {
        for (const val of axisValues) {
          next.push({ ...existing, [axisKey]: val });
        }
      }
      combinations = next;
    }
  }

  if (spec.exclude && spec.exclude.length > 0) {
    combinations = combinations.filter(
      (combo) => !spec.exclude!.some((ex) => matchesSubset(combo, ex))
    );
  }

  const axisKeyNames = axisEntries.map(([k]) => k);
  if (spec.include && spec.include.length > 0) {
    const standaloneIncludes: Array<Record<string, Primitive>> = [];
    for (const inc of spec.include) {
      const incAxisFilter: Record<string, Primitive> = {};
      let specifiesDefinedAxis = false;
      for (const k of axisKeyNames) {
        if (k in inc) {
          incAxisFilter[k] = inc[k];
          specifiesDefinedAxis = true;
        }
      }

      let matchedExisting = false;
      if (specifiesDefinedAxis && combinations.length > 0) {
        for (const combo of combinations) {
          if (matchesSubset(combo, incAxisFilter)) {
            Object.assign(combo, inc);
            matchedExisting = true;
          }
        }
      }
      if (!matchedExisting) {
        standaloneIncludes.push({ ...inc });
      }
    }
    combinations.push(...standaloneIncludes);
  }

  return combinations.map((combo, idx) =>
    buildCellFromVars(combo, idx, fallbackMinutes, provider)
  );
}

function isProtectedBranchName(branch: string): boolean {
  const clean = branch.replace(/^refs\/heads\//, '').toLowerCase();
  return (
    clean === 'main' ||
    clean === 'master' ||
    clean === 'production' ||
    clean === 'prod' ||
    clean.startsWith('release/')
  );
}

function estimateRemainingMinutes(run: InFlightWorkflowRun): number {
  if (typeof run.remainingEstimatedMinutes === 'number' && run.remainingEstimatedMinutes >= 0) {
    return run.remainingEstimatedMinutes;
  }
  const p95 = run.p95DurationMinutes ?? 15;
  const elapsed = run.elapsedMinutes ?? 0;
  return Math.max(1, Math.round((p95 - elapsed) * 100) / 100);
}

export function detectZombieRuns(
  runs: InFlightWorkflowRun[],
  options: ZombieDetectionOptions = {}
): ZombieDetectionResult {
  const p95Multiplier = options.p95Multiplier ?? 1.5;
  const stallThresholdMinutes = options.stallThresholdMinutes ?? 15;
  const cancelProtectedBranches = options.cancelProtectedBranches ?? false;

  const groups = new Map<string, InFlightWorkflowRun[]>();
  for (const run of runs) {
    const scopeKey =
      run.pullRequestNumber !== undefined
        ? `pr:${run.pullRequestNumber}`
        : `branch:${run.branch}`;
    const key = `${run.workflowName}::${scopeKey}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(run);
    groups.set(key, bucket);
  }

  const cancelActions: ZombieCancellationAction[] = [];
  const activeHeadRuns: string[] = [];
  const supersededRunIds = new Set<string>();

  for (const bucket of groups.values()) {
    const sorted = [...bucket].sort(
      (a, b) => Date.parse(b.startedAtIso) - Date.parse(a.startedAtIso)
    );
    const head = sorted[0];
    activeHeadRuns.push(head.runId);

    const isProtected =
      Boolean(head.isProtectedBranch) || isProtectedBranchName(head.branch);
    if (isProtected && !cancelProtectedBranches) {
      for (let i = 1; i < sorted.length; i++) {
        activeHeadRuns.push(sorted[i].runId);
      }
      continue;
    }

    for (let i = 1; i < sorted.length; i++) {
      const older = sorted[i];
      supersededRunIds.add(older.runId);
      cancelActions.push({
        runId: older.runId,
        reason: 'SUPERSEDED_BY_NEWER_COMMIT',
        supersededByRunId: head.runId,
        wastedMinutesAvoided: estimateRemainingMinutes(older)
      });
    }
  }

  for (const run of runs) {
    if (supersededRunIds.has(run.runId)) {
      continue;
    }

    let flaggedViaJobs = false;
    if (run.jobs && run.jobs.length > 0) {
      for (const job of run.jobs) {
        if (
          job.lastLogOutputAgoMinutes !== undefined &&
          job.lastLogOutputAgoMinutes >= stallThresholdMinutes
        ) {
          flaggedViaJobs = true;
          cancelActions.push({
            runId: run.runId,
            jobId: job.jobId,
            reason: 'LOG_STALL_TIMEOUT',
            wastedMinutesAvoided: Math.max(
              1,
              Math.round(((job.p95DurationMinutes ?? 20) * 0.5) * 100) / 100
            )
          });
        } else if (
          job.p95DurationMinutes !== undefined &&
          job.p95DurationMinutes > 0 &&
          job.elapsedMinutes > job.p95DurationMinutes * p95Multiplier
        ) {
          flaggedViaJobs = true;
          cancelActions.push({
            runId: run.runId,
            jobId: job.jobId,
            reason: 'P95_RUNTIME_EXCEEDED',
            wastedMinutesAvoided: Math.max(
              1,
              Math.round((job.p95DurationMinutes * 0.5) * 100) / 100
            )
          });
        }
      }
    }

    if (
      !flaggedViaJobs &&
      run.elapsedMinutes !== undefined &&
      run.p95DurationMinutes !== undefined &&
      run.p95DurationMinutes > 0 &&
      run.elapsedMinutes > run.p95DurationMinutes * p95Multiplier
    ) {
      cancelActions.push({
        runId: run.runId,
        reason: 'P95_RUNTIME_EXCEEDED',
        wastedMinutesAvoided: Math.max(
          1,
          Math.round((run.p95DurationMinutes * 0.5) * 100) / 100
        )
      });
    }
  }

  const cancelledRunIdSet = new Set(
    cancelActions.filter((a) => !a.jobId).map((a) => a.runId)
  );
  const filteredHeads = activeHeadRuns.filter((id) => !cancelledRunIdSet.has(id));
  const totalWastedMinutesAvoided =
    Math.round(
      cancelActions.reduce((acc, item) => acc + item.wastedMinutesAvoided, 0) * 100
    ) / 100;

  return {
    cancelActions,
    activeHeadRuns: filteredHeads,
    totalWastedMinutesAvoided
  };
}
