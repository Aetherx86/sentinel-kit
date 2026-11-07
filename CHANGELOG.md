# Changelog

## 1.0.2

Fixed
- Rebuilt every `dist/` bundle with the fixed obfuscator. The bundles shipped in 1.0.0 and 1.0.1 still held the old names inside `${...}`, so paths that reached them threw a ReferenceError, including file-to-package matching in `01-matrix-pruner`.

Added
- `test/obfuscate.test.ts`: covers template literal renaming and runs that path against the built bundle. `npm run test:dist` now runs every file in `test/`.

## 1.0.1

Fixed
- `tools/obfuscate.mjs`: identifiers used inside template literal expressions (`${...}`) kept their old names while their declarations were renamed, so a bundle threw a ReferenceError. Each expression is now renamed with the rest of the module, including nested templates.
