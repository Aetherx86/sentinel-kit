import { propagateImpactBitset } from '../core/kernel.ts';
import type {
  ChangeMode,
  DiffImpactAnalysis,
  FileChangeKind,
  FileClassification,
  ParsedDiffFile,
  WorkspacePackage
} from '../types.ts';

const GLOBAL_ROOT_FILES = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'yarn.lock',
  'bun.lockb',
  'bun.lock',
  'npm-shrinkwrap.json',
  'cargo.lock',
  'poetry.lock',
  'go.sum',
  'tsconfig.json',
  'tsconfig.base.json',
  'turbo.json',
  'nx.json',
  'lerna.json',
  'dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  '.gitlab-ci.yml',
  'jenkinsfile'
]);

const DOC_BASENAMES = new Set([
  'readme',
  'license',
  'licence',
  'notice',
  'authors',
  'changelog',
  'changes',
  'contributing',
  'codeowners',
  'owners',
  'security'
]);

const DOC_EXTENSIONS = new Set(['.md', '.mdx', '.rst', '.txt', '.adoc']);
const ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot'
]);

const SLASH_COMMENT_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.go',
  '.rs',
  '.java',
  '.kt',
  '.c',
  '.cc',
  '.cpp',
  '.h',
  '.hpp',
  '.swift'
]);

const HASH_COMMENT_EXTS = new Set(['.py', '.rb', '.sh', '.bash', '.zsh', '.yml', '.yaml']);

function normalizeRelPath(rawPath: string): string {
  return rawPath
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(a|b)\//, '')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');
}

function getExtension(filePath: string): string {
  const base = filePath.slice(filePath.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot).toLowerCase() : '';
}

function getBasenameNoExt(filePath: string): string {
  const base = filePath.slice(filePath.lastIndexOf('/') + 1).toLowerCase();
  const dot = base.indexOf('.');
  return dot > 0 ? base.slice(0, dot) : base;
}

function isCommentOnlyLines(ext: string, lines: string[]): boolean {
  if (lines.length === 0) {
    return false;
  }
  const slashStyle = SLASH_COMMENT_EXTS.has(ext);
  const hashStyle = HASH_COMMENT_EXTS.has(ext);
  const sqlStyle = ext === '.sql';
  if (!slashStyle && !hashStyle && !sqlStyle) {
    return false;
  }

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (slashStyle) {
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('*/')
      ) {
        continue;
      }
      return false;
    }
    if (hashStyle) {
      if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) {
        continue;
      }
      return false;
    }
    if (sqlStyle) {
      if (trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        continue;
      }
      return false;
    }
  }
  return true;
}

export function classifyChangedFile(
  filePath: string,
  addedLines: string[] = [],
  removedLines: string[] = []
): FileClassification {
  const norm = filePath.toLowerCase();
  const ext = getExtension(norm);
  const baseNoExt = getBasenameNoExt(norm);
  const segments = norm.split('/');

  if (
    (segments.length === 1 && GLOBAL_ROOT_FILES.has(segments[0])) ||
    norm.startsWith('.github/workflows/') ||
    norm.startsWith('.github/actions/') ||
    norm === '.circleci/config.yml'
  ) {
    return 'config-global';
  }

  if (
    DOC_EXTENSIONS.has(ext) ||
    DOC_BASENAMES.has(baseNoExt) ||
    segments[0] === 'docs' ||
    segments[0] === 'doc'
  ) {
    return 'doc';
  }

  if (ASSET_EXTENSIONS.has(ext)) {
    return 'asset';
  }

  const allHunkLines = [...addedLines, ...removedLines];
  if (allHunkLines.length > 0 && isCommentOnlyLines(ext, allHunkLines)) {
    return 'comment-only';
  }

  if (
    /(\.|_)(test|spec)\.[a-z0-9]+$/i.test(norm) ||
    segments.includes('test') ||
    segments.includes('tests') ||
    segments.includes('__tests__') ||
    segments.includes('e2e')
  ) {
    return 'test';
  }

  return 'code';
}

