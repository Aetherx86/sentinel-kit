# Changelog

## 1.0.1

Fixed
- `tools/obfuscate.mjs`: identifiers used inside template literal expressions (`${...}`) kept their old names while their declarations were renamed, so a bundle threw a ReferenceError. Each expression is now renamed with the rest of the module, including nested templates.
