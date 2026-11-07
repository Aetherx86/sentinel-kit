#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

const JS_RESERVED = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
  'new', 'null', 'of', 'return', 'super', 'switch', 'this', 'throw', 'true',
  'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
  'async', 'from', 'as', 'get', 'set', 'static',
  // Standard globals
  'Array', 'ArrayBuffer', 'BigInt', 'BigInt64Array', 'BigUint64Array',
  'Boolean', 'Buffer', 'DataView', 'Date', 'Error', 'EvalError', 'Float32Array',
  'Float64Array', 'Function', 'Infinity', 'Int8Array', 'Int16Array', 'Int32Array',
  'Intl', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'Promise', 'Proxy',
  'RangeError', 'ReferenceError', 'Reflect', 'RegExp', 'Set', 'SharedArrayBuffer',
  'String', 'Symbol', 'SyntaxError', 'TextDecoder', 'TextEncoder', 'TypeError',
  'URIError', 'URL', 'URLSearchParams', 'Uint8Array', 'Uint8ClampedArray',
  'Uint16Array', 'Uint32Array', 'WeakMap', 'WeakRef', 'WeakSet', 'WebAssembly',
  'atob', 'btoa', 'clearInterval', 'clearTimeout', 'console', 'crypto',
  'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
  'fetch', 'globalThis', 'isFinite', 'isNaN', 'parseFloat', 'parseInt',
  'performance', 'process', 'queueMicrotask', 'setInterval', 'setTimeout',
  'structuredClone'
]);

const REGEX_PRECEDERS = new Set([
  '(', '[', '{', ',', ';', ':', '=', '!', '&', '|', '?', '+', '-', '*', '%',
  '/', '~', '^', '<', '>', '=>', '==', '===', '!=', '!==', '<=', '>=', '&&',
  '||', '??', '+=', '-=', '*=', '/=', '%=', '<<', '>>', '>>>', 'return',
  'throw', 'case', 'in', 'of', 'typeof', 'instanceof', 'void', 'delete', 'new',
  'await', 'yield'
]);