function matchWorkspacePackage(
  filePath: string,
  sortedPackages: Array<{ name: string; normPath: string }>
): string | undefined {
  for (const pkg of sortedPackages) {
    if (pkg.normPath === '' || pkg.normPath === '.') {
      return pkg.name;
    }
    if (filePath === pkg.normPath || filePath.startsWith(`${pkg.normPath}/`)) {
      return pkg.name;
    }
  }
  return undefined;
}

function parseDiffHeaderPaths(line: string): { prevPath: string; nextPath: string } | null {
  const quoted = line.match(/^diff --git "?a\/([^"]+)"? "?b\/([^"]+)"?$/);
  if (quoted) {
    return { prevPath: quoted[1], nextPath: quoted[2] };
  }
  const plain = line.match(/^diff --git a\/(\S+) b\/(\S+)$/);
  if (plain) {
    return { prevPath: plain[1], nextPath: plain[2] };
  }
  return null;
}

export function parseGitDiff(
  diff: string | string[],
  packages: WorkspacePackage[] = []
): ParsedDiffFile[] {
  const sortedPackages = packages
    .map((p) => ({
      name: p.name,
      normPath: p.path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '')
    }))
    .sort((a, b) => b.normPath.length - a.normPath.length);

  if (Array.isArray(diff)) {
    return diff
      .map((entry) => normalizeRelPath(entry))
      .filter((entry) => entry.length > 0)
      .map((cleanPath) => ({
        path: cleanPath,
        kind: 'modified' as FileChangeKind,
        addedLines: [],
        removedLines: [],
        classification: classifyChangedFile(cleanPath),
        packageName: matchWorkspacePackage(cleanPath, sortedPackages)
      }));
  }

  const trimmed = diff.trim();
  if (trimmed.length === 0) {
    return [];
  }

  if (!trimmed.includes('diff --git ') && !trimmed.startsWith('--- ')) {
    const paths = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const statusPrefix = line.match(/^[ACDMRTUXB]\d*\s+(.+)$/);
        if (statusPrefix) {
          const parts = statusPrefix[1].split(/\t+/);
          return parts[parts.length - 1];
        }
        return line;
      });
    return parseGitDiff(paths, packages);
  }

  const lines = diff.split(/\r?\n/);
  const parsed: ParsedDiffFile[] = [];

  let currentPath = '';
  let previousPath: string | undefined;
  let kind: FileChangeKind = 'modified';
  let addedLines: string[] = [];
  let removedLines: string[] = [];
  let inHunk = false;
  let active = false;

  const flushCurrent = (): void => {
    if (!active || !currentPath) {
      return;
    }
    const clean = normalizeRelPath(currentPath);
    const prevClean = previousPath ? normalizeRelPath(previousPath) : undefined;
    parsed.push({
      path: clean,
      previousPath: prevClean && prevClean !== clean ? prevClean : undefined,
      kind,
      addedLines,
      removedLines,
      classification: classifyChangedFile(clean, addedLines, removedLines),
      packageName: matchWorkspacePackage(clean, sortedPackages)
    });
  };

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      flushCurrent();
      const hdr = parseDiffHeaderPaths(line);
      currentPath = hdr ? hdr.nextPath : '';
      previousPath = hdr ? hdr.prevPath : undefined;
      kind = 'modified';
      addedLines = [];
      removedLines = [];
      inHunk = false;
      active = true;
      continue;
    }

    if (!active) {
      if (line.startsWith('--- ')) {
        const rawOld = line.slice(4).trim();
        previousPath = rawOld === '/dev/null' ? undefined : rawOld;
        kind = rawOld === '/dev/null' ? 'added' : 'modified';
        addedLines = [];
        removedLines = [];
        inHunk = false;
        active = true;
      }
      continue;
    }

    if (!inHunk) {
      if (line.startsWith('new file mode')) {
        kind = 'added';
      } else if (line.startsWith('deleted file mode')) {
        kind = 'deleted';
      } else if (line.startsWith('rename from ')) {
        kind = 'renamed';
        previousPath = line.slice('rename from '.length).trim();
      } else if (line.startsWith('rename to ')) {
        kind = 'renamed';
        currentPath = line.slice('rename to '.length).trim();
      } else if (line.startsWith('+++ ')) {
        const rawNew = line.slice(4).trim();
        if (rawNew === '/dev/null') {
          kind = 'deleted';
          if (!currentPath && previousPath) {
            currentPath = previousPath;
          }
        } else {
          currentPath = rawNew;
        }
      } else if (line.startsWith('@@ ')) {
        inHunk = true;
      }
      continue;
    }

    if (line.startsWith('@@ ')) {
      inHunk = true;
      continue;
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      addedLines.push(line.slice(1));
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removedLines.push(line.slice(1));
    }
  }

  flushCurrent();
  return parsed;
}

