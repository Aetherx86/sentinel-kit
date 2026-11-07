// Lexical transforms must not change behaviour. Template literal expressions are the case that broke:
// a local variable inside ${...} kept its name while its declaration was renamed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('identifiers inside template literal expressions are renamed with their declarations', async () => {
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'obfuscate-'));
  try {
    const src = path.join(stage, 'packages/sample/src');
    fs.mkdirSync(path.join(src, 'core'), { recursive: true });
    fs.mkdirSync(path.join(stage, 'tools'));
    fs.copyFileSync(path.join(ROOT, 'tools/obfuscate.mjs'), path.join(stage, 'tools/obfuscate.mjs'));
    fs.writeFileSync(path.join(src, 'index.ts'), "export { run } from './core/kernel.ts';\n");
    fs.writeFileSync(path.join(src, 'core/kernel.ts'), [
      'export function run(name: string, n: number): string {',
      '  const host = name.toUpperCase();',
      '  const list = [1, 2].map((x) => `${x}:${host}`).join(",");',
      '  const nested = `a${`b${host}c${{ k: n }.k}`}d`;',
      "  return `${host}/${n + 1}|${list}|${nested}|${'}'}|\\${literal}`;",
      '}',
      ''
    ].join('\n'));
    execFileSync(process.execPath, ['--no-warnings', 'tools/obfuscate.mjs'], { cwd: stage, stdio: 'ignore' });
    const bundle = path.join(stage, 'packages/sample/dist/index.mjs');
    const mod = await import(pathToFileURL(bundle).href);
    assert.equal(mod.run('ab', 4), 'AB/5|1:AB,2:AB|abABc4d|}|${literal}');
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }
});

test('01-matrix-pruner dist resolves changed files to packages', async () => {
  const mod = await import('../packages/01-matrix-pruner/dist/index.mjs');
  const plan = mod.planMatrixExecution({
    diff: [
      'diff --git a/packages/core/src/x.ts b/packages/core/src/x.ts',
      'index 1111111..2222222 100644',
      '--- a/packages/core/src/x.ts',
      '+++ b/packages/core/src/x.ts',
      '@@ -1,1 +1,2 @@',
      '+export const v = 2;'
    ].join('\n'),
    packages: [{ name: '@a/core', path: 'packages/core', dependencies: [] }],
    matrix: [{ id: 'core-unit', os: 'linux', arch: 'x64', runtime: '22', suite: 'unit', targetPackage: '@a/core', estimatedMinutes: 6 }]
  });
  assert.deepEqual(plan.impact.directlyTouchedPackages, ['@a/core']);
});