function tokenizeJS(code) {
  const tokens = [];
  let i = 0;
  const n = code.length;
  let prevSignificant = '(';

  while (i < n) {
    const ch = code[i];

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      let start = i;
      let hasNewline = false;
      while (i < n && (code[i] === ' ' || code[i] === '\t' || code[i] === '\r' || code[i] === '\n')) {
        if (code[i] === '\n') hasNewline = true;
        i++;
      }
      tokens.push({ type: 'ws', value: hasNewline ? '\n' : ' ', raw: code.slice(start, i) });
      continue;
    }

    // Line comment
    if (ch === '/' && code[i + 1] === '/') {
      let start = i;
      i += 2;
      while (i < n && code[i] !== '\n') i++;
      tokens.push({ type: 'comment', value: '', raw: code.slice(start, i) });
      continue;
    }

    // Block comment
    if (ch === '/' && code[i + 1] === '*') {
      let start = i;
      let hasNewline = false;
      i += 2;
      while (i < n && !(code[i] === '*' && code[i + 1] === '/')) {
        if (code[i] === '\n') hasNewline = true;
        i++;
      }
      i += 2;
      tokens.push({ type: 'ws', value: hasNewline ? '\n' : ' ', raw: code.slice(start, i) });
      continue;
    }

    // String literal (' or ")
    if (ch === '\'' || ch === '"') {
      const quote = ch;
      let start = i++;
      while (i < n && code[i] !== quote) {
        if (code[i] === '\\') i += 2;
        else i++;
      }
      i++;
      const raw = code.slice(start, i);
      tokens.push({ type: 'string', value: raw, raw });
      prevSignificant = 'string';
      continue;
    }

    // Template literal (treat entire template incl. ${...} safely as raw chunk)
    if (ch === '`') {
      let start = i++;
      let depth = 0;
      while (i < n) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }
        if (depth === 0 && code[i] === '`') {
          i++;
          break;
        }
        if (code[i] === '$' && code[i + 1] === '{') {
          depth++;
          i += 2;
          continue;
        }
        if (depth > 0) {
          if (code[i] === '{') depth++;
          else if (code[i] === '}') depth--;
          else if (code[i] === '\'' || code[i] === '"') {
            const q = code[i++];
            while (i < n && code[i] !== q) {
              if (code[i] === '\\') i += 2;
              else i++;
            }
          }
        }
        i++;
      }
      const raw = code.slice(start, i);
      tokens.push({ type: 'template', value: raw, raw });
      prevSignificant = 'template';
      continue;
    }

    // Regex literal vs division operator
    if (ch === '/' && REGEX_PRECEDERS.has(prevSignificant)) {
      let start = i++;
      let inCharClass = false;
      while (i < n) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }
        if (code[i] === '[') inCharClass = true;
        else if (code[i] === ']') inCharClass = false;
        else if (code[i] === '/' && !inCharClass) {
          i++;
          break;
        }
        i++;
      }
      while (i < n && /[a-z]/i.test(code[i])) i++;
      const raw = code.slice(start, i);
      tokens.push({ type: 'regex', value: raw, raw });
      prevSignificant = 'regex';
      continue;
    }

    // Number literal
    if ((ch >= '0' && ch <= '9') || (ch === '.' && code[i + 1] >= '0' && code[i + 1] <= '9')) {
      let start = i;
      if (ch === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
        i += 2;
        while (i < n && /[0-9a-fA-F_]/.test(code[i])) i++;
      } else if (ch === '0' && (code[i + 1] === 'b' || code[i + 1] === 'B')) {
        i += 2;
        while (i < n && /[01_]/.test(code[i])) i++;
      } else {
        while (i < n && /[0-9._eE+-]/.test(code[i])) {
          if ((code[i] === '+' || code[i] === '-') && code[i - 1] !== 'e' && code[i - 1] !== 'E') break;
          i++;
        }
      }
      if (code[i] === 'n') i++;
      const raw = code.slice(start, i);
      tokens.push({ type: 'number', value: raw, raw });
      prevSignificant = 'number';
      continue;
    }

    // Identifier / keyword
    if (/[A-Za-z_$]/.test(ch)) {
      let start = i++;
      while (i < n && /[A-Za-z0-9_$]/.test(code[i])) i++;
      const raw = code.slice(start, i);
      tokens.push({ type: 'ident', value: raw, raw });
      prevSignificant = raw;
      continue;
    }

    // Multi-char punctuation
    const three = code.slice(i, i + 3);
    const two = code.slice(i, i + 2);
    if (['===', '!==', '>>>', '...', '<<=', '>>=', '&&=', '||=', '??='].includes(three)) {
      tokens.push({ type: 'punct', value: three, raw: three });
      prevSignificant = three;
      i += 3;
      continue;
    }
    if ([
      '==', '!=', '<=', '>=', '=>', '&&', '||', '??', '?.', '++', '--',
      '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**'
    ].includes(two)) {
      tokens.push({ type: 'punct', value: two, raw: two });
      prevSignificant = two;
      i += 2;
      continue;
    }

    tokens.push({ type: 'punct', value: ch, raw: ch });
    prevSignificant = ch;
    i++;
  }

  return tokens;
}

function prevSigToken(tokens, idx) {
  for (let j = idx - 1; j >= 0; j--) {
    if (tokens[j].type !== 'ws' && tokens[j].type !== 'comment') return tokens[j];
  }
  return null;
}

function nextSigToken(tokens, idx) {
  for (let j = idx + 1; j < tokens.length; j++) {
    if (tokens[j].type !== 'ws' && tokens[j].type !== 'comment') return tokens[j];
  }
  return null;
}

function deterministicHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function parseDecodedStringLiteral(raw) {
  const quote = raw[0];
  const body = raw.slice(1, -1);
  if (quote === '"') {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  let out = '';
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '\\') {
      out += body[i];
      continue;
    }
    i++;
    const esc = body[i];
    if (esc === 'n') out += '\n';
    else if (esc === 'r') out += '\r';
    else if (esc === 't') out += '\t';
    else if (esc === '0') out += '\0';
    else if (esc === '\\') out += '\\';
    else if (esc === '\'') out += '\'';
    else if (esc === '"') out += '"';
    else if (esc === 'x') {
      out += String.fromCharCode(parseInt(body.slice(i + 1, i + 3), 16));
      i += 2;
    } else if (esc === 'u') {
      if (body[i + 1] === '{') {
        const end = body.indexOf('}', i + 2);
        out += String.fromCodePoint(parseInt(body.slice(i + 2, end), 16));
        i = end;
      } else {
        out += String.fromCharCode(parseInt(body.slice(i + 1, i + 5), 16));
        i += 4;
      }
    } else {
      out += esc;
    }
  }
  return out;
}

function obfuscateCoreModuleBody(jsBody, saltSeed, importedBindings, exportedNames) {
  const tokens = tokenizeJS(jsBody);

  // Collect module-internal declarations safe for identifier mangling
  const renameMap = new Map();
  let symCounter = 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'ident') continue;
    const prev = prevSigToken(tokens, i);
    if (!prev) continue;
    if (prev.type === 'ident' && (prev.value === 'const' || prev.value === 'let' || prev.value === 'var' || prev.value === 'function' || prev.value === 'class')) {
      const name = t.value;
      if (
        !JS_RESERVED.has(name) &&
        !importedBindings.has(name) &&
        !exportedNames.has(name) &&
        !renameMap.has(name)
      ) {
        const tag = ((saltSeed + symCounter * 0x9e37) & 0xffff).toString(16).padStart(4, '0');
        renameMap.set(name, `_0x${tag}_${symCounter.toString(36)}`);
        symCounter++;
      }
    }
  }

  // String table for core module
  const strings = [];
  const stringIndex = new Map();

  function internString(val) {
    if (stringIndex.has(val)) return stringIndex.get(val);
    const idx = strings.length;
    strings.push(val);
    stringIndex.set(val, idx);
    return idx;
  }

  const helperFn = `_$s_${(saltSeed & 0xffff).toString(16)}`;
  let maskStep = saltSeed >>> 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = prevSigToken(tokens, i);
    const next = nextSigToken(tokens, i);

    if (t.type === 'ident' && renameMap.has(t.value)) {
      const isPropAccess = prev && prev.type === 'punct' && (prev.value === '.' || prev.value === '?.');
      const isObjKey = next && next.type === 'punct' && next.value === ':' && (!prev || (prev.value !== '?' && prev.value !== 'case'));
      const isShorthandProp =
        prev && prev.type === 'punct' && (prev.value === '{' || prev.value === ',') &&
        next && next.type === 'punct' && (next.value === '}' || next.value === ',');

      if (!isPropAccess && !isObjKey && !isShorthandProp) {
        t.value = renameMap.get(t.value);
      } else if (isShorthandProp) {
        // Expand { foo } -> { foo: _0x... } only in value object literals, not const { foo } = ...
        // Skip shorthand expansion to remain safe for destructuring patterns; keep original only if needed
        // Actually if foo is renamed everywhere else, { foo } would reference undefined unless expanded or skipped from renameMap!
      }
    }

    if (t.type === 'string') {
      const isObjKey = next && next.type === 'punct' && next.value === ':';
      if (!isObjKey) {
        const decoded = parseDecodedStringLiteral(t.value);
        const idx = internString(decoded);
        t.value = `${helperFn}(${idx})`;
      }
    }

    if (t.type === 'number') {
      const isObjKey = next && next.type === 'punct' && next.value === ':';
      if (!isObjKey && !t.value.endsWith('n') && !t.value.includes('.') && !t.value.includes('e') && !t.value.includes('E')) {
        const cleaned = t.value.replace(/_/g, '');
        const parsed = Number(cleaned);
        if (Number.isSafeInteger(parsed) && parsed >= 2 && parsed <= 0x7fffffff) {
          maskStep = (Math.imul(maskStep ^ 0x5bd1e995, 0x27d4eb2d) + 0x165667b1) >>> 0;
          const key = (maskStep & 0x3fffffff) >>> 0;
          const enc = (parsed ^ key);
          t.value = `(0x${enc.toString(16)}^0x${key.toString(16)})`;
        }
      }
    }
  }

  // Second check: ensure any identifier used in shorthand { x } wasn't broken
  // Let's detect shorthand identifiers before renaming so we never rename a shorthand destructured key!
  return buildCoreOutputWithSafeRename(jsBody, saltSeed, importedBindings, exportedNames);
}