function collectPlatformSignals(files: ParsedDiffFile[]): string[] {
  const signals = new Set<string>();
  for (const file of files) {
    if (file.classification === 'doc' || file.classification === 'comment-only') {
      continue;
    }
    const lower = file.path.toLowerCase();
    const ext = getExtension(lower).slice(1);
    if (ext) {
      signals.add(ext);
    }
    for (const seg of lower.split(/[\/._-]+/)) {
      if (
        seg === 'darwin' ||
        seg === 'macos' ||
        seg === 'win32' ||
        seg === 'windows' ||
        seg === 'dockerfile' ||
        seg === 'rust' ||
        seg === 'go' ||
        seg === 'gyp'
      ) {
        signals.add(seg);
      }
    }
  }
  return Array.from(signals);
}

export function analyzeDiffImpact(
  diff: string | string[],
  packages: WorkspacePackage[] = []
): DiffImpactAnalysis {
  const files = parseGitDiff(diff, packages);
  const pkgIndexByName = new Map<string, number>();
  packages.forEach((pkg, idx) => {
    pkgIndexByName.set(pkg.name, idx);
  });

  const directIdxSet = new Set<number>();
  const globalTriggers: string[] = [];
  const unmappedCodeFiles: string[] = [];

  for (const file of files) {
    if (file.classification === 'config-global') {
      globalTriggers.push(file.path);
    }
    const isCodeOrTest = file.classification === 'code' || file.classification === 'test';
    if (isCodeOrTest) {
      if (file.packageName !== undefined) {
        const idx = pkgIndexByName.get(file.packageName);
        if (idx !== undefined) {
          directIdxSet.add(idx);
        }
      } else {
        unmappedCodeFiles.push(file.path);
      }
    }
  }

  const depEdges: Array<[number, number]> = [];
  packages.forEach((pkg, childIdx) => {
    for (const depName of pkg.dependencies ?? []) {
      const parentIdx = pkgIndexByName.get(depName);
      if (parentIdx !== undefined) {
        depEdges.push([childIdx, parentIdx]);
      }
    }
  });

  const directIndices = Array.from(directIdxSet).sort((a, b) => a - b);
  const { impactedIndices, hopDistances } = propagateImpactBitset(
    packages.length,
    directIndices,
    depEdges
  );

  const directlyTouchedPackages = directIndices.map((idx) => packages[idx].name);
  const transitivelyImpactedPackages = impactedIndices.map((idx) => packages[idx].name);
  const packageHopDistances: Record<string, number> = {};
  for (const idx of impactedIndices) {
    packageHopDistances[packages[idx].name] = hopDistances[idx];
  }

  let changeMode: ChangeMode;
  if (files.length === 0) {
    changeMode = 'empty';
  } else if (globalTriggers.length > 0) {
    changeMode = 'global-invalidate';
  } else {
    const hasExecutableChange = files.some(
      (f) => f.classification === 'code' || f.classification === 'test'
    );
    changeMode = hasExecutableChange ? 'scoped-code' : 'docs-only';
  }

  return {
    files,
    directlyTouchedPackages,
    transitivelyImpactedPackages,
    packageHopDistances,
    changeMode,
    globalTriggers,
    platformSignals: collectPlatformSignals(files),
    unmappedCodeFiles
  };
}