function buildCoreOutputWithSafeRename(jsBody, saltSeed, importedBindings, exportedNames) {
  const tokens = tokenizeJS(jsBody);

  // Identify identifiers in shorthand positions or used as property/method names (.foo)
  const shorthandIdents = new Set();
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'ident') continue;
    const prev = prevSigToken(tokens, i);
    const next = nextSigToken(tokens, i);
    if (prev && prev.type === 'punct' && (prev.value === '.' || prev.value === '?.')) {
      shorthandIdents.add(t.value);
    }
    if (
      prev && prev.type === 'punct' && (prev.value === '{' || prev.value === ',') &&
      next && next.type === 'punct' && (next.value === '}' || next.value === ',' || next.value === '=' || next.value === '(')
    ) {
      shorthandIdents.add(t.value);
    }
  }

  const renameMap = new Map();
  let symCounter = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'ident') continue;
    const prev = prevSigToken(tokens, i);
    if (!prev) continue;
    if (
      prev.type === 'ident' &&
      (prev.value === 'const' || prev.value === 'let' || prev.value === 'var' || prev.value === 'function' || prev.value === 'class')
    ) {
      const name = t.value;
      if (
        !JS_RESERVED.has(name) &&
        !importedBindings.has(name) &&
        !exportedNames.has(name) &&
        !shorthandIdents.has(name) &&
        !renameMap.has(name)
      ) {
        const tag = ((saltSeed + symCounter * 0x45d9) & 0xffff).toString(16).padStart(4, '0');
        renameMap.set(name, `_0x${tag}${symCounter.toString(36)}`);
        symCounter++;
      }
    }
  }

  const strings = [];
  const stringIndex = new Map();
  const helperFn = `_$s${(saltSeed & 0xfff).toString(16)}`;
  let maskStep = (saltSeed ^ 0xa5a55a5a) >>> 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = prevSigToken(tokens, i);
    const next = nextSigToken(tokens, i);

    if (t.type === 'ident' && renameMap.has(t.value)) {
      const isPropAccess = prev && prev.type === 'punct' && (prev.value === '.' || prev.value === '?.');
      const isObjKey = next && next.type === 'punct' && next.value === ':' && (!prev || (prev.value !== '?' && prev.value !== 'case'));
      if (!isPropAccess && !isObjKey) {
        t.value = renameMap.get(t.value);
      }
    } else if (t.type === 'string') {
      const isObjKey = next && next.type === 'punct' && next.value === ':' && (!prev || (prev.value !== '?' && prev.value !== 'case'));
      if (!isObjKey) {
        const decoded = parseDecodedStringLiteral(t.value);
        let idx = stringIndex.get(decoded);
        if (idx === undefined) {
          idx = strings.length;
          strings.push(decoded);
          stringIndex.set(decoded, idx);
        }
        t.value = `${helperFn}(${idx})`;
      }
    } else if (t.type === 'number') {
      const isObjKey = next && next.type === 'punct' && next.value === ':';
      if (!isObjKey && !t.value.endsWith('n') && !t.value.includes('.') && !t.value.includes('e') && !t.value.includes('E')) {
        const cleaned = t.value.replace(/_/g, '');
        const parsed = Number(cleaned);
        if (Number.isSafeInteger(parsed) && parsed >= 2 && parsed <= 0x3fffffff) {
          maskStep = (Math.imul(maskStep ^ 0x5bd1e995, 0x27d4eb2d) + 0x165667b1) >>> 0;
          const key = (maskStep & 0x3fffffff) >>> 0;
          const enc = (parsed ^ key);
          t.value = `(0x${enc.toString(16)}^0x${key.toString(16)})`;
        }
      }
    }
  }

  let decoderPreamble = '';
  if (strings.length > 0) {
    const enc = new TextEncoder();
    const offsets = [];
    const lengths = [];
    const chunks = [];
    let total = 0;
    for (const s of strings) {
      const b = enc.encode(s);
      offsets.push(total);
      lengths.push(b.length);
      chunks.push(b);
      total += b.length;
    }
    const pool = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) {
      pool.set(c, pos);
      pos += c.length;
    }
    let st = saltSeed >>> 0;
    for (let i = 0; i < pool.length; i++) {
      st = (st + 0x9e3779b9) >>> 0;
      let z = st;
      z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
      z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
      z = (z ^ (z >>> 16)) >>> 0;
      pool[i] ^= (z & 0xff) ^ ((i * 17) & 0xff);
    }
    decoderPreamble =
      `const _$p=Uint8Array.from([${Array.from(pool).join(',')}]),` +
      `_$o=[${offsets.join(',')}],_$l=[${lengths.join(',')}],_$c=new Map(),_$td=new TextDecoder();\n` +
      `function ${helperFn}(k){if(_$c.has(k))return _$c.get(k);` +
      `const s=_$o[k],n=_$l[k],u=new Uint8Array(n);let q=${saltSeed >>> 0};` +
      `if((Math.imul(q|1,q|1)&7)!==1)return'';` +
      `for(let i=0;i<s+n;i++){q=(q+0x9e3779b9)>>>0;if(i>=s){let z=q;` +
      `z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;` +
      `z=(z^(z>>>16))>>>0;u[i-s]=_$p[i]^(z&255)^((i*17)&255);}}` +
      `const v=_$td.decode(u);_$c.set(k,v);return v;}\n`;
  }

  return decoderPreamble + renderCompactTokens(tokens);
}

function renderCompactTokens(tokens) {
  let out = '';
  let prevVal = '';
  let prevType = '';

  for (const t of tokens) {
    if (t.type === 'comment') continue;
    if (t.type === 'ws') {
      if (t.value === '\n') {
        if (!out.endsWith('\n') && out.length > 0) {
          out += '\n';
          prevVal = '\n';
          prevType = 'ws';
        }
      } else if (out.length > 0 && !out.endsWith('\n') && !out.endsWith(' ')) {
        // Keep single space when needed to separate tokens
        out += ' ';
        prevVal = ' ';
        prevType = 'ws';
      }
      continue;
    }
    // Trim redundant space around safe punctuation
    const unsafeNumberDot = prevType === 'number' && t.value === '.';
    const unsafeDoubleSign = (prevVal === '+' && t.value.startsWith('+')) || (prevVal === '-' && t.value.startsWith('-'));
    if (
      t.type === 'punct' &&
      out.endsWith(' ') &&
      !unsafeNumberDot &&
      !unsafeDoubleSign &&
      ![ '++', '--' ].includes(t.value) &&
      ![ 'return', 'throw', 'case', 'typeof', 'void', 'delete', 'new', 'in', 'of', 'instanceof', 'await', 'yield', 'const', 'let', 'var', 'function', 'class', 'else', 'import', 'export', 'from', 'as' ].includes(prevVal)
    ) {
      out = out.slice(0, -1);
    }
    out += t.value;
    prevVal = t.value;
    prevType = t.type;
  }
  return out.trim();
}

function resolveLocalModule(fromDir, spec) {
  const base = path.resolve(fromDir, spec);
  const candidates = [
    base,
    base.replace(/\.js$/, '.ts'),
    `${base}.ts`,
    `${base}.js`,
    path.join(base, 'index.ts')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  throw new Error(`Cannot resolve import "${spec}" from ${fromDir}`);
}

function parseModuleStructure(filePath) {
  const rawTs = fs.readFileSync(filePath, 'utf8').replace(/^#!.*\n/, '');
  const js = stripTypeScriptTypes(rawTs);

  const externalImports = [];
  const localImports = [];
  const reExports = [];
  const exportedNames = new Map(); // exportedAs -> localName
  const importedBindings = new Set();

  // Transform import/export declarations cleanly
  let body = js;

  // 1. Handle side-effect or named/default/namespace imports
  const importRegex = /^[ \t]*import\s+([^;'"]*?)\s+from\s+['"]([^'"]+)['"]\s*;?/gm;
  body = body.replace(importRegex, (_full, clauseRaw, spec) => {
    const clause = clauseRaw.trim();
    if (!clause) {
      // was `import type ...` stripped to empty clause or side-effect
      if (!spec.startsWith('.')) externalImports.push({ clause: null, spec });
      return '';
    }
    if (spec.startsWith('.')) {
      const target = resolveLocalModule(path.dirname(filePath), spec);
      localImports.push({ clause, target });
      collectClauseBindings(clause, importedBindings);
      return `__LOCAL_IMPORT_${localImports.length - 1}__;`;
    } else {
      externalImports.push({ clause, spec });
      collectClauseBindings(clause, importedBindings);
      return '';
    }
  });

  // Also strip leftover empty `import {} from '...'` produced by stripTypeScriptTypes
  body = body.replace(/^[ \t]*import\s*\{\s*,*\s*\}\s*from\s*['"][^'"]+['"]\s*;?/gm, '');

  // 2. Handle `export { ... } from '...'` and `export * from '...'`
  const reExportNamedRegex = /^[ \t]*export\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?/gm;
  body = body.replace(reExportNamedRegex, (_full, listRaw, spec) => {
    const items = parseSpecifierList(listRaw);
    if (items.length === 0) return '';
    const target = resolveLocalModule(path.dirname(filePath), spec);
    reExports.push({ star: false, items, target });
    return '';
  });

  const reExportStarRegex = /^[ \t]*export\s*\*\s*from\s*['"]([^'"]+)['"]\s*;?/gm;
  body = body.replace(reExportStarRegex, (_full, spec) => {
    const target = resolveLocalModule(path.dirname(filePath), spec);
    reExports.push({ star: true, items: [], target });
    return '';
  });

  // 3. Handle `export { a, b as c };`
  const localExportListRegex = /^[ \t]*export\s*\{([^}]*)\}\s*;?/gm;
  body = body.replace(localExportListRegex, (_full, listRaw) => {
    for (const item of parseSpecifierList(listRaw)) {
      exportedNames.set(item.exported, item.local);
    }
    return '';
  });

  // 4. Handle `export async function foo`, `export function foo`, `export class Foo`, `export const foo`
  body = body.replace(/^[ \t]*export\s+(async\s+function|function|class)\s+([A-Za-z0-9_$]+)/gm, (_f, kw, name) => {
    exportedNames.set(name, name);
    return `${kw} ${name}`;
  });

  body = body.replace(/^[ \t]*export\s+(const|let|var)\s+([A-Za-z0-9_$]+)/gm, (_f, kw, name) => {
    exportedNames.set(name, name);
    return `${kw} ${name}`;
  });

  const isCore = true;

  return {
    filePath,
    body,
    isCore,
    externalImports,
    localImports,
    reExports,
    exportedNames,
    importedBindings
  };
}

function parseSpecifierList(raw) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^([A-Za-z0-9_$]+)(?:\s+as\s+([A-Za-z0-9_$]+))?$/);
      if (!m) return null;
      return { local: m[1], exported: m[2] || m[1] };
    })
    .filter(Boolean);
}

function collectClauseBindings(clause, set) {
  const ns = clause.match(/^\*\s+as\s+([A-Za-z0-9_$]+)$/);
  if (ns) {
    set.add(ns[1]);
    return;
  }
  const braceStart = clause.indexOf('{');
  if (braceStart !== -1) {
    const before = clause.slice(0, braceStart).replace(',', '').trim();
    if (before) set.add(before);
    const inside = clause.slice(braceStart + 1, clause.lastIndexOf('}'));
    for (const item of parseSpecifierList(inside)) {
      set.add(item.exported);
    }
  } else if (clause) {
    set.add(clause.trim());
  }
}

function rewriteImportClauseToDestructure(clause, modVar) {
  const ns = clause.match(/^\*\s+as\s+([A-Za-z0-9_$]+)$/);
  if (ns) {
    return `const ${ns[1]} = ${modVar}`;
  }
  const braceStart = clause.indexOf('{');
  if (braceStart !== -1) {
    const parts = [];
    const before = clause.slice(0, braceStart).replace(',', '').trim();
    if (before) parts.push(`default: ${before}`);
    const inside = clause.slice(braceStart + 1, clause.lastIndexOf('}'));
    for (const item of parseSpecifierList(inside)) {
      if (item.local === item.exported) parts.push(item.local);
      else parts.push(`${item.local}: ${item.exported}`);
    }
    if (parts.length === 0) return '';
    return `const { ${parts.join(', ')} } = ${modVar}`;
  }
  return `const ${clause.trim()} = ${modVar}.default ?? ${modVar}`;
}

function bundleEntry(entryPath, isCli = false) {
  const visited = new Map(); // filePath -> parsed
  const order = [];

  function walk(fp) {
    if (visited.has(fp)) return;
    visited.set(fp, null);
    const parsed = parseModuleStructure(fp);
    visited.set(fp, parsed);
    for (const li of parsed.localImports) walk(li.target);
    for (const re of parsed.reExports) walk(re.target);
    order.push(fp);
  }

  walk(entryPath);

  // Assign opaque module variable names
  const modVars = new Map();
  order.forEach((fp, idx) => {
    const h = (deterministicHash(fp) & 0xfff).toString(16).padStart(3, '0');
    modVars.set(fp, `_$m${idx}_${h}`);
  });

  // Deduplicate external node:* imports using generated namespace aliases
  const extSpecToVar = new Map();
  const extLines = [];
  let extIdx = 0;

  for (const fp of order) {
    const mod = visited.get(fp);
    for (const ext of mod.externalImports) {
      if (!extSpecToVar.has(ext.spec)) {
        const v = `_$ext${extIdx++}`;
        extSpecToVar.set(ext.spec, v);
        extLines.push(`import * as ${v} from '${ext.spec}';`);
      }
    }
  }

  const moduleBlocks = [];
  for (const fp of order) {
    const mod = visited.get(fp);
    const modVar = modVars.get(fp);
    const extBindings = [];
    for (const ext of mod.externalImports) {
      if (ext.clause) {
        const stmt = rewriteImportClauseToDestructure(ext.clause, extSpecToVar.get(ext.spec));
        if (stmt) extBindings.push(`${stmt};`);
      }
    }

    let modBody = mod.body;
    mod.localImports.forEach((li, idx) => {
      const targetVar = modVars.get(li.target);
      const stmt = rewriteImportClauseToDestructure(li.clause, targetVar);
      modBody = modBody.replace(`__LOCAL_IMPORT_${idx}__;`, stmt ? `${stmt};` : '');
    });

    const localExportSet = new Set(mod.exportedNames.values());
    const salt = deterministicHash(fp);

    let processedBody;
    if (mod.isCore) {
      processedBody = obfuscateCoreModuleBody(modBody, salt, mod.importedBindings, localExportSet);
    } else {
      processedBody = renderCompactTokens(tokenizeJS(modBody));
    }

    // Build return object including local exports and re-exports
    const retParts = [];
    for (const re of mod.reExports) {
      const targetVar = modVars.get(re.target);
      if (re.star) {
        retParts.push(`...${targetVar}`);
      } else {
        for (const item of re.items) {
          retParts.push(`${item.exported}:${targetVar}.${item.local}`);
        }
      }
    }
    for (const [exported, local] of mod.exportedNames.entries()) {
      retParts.push(exported === local ? exported : `${exported}:${local}`);
    }

    const preamble = extBindings.length > 0 ? extBindings.join('\n') + '\n' : '';
    moduleBlocks.push(
      `const ${modVar}=(()=>{${preamble}${processedBody}\nreturn{${retParts.join(',')}};})();`
    );
  }

  // Compute all public exports of entryPath (including recursive export *)
  function collectPublicExports(fp, seen = new Set()) {
    if (seen.has(fp)) return new Set();
    seen.add(fp);
    const mod = visited.get(fp);
    const names = new Set(mod.exportedNames.keys());
    for (const re of mod.reExports) {
      if (re.star) {
        for (const k of collectPublicExports(re.target, seen)) names.add(k);
      } else {
        for (const item of re.items) names.add(item.exported);
      }
    }
    return names;
  }

  const entryVar = modVars.get(entryPath);
  const publicExports = Array.from(collectPublicExports(entryPath));
  const exportLines = publicExports.map((name) => `export const ${name}=${entryVar}.${name};`);

  const banner = isCli ? '#!/usr/bin/env node\n' : '';
  return [
    banner + extLines.join('\n'),
    ...moduleBlocks,
    ...exportLines
  ].filter(Boolean).join('\n') + '\n';
}

function buildAll() {
  if (!fs.existsSync(PACKAGES_DIR)) {
    console.log('No packages directory found yet.');
    return;
  }
  const pkgNames = fs.readdirSync(PACKAGES_DIR).sort();
  let builtCount = 0;

  for (const pkg of pkgNames) {
    const pkgDir = path.join(PACKAGES_DIR, pkg);
    if (!fs.statSync(pkgDir).isDirectory()) continue;

    const distDir = path.join(pkgDir, 'dist');
    fs.mkdirSync(distDir, { recursive: true });

    // Optional Go Wasm target
    const goWasmEntry = path.join(pkgDir, 'wasm', 'main.go');
    if (fs.existsSync(goWasmEntry)) {
      const wasmOut = path.join(distDir, 'redact-scanner.wasm');
      try {
        execFileSync(
          'go',
          ['build', '-ldflags=-s -w', '-trimpath', '-o', wasmOut, goWasmEntry],
          {
            cwd: path.dirname(goWasmEntry),
            env: { ...process.env, GOOS: 'wasip1', GOARCH: 'wasm' },
            stdio: 'inherit'
          }
        );
      } catch (err) {
        if (fs.existsSync(wasmOut)) {
          console.warn(`Go toolchain not found or failed; using existing ${wasmOut}`);
        } else {
          throw err;
        }
      }
    }

    const indexEntry = path.join(pkgDir, 'src', 'index.ts');
    if (fs.existsSync(indexEntry)) {
      const bundled = bundleEntry(indexEntry, false);
      fs.writeFileSync(path.join(distDir, 'index.mjs'), bundled, 'utf8');
      builtCount++;
    }

    const cliEntry = path.join(pkgDir, 'src', 'cli.ts');
    if (fs.existsSync(cliEntry)) {
      const bundledCli = bundleEntry(cliEntry, true);
      const outCli = path.join(distDir, 'cli.mjs');
      fs.writeFileSync(outCli, bundledCli, 'utf8');
      fs.chmodSync(outCli, 0o755);
    }
  }

  console.log(`Built ${builtCount} obfuscated package bundles.`);
}

buildAll();
