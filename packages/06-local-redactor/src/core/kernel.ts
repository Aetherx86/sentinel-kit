import type { CategoryCountMap, CustomRedactionRule, DetectedPiiSpan, PdfLineSpec, PiiCategory, RedactionOptions, SamplePdfOptions, TextRedactionResult } from '../types.ts';

const _S0 = 0x6a3c91d7;
const _XK = 0x5a3c9e71;

const _P0 = new Uint8Array([
  248,253,19,118,187,95,195,73,8,47,134,203,190,178,68,220,208,179,24,35,212,48,166,80,9,176,121,117,185,231,99,112,200,122,57,98,159,123,108,72,130,94,143,199,121,53,198,134,185,84,169,6,50,51,228,124,233,119,20,85,205,238,170,202,68,211,100,23,130,164,115,49,164,127,74,38,246,74,65,182,11,196,115,228,174,17,105,136,177,46,8,92,227,188,55,176,178,72,139,62,162,89,112,59,218,210,26,122,221,248,106,166,153,98,16,82,204,31,170,0,125,214,223,14,63,111,53,199,200,87,203,26,95,148,160,87,243,68,146,134,179,216,243,47,105,140,180,79,63,17,110,95,231,147,232,221,15,36,24,128,68,116,247,108,157,40,58,143,35,61,144,131,44,108,27,75,242,77,57,96,152,220,95,86,10,87,37,196,214,198,224,88,221,2,67,75,132,251,101,86,159,211,132,23,103,187,51,71,240,80,116,230,186,189,59,155,134,180,109,56,54,252,149,253,155,176,65,156,81,190,1,189,54,115,90,59,233,10,255,129,125,97,58,174,229,68,250,70,200,34,127,168,105,211,147,51,32,95,53,86,56,26,163,132,179,35,80,84,101,253,136,169,166,5,130,105,167,114,162,32,22,36,30,203,149,214,145,247,62,7,115,194,31,148,157,236,124,255,183,230,90,181,48,234,167,247,126,9,114,189,170,119,218,67,58,97,160,218,117,4,234,172,211,22,100,145,236,105,9,242,126,123,232,195,97,27,103,234,129,171,42,154,133,246,61,163,196,9,87,188,19,5,174,177,68,218,61,18,194,211,198,54,231,78,177,29,20,174,56,199,51,237,164,127,172,124,139,3,9,100,54,185,84,10,202,117,27,113,70,162,90,166,110,54,200,233,239,252,27,197,138,69,198,169,193,197,198,202,9,106,201,217,31,30,18,191,178,138,178,242,90,232,25,99,21,48,131,79,174,87,26,92,220,250,115,113,117,93,196,123,60,75,163,225,8,22,181,19,108,102,241,233,94,144,152,66,121,15,217,65,139,62,44,211,123,60,73,16,154,221,164,132,167,4,212,205,96,17,224,50,108,153,98,70,166,70,83,46,57,112,255,199,62,34,216,43,151,53,196,4,240,241,220,110,107,6,241,125,217,193,197,224,29,22,95,51,190,116,159,184,191,66,197,181,57,8,206,215,24,250,51,43,125,236,148,176,27,57,252,33,247,135,239,121,54,33,215,154,168,42,221,110,78,156,24,68,172,190,192,192,1,35,22,109,208,129,250,157,100,127,129,99,202,101,35,222,243,193,202,163,3,198,247,81,69,172,129,99,226,169,32,220,103,122,111,52,143,125,0,19,154,232,92,252,96,209,147,121,67,80,254,159,1,134,32,193,90,219,250,108,152,75,130,198,16,109,48,183,50,233,178,82,49,248,165,149,181,42,12,157,223,65,108,31,13,8,241,180,87,17,243,77,229,35,247,211,209,41,198,15,8,95,249,90,7,79,75,43,34,138,229,117,177,130,243,234,97,121,83,74,109,3,23,44,16,223,141,213,29,176,197,44,26,48,153,125,48,222,74,142,47,3,118,163,43,145,160,134,56,36,122,254,108,226,65,108,151,154,243,51,172,8,138,155,27,48,66,102,214,29,251,241,9,46,85,217,52,122,43,133,187,92,51,65,138,144,13,86,98,142,137,237,6,216,88,92,127,42,31,244,84,159,105,223,97,53,138,76,119,234,52,178,14,235,21,41,183,167,28,175,68,60,32,249,202,116,16,163,253,202,115,102,23,214,80,194,43,44,215,98,50,183,56,78,13,118,129,19,103,106,139,76,70,56,106,156,28,72,207,248,190,51,21,179,163,6,195,181,171,208,249,188,242,41,115,223,237,175,243,154,56,143,193,204,16,10,244,204,221,70,97,151,196,109,202,41,184,105,42,196,21,126,192,8,129,123,216,188,253,3,107,214,134,98,254,55,21,180,56,129,31,77,186,180,238,106,105,76,80,230,46,14,75,100,1,182,67,113,246,139,27,132,207,104,86,173,47,247,37,65,242,242,107,34,145,177,227,29,123,198,29,208,61,244,55,116,51,49,227,118,73,28,251,59,41,199,103,89,240,210,188,80,150,147,86,175,71,26,204,170,251,41,115,79,65,73,91,144,124,46,210,180,70,220,26,40,2,239,167,138,248,85,120,119,180,141,156,117,142,165,204,185,12,187,243,220,57,135,6,22,204,136,163,255,11,246,234,221,0,121,144,177,202,243,133,20,144,240,177,247,158,127,127,139,152,174,251,175,47,105,176,42,210,251,173,12,221,157,108,197,109,108,126,81,65,35,5,22,71,71,76,47,196,247,30,44,41,28,67,56,104,214,150,250,136,202,209,227,34,55,65,154,225,77,129,204,167,76,165,118,90,195,117,6,171,127,34,166,31,104,88,57,143,192,224,219,172,91,101,42,206,147,102,173,89,19,39,221,159,82,225,171,3,151,39,34,233,174,19,28,23,83,241,106,49,86,227,185,157,169,81,38,231,46,179,128,75,128,6,99,156,107,138,68,64,42,143,84,45,28,3,64,135,112,56,17,30,59,194,30,138,255,127,109,159,215,143,252,150,96,71,150,82,231,188,217,60,166,216,183,191,71,229,155,198,109,200,63,48,81,158,182,218,116,24,9,242,245,61,57,71,95,62,206,201,60,193,75,171,53,165,145,139,247,54,185,134,162,92,205,145,209,96,6,126,152,228,80,204,219,251,215,213,110,117,130,214,206,121,107,89,118,128,215,29,193,184,200,67,204,14,211,233,119,172,100,38,5,197,185,42,15,215,162,69,217,17,208,235,23,218,195,78,151,134,63,28,102,246,122,243,82,100,211,42,3,229,47,50,239,254,50,78,238,98,115,166,251,222,65,167,168,49,139,156,172,161,204,3,159,152,98,54,233,177,101,204,6,55,142,206,128,154,131,200,67,132,26,218,35,196,163,117,71,139,161,171,118,115,61,223,235,27,235,30,184,14,69,153,29,116,193,192,33,47,147,12,23,145,5,170,120,81,250,37,223,99,88,150,76,154,30,84,249,82,6,133,204,172,37,230,152,205,105,70,124,70,145,249,68,245,214,56,181,188,18,213,38,40,199,152,115,250,231,212,175,26,200,240,204,151,171,165,94,6,91,142,26,88,180,25,133,174,223,79,100,238,166,152,248,196,42,99,132,67,132,255,71,211,94,150,95,58,19,120,218,56,154,198,109,220,247,13,108,98,194,148,23,248,185,34,231,199,11,98,196,241,122,245,242,100,77,11,185,136,187,147,46,240,99,129,174,202,220,115,98,66,35,152,34,171,128,8,13,54,164,38,172,47,159,48,167,117,183,183,223,141,214,192,229,87,207,82,144,88,164,97,125,175,89,215,236,47,232,209,187,62,178,179,95,38,66,27,96,125,11,38,169,87,91,137,200,39,235,29,166,18,240,61,233,216,206,186,142,67,151,178,121,24,200,152,207,25,1,2,84,237,40,164,76,66,56,120,252,221,57,140,5,187,186,74,73,79,188,35,87,162,77,109,234,214,99,59,8,170,42,149,15,16,204,79,110,129,55,186,78,15,181,162,59,201,162,148,5,180,222,204,35,73,44,182,142,194,136,24,9,100,255,103,212,195,153,186,163,105,254,121,18,2,119,43,245,1,135,111,114,66,144,55,59,10,254,244,191,244,59,207,25,70,58,6,125,185,157,180,125,157,110,110,214,216,229,20,59,26,137,84,244,216,155,102,0,116,215,225,98,43
]);

const _O0 = new Uint32Array([
  0,3,6,9,20,24,29,34,46,56,62,72,73,74,145,219,316,368,431,499,542,637,691,886,1076,1182,1184,1185,1200,1205,1245,1247,1249,1260,1267,1274,1280,1289,1292,1298,1317,1324,1344,1354,1371,1378,1392,1399,1432,1473,1583,1637,1666,1669,1672
]);

const _L0 = new Uint32Array([
  3,3,3,11,4,5,5,12,10,6,10,1,1,71,74,97,52,63,68,43,95,54,195,190,106,2,1,15,5,40,2,2,11,7,7,6,9,3,6,19,7,20,10,17,7,14,7,33,41,110,54,29,3,3,5
]);

const _E0 = new Uint32Array([0x95cd620f, 0xa5c1618e, 0xa7c3a1ee, 0x5a3c9e7d]);
const _AB0 = new Uint32Array([0xa5dc818f, 0xba3c9e70, 0x5a3d9f8e, 0x5a3c9e71]);
const _PR0 = new Uint32Array([
  0x5a3c9e24, 0x5a3c9e37, 0x5a3c9e2b, 0x5a3c9e21, 0x5a3c9e2e,
  0x5a3c9e30, 0x5a3c9e4d, 0x5a3c9e43, 0x5a3c9e46, 0x5a3c9e15
]);

const _CH0 = new Uint32Array([
  0x43197e57, 0xe7371e3f, 0x940b0b4c, 0x9cef326c, 0x993ff665,
  0x4086f1a7, 0x0eb1608f, 0xcfb6357b, 0xfe66b29c, 0x835d03ee
]);

const _M0 = new Map<number, string>();
const _TD0 = new TextDecoder();

function _d0(_k0: number): string {
  const _hit = _M0.get(_k0);
  if (_hit !== undefined) return _hit;
  const _s1 = _O0[_k0];
  const _n1 = _L0[_k0];
  const _u1 = new Uint8Array(_n1);
  let _st0 = _S0 >>> 0;
  for (let _i0 = 0; _i0 < _s1 + _n1; _i0++) {
    _st0 = (_st0 + 0x9e3779b9) >>> 0;
    if (_i0 >= _s1) {
      let _z0 = _st0;
      _z0 = Math.imul(_z0 ^ (_z0 >>> 16), 0x85ebca6b) >>> 0;
      _z0 = Math.imul(_z0 ^ (_z0 >>> 13), 0xc2b2ae35) >>> 0;
      _z0 = (_z0 ^ (_z0 >>> 16)) >>> 0;
      _u1[_i0 - _s1] = _P0[_i0] ^ (_z0 & 0xff) ^ ((_i0 * 31) & 0xff);
    }
  }
  const _v0 = _TD0.decode(_u1);
  _M0.set(_k0, _v0);
  return _v0;
}

function _f0(_s2: string): number {
  let _h0 = 0x811c9dc5;
  for (let _i1 = 0; _i1 < _s2.length; _i1++) {
    _h0 ^= _s2.charCodeAt(_i1);
    _h0 = Math.imul(_h0, 0x01000193) >>> 0;
  }
  return _h0 >>> 0;
}

function _catIdx(_c0: string): number {
  const _h1 = _f0(_c0);
  for (let _j0 = 0; _j0 < _CH0.length; _j0++) {
    if (_CH0[_j0] === _h1) return _j0;
  }
  return 9;
}

export function validateSsnKernel(candidate: string): boolean {
  let _st = 1;
  let _ok = false;
  const _dg: number[] = [];

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (candidate.length === 9) {
          for (let _i = 0; _i < 9; _i++) {
            const _c = candidate.charCodeAt(_i);
            if (_c < 48 || _c > 57) {
              _st = 0;
              break;
            }
            _dg.push(_c - 48);
          }
          if (_dg.length === 9) _st = 2;
        } else if (candidate.length === 11) {
          const _sp = candidate.charCodeAt(3);
          if ((_sp !== 45 && _sp !== 32) || candidate.charCodeAt(6) !== _sp) {
            _st = 0;
            break;
          }
          for (let _i = 0; _i < 11; _i++) {
            if (_i === 3 || _i === 6) continue;
            const _c = candidate.charCodeAt(_i);
            if (_c < 48 || _c > 57) {
              _st = 0;
              break;
            }
            _dg.push(_c - 48);
          }
          if (_dg.length === 9) _st = 2;
        } else {
          _st = 0;
        }
        break;
      }
      case 2: {
        const _ar = _dg[0] * 100 + _dg[1] * 10 + _dg[2];
        const _gp = _dg[3] * 10 + _dg[4];
        const _sr = _dg[5] * 1000 + _dg[6] * 100 + _dg[7] * 10 + _dg[8];
        _ok = _ar !== 0 && _ar !== 666 && _ar < 900 && _gp !== 0 && _sr !== 0;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }
  return _ok;
}

export function validateEinKernel(candidate: string): boolean {
  let _st = 1;
  let _ok = false;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (candidate.length !== 10 || candidate.charCodeAt(2) !== 45) {
          _st = 0;
          break;
        }
        let _nz = false;
        for (let _i = 0; _i < 10; _i++) {
          if (_i === 2) continue;
          const _c = candidate.charCodeAt(_i);
          if (_c < 48 || _c > 57) {
            _st = 0;
            break;
          }
          if (_i > 2 && _c !== 48) _nz = true;
        }
        if (_st === 0 || !_nz) {
          _st = 0;
          break;
        }
        const _pf = (candidate.charCodeAt(0) - 48) * 10 + (candidate.charCodeAt(1) - 48);
        const _wd = (_E0[_pf >>> 5] ^ _XK) >>> 0;
        _ok = (_wd & (1 << (_pf & 31))) !== 0;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }
  return _ok;
}

export function validateLuhnKernel(candidate: string): boolean {
  let _st = 1;
  let _ok = false;
  const _dg: number[] = [];
  let _nz = false;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        for (let _i = 0; _i < candidate.length; _i++) {
          const _c = candidate.charCodeAt(_i);
          if (_c === 32 || _c === 45) continue;
          if (_c < 48 || _c > 57) {
            _st = 0;
            break;
          }
          const _v = _c - 48;
          if (_v !== 0) _nz = true;
          _dg.push(_v);
          if (_dg.length > 19) {
            _st = 0;
            break;
          }
        }
        if (_st !== 0) {
          _st = _dg.length >= 13 && _dg.length <= 19 && _nz ? 2 : 0;
        }
        break;
      }
      case 2: {
        let _sm = 0;
        let _al = false;
        for (let _j = _dg.length - 1; _j >= 0; _j--) {
          let _d = _dg[_j];
          if (_al) {
            _d *= 2;
            if (_d > 9) _d -= 9;
          }
          _sm += _d;
          _al = !_al;
        }
        _ok = _sm % 10 === 0;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }
  return _ok;
}

export function validateAbaKernel(candidate: string): boolean {
  let _st = 1;
  let _ok = false;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (candidate.length !== 9) {
          _st = 0;
          break;
        }
        const _d: number[] = [];
        let _nz = false;
        for (let _i = 0; _i < 9; _i++) {
          const _c = candidate.charCodeAt(_i);
          if (_c < 48 || _c > 57) {
            _st = 0;
            break;
          }
          const _v = _c - 48;
          if (_v !== 0) _nz = true;
          _d.push(_v);
        }
        if (_st === 0 || !_nz) {
          _st = 0;
          break;
        }
        const _ck = 3 * (_d[0] + _d[3] + _d[6]) + 7 * (_d[1] + _d[4] + _d[7]) + (_d[2] + _d[5] + _d[8]);
        _ok = _ck % 10 === 0;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }
  return _ok;
}

function _hasValidFedAbaPrefix(_s3: string): boolean {
  const _pf = (_s3.charCodeAt(0) - 48) * 10 + (_s3.charCodeAt(1) - 48);
  const _wd = (_AB0[_pf >>> 5] ^ _XK) >>> 0;
  return (_wd & (1 << (_pf & 31))) !== 0;
}

export function validateIbanKernel(candidate: string): boolean {
  let _st = 1;
  let _ok = false;
  let _cl = '';

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        for (let _i = 0; _i < candidate.length; _i++) {
          const _c = candidate.charCodeAt(_i);
          if (_c === 32) continue;
          if (!((_c >= 65 && _c <= 90) || (_c >= 48 && _c <= 57))) {
            _st = 0;
            break;
          }
          _cl += candidate[_i];
          if (_cl.length > 34) {
            _st = 0;
            break;
          }
        }
        if (_st !== 0) {
          _st = _cl.length >= 15 && _cl.length <= 34 ? 2 : 0;
        }
        break;
      }
      case 2: {
        const _c0 = _cl.charCodeAt(0);
        const _c1 = _cl.charCodeAt(1);
        const _c2 = _cl.charCodeAt(2);
        const _c3 = _cl.charCodeAt(3);
        if (_c0 < 65 || _c0 > 90 || _c1 < 65 || _c1 > 90 || _c2 < 48 || _c2 > 57 || _c3 < 48 || _c3 > 57) {
          _st = 0;
          break;
        }
        let _rm = 0;
        const _ln = _cl.length;
        for (let _k = 0; _k < _ln; _k++) {
          const _ch = _cl.charCodeAt((_k + 4) % _ln);
          if (_ch >= 48 && _ch <= 57) {
            _rm = (_rm * 10 + (_ch - 48)) % 97;
          } else {
            _rm = (_rm * 100 + (_ch - 55)) % 97;
          }
        }
        _ok = _rm === 1;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }
  return _ok;
}

export function maskBytesKernel(
  input: Uint8Array,
  maskByte: number,
  preserveDelims: boolean
): { output: Uint8Array; scrubbedBytes: number } {
  const _out = new Uint8Array(input.length);
  _out.set(input);
  let _cnt = 0;
  let _sd = (0x9e3779b9 ^ input.length) >>> 0;
  for (let _i = 0; _i < _out.length; _i++) {
    const _b = _out[_i];
    if (preserveDelims && (_b === 45 || _b === 32)) continue;
    if (maskByte !== 0) {
      _out[_i] = maskByte & 0xff;
    } else {
      _sd = (_sd + 0x9e3779b9) >>> 0;
      let _z = _sd;
      _z = Math.imul(_z ^ (_z >>> 16), 0x85ebca6b) >>> 0;
      _z = Math.imul(_z ^ (_z >>> 13), 0xc2b2ae35) >>> 0;
      _z = (_z ^ (_z >>> 16)) >>> 0;
      _out[_i] = (_z & 1) === 1 ? 35 : 88;
    }
    _cnt += 1;
  }
  return { output: _out, scrubbedBytes: _cnt };
}

function _escRx(_lit: string): string {
  return _lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function _mkRepl(_catIdx0: number, _spanLen: number, _customLabel: string | undefined, _opts?: RedactionOptions): string {
  const _style = _opts?.maskStyle ?? (_d0(28) as 'token');
  if (_f0(_style) === 0x61d87100) {
    const _mc = (_opts?.maskChar && _opts.maskChar.length > 0 ? _opts.maskChar[0] : _d0(12));
    return _mc.repeat(Math.max(1, _spanLen));
  }
  const _tag = _catIdx0 === 9 && _customLabel ? _d0(9) + ':' + _customLabel.toUpperCase() : _d0(_catIdx0);
  return _d0(10) + _tag + _d0(11);
}

interface _RawCand {
  s: number;
  e: number;
  ci: number;
  rid: string;
  lbl?: string;
}

export function detectPiiSpansKernel(text: string, options?: RedactionOptions): DetectedPiiSpan[] {
  if (!text || text.length === 0) return [];
  let _st = 1;
  const _cands: _RawCand[] = [];
  const _allow = new Set<number>();

  if (options?.categories && options.categories.length > 0) {
    for (let _i = 0; _i < options.categories.length; _i++) {
      _allow.add(_catIdx(options.categories[_i]));
    }
  } else {
    for (let _i = 0; _i < 10; _i++) _allow.add(_i);
  }

  let _resolved: DetectedPiiSpan[] = [];

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (_allow.has(0)) {
          const _r1 = new RegExp(_d0(13), _d0(26));
          let _m1: RegExpExecArray | null;
          while ((_m1 = _r1.exec(text)) !== null) {
            if (validateSsnKernel(_m1[0])) {
              _cands.push({ s: _m1.index, e: _m1.index + _m1[0].length, ci: 0, rid: _d0(0) });
            }
          }
          const _r2 = new RegExp(_d0(14), _d0(25));
          let _m2: RegExpExecArray | null;
          while ((_m2 = _r2.exec(text)) !== null) {
            const _g = _m2[1];
            if (validateSsnKernel(_g)) {
              const _ofs = _m2[0].lastIndexOf(_g);
              _cands.push({ s: _m2.index + _ofs, e: _m2.index + _ofs + _g.length, ci: 0, rid: _d0(0) });
            }
          }
        }
        if (_allow.has(1)) {
          const _r3 = new RegExp(_d0(15), _d0(25));
          let _m3: RegExpExecArray | null;
          while ((_m3 = _r3.exec(text)) !== null) {
            const _g = _m3[1];
            if (validateEinKernel(_g)) {
              const _ofs = _m3[0].lastIndexOf(_g);
              _cands.push({ s: _m3.index + _ofs, e: _m3.index + _ofs + _g.length, ci: 1, rid: _d0(1) });
            }
          }
          const _r4 = new RegExp(_d0(16), _d0(26));
          let _m4: RegExpExecArray | null;
          while ((_m4 = _r4.exec(text)) !== null) {
            if (validateEinKernel(_m4[0])) {
              _cands.push({ s: _m4.index, e: _m4.index + _m4[0].length, ci: 1, rid: _d0(1) });
            }
          }
        }
        if (_allow.has(2)) {
          const _r5 = new RegExp(_d0(17), _d0(26));
          let _m5: RegExpExecArray | null;
          while ((_m5 = _r5.exec(text)) !== null) {
            if (validateLuhnKernel(_m5[0])) {
              _cands.push({ s: _m5.index, e: _m5.index + _m5[0].length, ci: 2, rid: _d0(2) });
            }
          }
        }
        _st = 2;
        break;
      }
      case 2: {
        if (_allow.has(3)) {
          const _r6 = new RegExp(_d0(18), _d0(25));
          let _m6: RegExpExecArray | null;
          while ((_m6 = _r6.exec(text)) !== null) {
            const _g = _m6[1];
            if (validateAbaKernel(_g)) {
              const _ofs = _m6[0].lastIndexOf(_g);
              _cands.push({ s: _m6.index + _ofs, e: _m6.index + _ofs + _g.length, ci: 3, rid: _d0(3) });
            }
          }
          const _r7 = new RegExp(_d0(19), _d0(26));
          const _ssnCtx = new RegExp(_d0(29), 'i');
          let _m7: RegExpExecArray | null;
          while ((_m7 = _r7.exec(text)) !== null) {
            const _pre = text.slice(Math.max(0, _m7.index - 28), _m7.index);
            if (!_ssnCtx.test(_pre) && validateAbaKernel(_m7[0]) && _hasValidFedAbaPrefix(_m7[0])) {
              _cands.push({ s: _m7.index, e: _m7.index + _m7[0].length, ci: 3, rid: _d0(3) });
            }
          }
        }
        if (_allow.has(4)) {
          const _r8 = new RegExp(_d0(20), _d0(26));
          let _m8: RegExpExecArray | null;
          while ((_m8 = _r8.exec(text)) !== null) {
            if (validateIbanKernel(_m8[0])) {
              _cands.push({ s: _m8.index, e: _m8.index + _m8[0].length, ci: 4, rid: _d0(4) });
            }
          }
        }
        if (_allow.has(5)) {
          const _r9 = new RegExp(_d0(21), _d0(26));
          let _m9: RegExpExecArray | null;
          while ((_m9 = _r9.exec(text)) !== null) {
            _cands.push({ s: _m9.index, e: _m9.index + _m9[0].length, ci: 5, rid: _d0(5) });
          }
        }
        if (_allow.has(6)) {
          const _r10 = new RegExp(_d0(22), _d0(26));
          let _m10: RegExpExecArray | null;
          while ((_m10 = _r10.exec(text)) !== null) {
            _cands.push({ s: _m10.index, e: _m10.index + _m10[0].length, ci: 6, rid: _d0(6) });
          }
        }
        if (_allow.has(7)) {
          const _r11 = new RegExp(_d0(23), _d0(26));
          let _m11: RegExpExecArray | null;
          while ((_m11 = _r11.exec(text)) !== null) {
            const _g = _m11[1].trim();
            if (_g.length >= 2) {
              const _ofs = _m11[0].lastIndexOf(_g);
              _cands.push({ s: _m11.index + _ofs, e: _m11.index + _ofs + _g.length, ci: 7, rid: _d0(7) });
            }
          }
        }
        if (_allow.has(8)) {
          const _r12 = new RegExp(_d0(24), _d0(25));
          let _m12: RegExpExecArray | null;
          while ((_m12 = _r12.exec(text)) !== null) {
            const _g = _m12[1];
            const _ofs = _m12[0].lastIndexOf(_g);
            _cands.push({ s: _m12.index + _ofs, e: _m12.index + _ofs + _g.length, ci: 8, rid: _d0(8) });
          }
        }
        _st = 3;
        break;
      }
      case 3: {
        const _rules: CustomRedactionRule[] = options?.customRules ?? [];
        if (_rules.length > 0 && _allow.has(9)) {
          for (let _ri = 0; _ri < _rules.length; _ri++) {
            const _rl = _rules[_ri];
            const _fl = _rl.caseInsensitive ? _d0(25) : _d0(26);
            const _rx = _rl.pattern instanceof RegExp
              ? new RegExp(_rl.pattern.source, _rl.pattern.flags.indexOf('g') === -1 ? _rl.pattern.flags + 'g' : _rl.pattern.flags)
              : new RegExp(_rl.literal ? _escRx(_rl.pattern) : _rl.pattern, _fl);
            let _mc: RegExpExecArray | null;
            while ((_mc = _rx.exec(text)) !== null) {
              if (_mc[0].length === 0) {
                _rx.lastIndex += 1;
                continue;
              }
              _cands.push({
                s: _mc.index,
                e: _mc.index + _mc[0].length,
                ci: 9,
                rid: _rl.id,
                lbl: _rl.label ?? _rl.id
              });
            }
          }
        }
        _st = 4;
        break;
      }
      case 4: {
        _cands.sort((_a, _b) => {
          const _la = _a.e - _a.s;
          const _lb = _b.e - _b.s;
          if (_lb !== _la) return _lb - _la;
          const _pa = (_PR0[_a.ci] ^ _XK) >>> 0;
          const _pb = (_PR0[_b.ci] ^ _XK) >>> 0;
          if (_pb !== _pa) return _pb - _pa;
          return _a.s - _b.s;
        });

        const _picked: _RawCand[] = [];
        for (let _i = 0; _i < _cands.length; _i++) {
          const _c = _cands[_i];
          let _ov = false;
          for (let _j = 0; _j < _picked.length; _j++) {
            const _p = _picked[_j];
            if (_c.s < _p.e && _p.s < _c.e) {
              _ov = true;
              break;
            }
          }
          if (!_ov) _picked.push(_c);
        }

        _picked.sort((_a, _b) => _a.s - _b.s);
        _resolved = _picked.map((_p) => ({
          start: _p.s,
          end: _p.e,
          category: _d0(_p.ci) as PiiCategory,
          ruleId: _p.rid,
          replacement: _mkRepl(_p.ci, _p.e - _p.s, _p.lbl, options)
        }));
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }

  return _resolved;
}

export function redactTextKernel(text: string, options?: RedactionOptions): TextRedactionResult {
  const _sp = detectPiiSpansKernel(text, options);
  if (_sp.length === 0) {
    return {
      redactedText: text,
      totalRedactions: 0,
      categoryCounts: {},
      spans: []
    };
  }
  const _counts: CategoryCountMap = {};
  let _out = '';
  let _cur = 0;
  for (let _i = 0; _i < _sp.length; _i++) {
    const _s = _sp[_i];
    _out += text.slice(_cur, _s.start) + _s.replacement;
    _cur = _s.end;
    _counts[_s.category] = (_counts[_s.category] ?? 0) + 1;
  }
  _out += text.slice(_cur);
  return {
    redactedText: _out,
    totalRedactions: _sp.length,
    categoryCounts: _counts,
    spans: _sp.map((_x) => ({
      start: _x.start,
      end: _x.end,
      category: _x.category,
      ruleId: _x.ruleId
    }))
  };
}

function _isPdfWs(_c: number): boolean {
  return _c === 0 || _c === 9 || _c === 10 || _c === 12 || _c === 13 || _c === 32;
}

function _isPdfDelim(_c: number): boolean {
  return (
    _c === 40 || _c === 41 || _c === 60 || _c === 62 ||
    _c === 91 || _c === 93 || _c === 123 || _c === 125 ||
    _c === 47 || _c === 37
  );
}

function _encPdfLit(_val: string): string {
  let _r = '';
  for (let _i = 0; _i < _val.length; _i++) {
    const _c = _val.charCodeAt(_i);
    if (_c === 92) _r += '\\\\';
    else if (_c === 40) _r += '\\(';
    else if (_c === 41) _r += '\\)';
    else if (_c === 13) _r += '\\r';
    else if (_c === 10) _r += '\\n';
    else _r += _val[_i];
  }
  return _r;
}

function _readPdfLit(_src: string, _pos: number): { raw: string; decoded: string; next: number } {
  let _i = _pos + 1;
  let _dp = 1;
  let _dec = '';
  const _n = _src.length;

  while (_i < _n && _dp > 0) {
    const _c = _src.charCodeAt(_i);
    if (_c === 92) {
      _i += 1;
      if (_i >= _n) break;
      const _e = _src.charCodeAt(_i);
      if (_e === 110) { _dec += '\n'; _i += 1; }
      else if (_e === 114) { _dec += '\r'; _i += 1; }
      else if (_e === 116) { _dec += '\t'; _i += 1; }
      else if (_e === 98) { _dec += '\b'; _i += 1; }
      else if (_e === 102) { _dec += '\f'; _i += 1; }
      else if (_e === 40) { _dec += '('; _i += 1; }
      else if (_e === 41) { _dec += ')'; _i += 1; }
      else if (_e === 92) { _dec += '\\'; _i += 1; }
      else if (_e === 13) {
        _i += 1;
        if (_i < _n && _src.charCodeAt(_i) === 10) _i += 1;
      } else if (_e === 10) {
        _i += 1;
      } else if (_e >= 48 && _e <= 55) {
        let _oct = _src[_i];
        _i += 1;
        for (let _k = 0; _k < 2 && _i < _n; _k++) {
          const _oc = _src.charCodeAt(_i);
          if (_oc >= 48 && _oc <= 55) {
            _oct += _src[_i];
            _i += 1;
          } else {
            break;
          }
        }
        _dec += String.fromCharCode(Number.parseInt(_oct, 8) & 0xff);
      } else {
        _dec += _src[_i];
        _i += 1;
      }
    } else if (_c === 40) {
      _dp += 1;
      _dec += '(';
      _i += 1;
    } else if (_c === 41) {
      _dp -= 1;
      if (_dp > 0) _dec += ')';
      _i += 1;
    } else {
      _dec += _src[_i];
      _i += 1;
    }
  }
  return { raw: _src.slice(_pos, _i), decoded: _dec, next: _i };
}

function _readPdfHex(_src: string, _pos: number): { raw: string; decoded: string; next: number } {
  let _i = _pos + 1;
  const _n = _src.length;
  let _hx = '';
  while (_i < _n && _src.charCodeAt(_i) !== 62) {
    const _ch = _src[_i];
    if (/[0-9A-Fa-f]/.test(_ch)) _hx += _ch;
    _i += 1;
  }
  if (_i < _n && _src.charCodeAt(_i) === 62) _i += 1;
  if ((_hx.length & 1) === 1) _hx += '0';
  let _dec = '';
  for (let _j = 0; _j < _hx.length; _j += 2) {
    _dec += String.fromCharCode(Number.parseInt(_hx.slice(_j, _j + 2), 16));
  }
  return { raw: _src.slice(_pos, _i), decoded: _dec, next: _i };
}

interface _ArrElem {
  isStr: boolean;
  raw: string;
  decoded: string;
}

function _readPdfArr(_src: string, _pos: number): { raw: string; elems: _ArrElem[]; next: number } {
  let _i = _pos + 1;
  const _n = _src.length;
  const _els: _ArrElem[] = [];

  while (_i < _n) {
    const _c = _src.charCodeAt(_i);
    if (_isPdfWs(_c)) {
      _i += 1;
      continue;
    }
    if (_c === 93) {
      _i += 1;
      break;
    }
    if (_c === 37) {
      while (_i < _n && _src.charCodeAt(_i) !== 10 && _src.charCodeAt(_i) !== 13) _i += 1;
      continue;
    }
    if (_c === 40) {
      const _lit = _readPdfLit(_src, _i);
      _els.push({ isStr: true, raw: _lit.raw, decoded: _lit.decoded });
      _i = _lit.next;
      continue;
    }
    if (_c === 60 && _src.charCodeAt(_i + 1) !== 60) {
      const _hx = _readPdfHex(_src, _i);
      _els.push({ isStr: true, raw: _hx.raw, decoded: _hx.decoded });
      _i = _hx.next;
      continue;
    }
    const _wsStart = _i;
    if (_isPdfDelim(_c)) {
      _i += 1;
    } else {
      while (_i < _n && !_isPdfWs(_src.charCodeAt(_i)) && !_isPdfDelim(_src.charCodeAt(_i))) _i += 1;
    }
    _els.push({ isStr: false, raw: _src.slice(_wsStart, _i), decoded: '' });
  }
  return { raw: _src.slice(_pos, _i), elems: _els, next: _i };
}

interface _StmTok {
  kind: number;
  raw: string;
  decoded: string;
  elems?: _ArrElem[];
}

export function rewritePdfStreamKernel(
  streamLatin1: string,
  options?: RedactionOptions
): { rewrittenLatin1: string; totalRedactions: number; categoryCounts: CategoryCountMap } {
  let _st = 1;
  const _toks: _StmTok[] = [];
  const _counts: CategoryCountMap = {};
  let _tot = 0;
  let _i = 0;
  const _n = streamLatin1.length;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        while (_i < _n) {
          const _c = streamLatin1.charCodeAt(_i);
          if (_isPdfWs(_c)) {
            const _s = _i;
            while (_i < _n && _isPdfWs(streamLatin1.charCodeAt(_i))) _i += 1;
            _toks.push({ kind: 0, raw: streamLatin1.slice(_s, _i), decoded: '' });
            continue;
          }
          if (_c === 37) {
            const _s = _i;
            while (_i < _n && streamLatin1.charCodeAt(_i) !== 10 && streamLatin1.charCodeAt(_i) !== 13) _i += 1;
            _toks.push({ kind: 0, raw: streamLatin1.slice(_s, _i), decoded: '' });
            continue;
          }
          if (_c === 40) {
            const _lit = _readPdfLit(streamLatin1, _i);
            _toks.push({ kind: 1, raw: _lit.raw, decoded: _lit.decoded });
            _i = _lit.next;
            continue;
          }
          if (_c === 60 && streamLatin1.charCodeAt(_i + 1) === 60) {
            _toks.push({ kind: 0, raw: '<<', decoded: '' });
            _i += 2;
            continue;
          }
          if (_c === 62 && streamLatin1.charCodeAt(_i + 1) === 62) {
            _toks.push({ kind: 0, raw: '>>', decoded: '' });
            _i += 2;
            continue;
          }
          if (_c === 60) {
            const _hx = _readPdfHex(streamLatin1, _i);
            _toks.push({ kind: 1, raw: _hx.raw, decoded: _hx.decoded });
            _i = _hx.next;
            continue;
          }
          if (_c === 91) {
            const _ar = _readPdfArr(streamLatin1, _i);
            _toks.push({ kind: 2, raw: _ar.raw, decoded: '', elems: _ar.elems });
            _i = _ar.next;
            continue;
          }
          if (_c === 47) {
            const _s = _i;
            _i += 1;
            while (_i < _n && !_isPdfWs(streamLatin1.charCodeAt(_i)) && !_isPdfDelim(streamLatin1.charCodeAt(_i))) _i += 1;
            _toks.push({ kind: 0, raw: streamLatin1.slice(_s, _i), decoded: '' });
            continue;
          }
          if (_isPdfDelim(_c)) {
            _toks.push({ kind: 0, raw: streamLatin1[_i], decoded: '' });
            _i += 1;
            continue;
          }

          const _s = _i;
          while (_i < _n && !_isPdfWs(streamLatin1.charCodeAt(_i)) && !_isPdfDelim(streamLatin1.charCodeAt(_i))) _i += 1;
          const _wd = streamLatin1.slice(_s, _i);
          _toks.push({ kind: 3, raw: _wd, decoded: '' });
        }
        _st = 2;
        break;
      }
      case 2: {
        for (let _ti = 0; _ti < _toks.length; _ti++) {
          const _tk = _toks[_ti];
          if (_tk.kind !== 3) continue;
          const _opH = _f0(_tk.raw);

          if (_opH === 0x3ef5918b || _opH === 0x220c8ac6 || _opH === 0x270c92a5) {
            let _prevIdx = _ti - 1;
            while (_prevIdx >= 0 && _toks[_prevIdx].kind === 0) _prevIdx -= 1;
            if (_prevIdx >= 0 && _toks[_prevIdx].kind === 1) {
              const _res = redactTextKernel(_toks[_prevIdx].decoded, options);
              if (_res.totalRedactions > 0) {
                _toks[_prevIdx].raw = '(' + _encPdfLit(_res.redactedText) + ')';
                _toks[_prevIdx].decoded = _res.redactedText;
                _tot += _res.totalRedactions;
                const _ks = Object.keys(_res.categoryCounts) as PiiCategory[];
                for (let _k = 0; _k < _ks.length; _k++) {
                  const _cat = _ks[_k];
                  _counts[_cat] = (_counts[_cat] ?? 0) + (_res.categoryCounts[_cat] ?? 0);
                }
              }
            }
          } else if (_opH === 0x1ef55f2b) {
            let _prevIdx = _ti - 1;
            while (_prevIdx >= 0 && _toks[_prevIdx].kind === 0) _prevIdx -= 1;
            if (_prevIdx >= 0 && _toks[_prevIdx].kind === 2 && _toks[_prevIdx].elems) {
              const _els = _toks[_prevIdx].elems!;
              let _joined = '';
              for (let _ei = 0; _ei < _els.length; _ei++) {
                if (_els[_ei].isStr) _joined += _els[_ei].decoded;
              }
              const _spans = detectPiiSpansKernel(_joined, options);
              if (_spans.length > 0) {
                for (let _si = 0; _si < _spans.length; _si++) {
                  const _cat = _spans[_si].category;
                  _counts[_cat] = (_counts[_cat] ?? 0) + 1;
                }
                _tot += _spans.length;

                const _rebuiltParts: string[] = [];
                let _cur = 0;
                for (let _ei = 0; _ei < _els.length; _ei++) {
                  const _el = _els[_ei];
                  if (_el.isStr) {
                    const _segStart = _cur;
                    const _segEnd = _cur + _el.decoded.length;
                    _cur = _segEnd;
                    let _segOut = '';
                    for (let _p = _segStart; _p < _segEnd; _p++) {
                      let _matchedSpan: DetectedPiiSpan | null = null;
                      for (let _si = 0; _si < _spans.length; _si++) {
                        if (_p >= _spans[_si].start && _p < _spans[_si].end) {
                          _matchedSpan = _spans[_si];
                          break;
                        }
                      }
                      if (_matchedSpan) {
                        if (_p === _matchedSpan.start) _segOut += _matchedSpan.replacement;
                      } else {
                        _segOut += _el.decoded[_p - _segStart];
                      }
                    }
                    if (_segOut.length > 0) {
                      _rebuiltParts.push('(' + _encPdfLit(_segOut) + ')');
                    }
                  } else {
                    let _insideSpan = false;
                    for (let _si = 0; _si < _spans.length; _si++) {
                      if (_cur > _spans[_si].start && _cur < _spans[_si].end) {
                        _insideSpan = true;
                        break;
                      }
                    }
                    if (!_insideSpan) _rebuiltParts.push(_el.raw);
                  }
                }
                _toks[_prevIdx].raw = '[' + _rebuiltParts.join(' ') + ']';
              }
            }
          }
        }
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }

  let _final = '';
  for (let _ti = 0; _ti < _toks.length; _ti++) _final += _toks[_ti].raw;
  return {
    rewrittenLatin1: _final,
    totalRedactions: _tot,
    categoryCounts: _counts
  };
}

function _scrubDictLiterals(_dictText: string, _opts: RedactionOptions | undefined, _counts: CategoryCountMap): { text: string; hits: number } {
  let _out = '';
  let _i = 0;
  let _hits = 0;
  while (_i < _dictText.length) {
    if (_dictText.charCodeAt(_i) === 40) {
      const _lit = _readPdfLit(_dictText, _i);
      const _res = redactTextKernel(_lit.decoded, _opts);
      if (_res.totalRedactions > 0) {
        _out += '(' + _encPdfLit(_res.redactedText) + ')';
        _hits += _res.totalRedactions;
        const _ks = Object.keys(_res.categoryCounts) as PiiCategory[];
        for (let _k = 0; _k < _ks.length; _k++) {
          const _cat = _ks[_k];
          _counts[_cat] = (_counts[_cat] ?? 0) + (_res.categoryCounts[_cat] ?? 0);
        }
      } else {
        _out += _lit.raw;
      }
      _i = _lit.next;
    } else {
      _out += _dictText[_i];
      _i += 1;
    }
  }
  return { text: _out, hits: _hits };
}

interface _ParsedPdfObj {
  id: number;
  gen: number;
  headText: string;
  streamBytes: Uint8Array | null;
}

export function rebuildPdfBinaryKernel(
  pdfBytes: Uint8Array,
  inflateFn: (data: Uint8Array) => Uint8Array,
  deflateFn: (data: Uint8Array) => Uint8Array,
  options?: RedactionOptions
): {
  outputBytes: Uint8Array;
  totalRedactions: number;
  categoryCounts: CategoryCountMap;
  streamsInspected: number;
  streamsModified: number;
} {
  const _latin = Buffer.from(pdfBytes).toString('latin1');
  const _objs = new Map<number, _ParsedPdfObj>();
  const _counts: CategoryCountMap = {};
  let _tot = 0;
  let _inspected = 0;
  let _modified = 0;
  let _maxId = 0;

  const _objHdrRx = /(\d+)\s+(\d+)\s+obj\b/g;
  const _kwStream = _d0(35);
  const _kwEndStream = _d0(36);
  const _kwEndObj = _d0(38);
  const _kwFlate = _d0(32);
  const _kwLen = _d0(34);

  let _m: RegExpExecArray | null;
  while ((_m = _objHdrRx.exec(_latin)) !== null) {
    const _id = Number.parseInt(_m[1], 10);
    const _gen = Number.parseInt(_m[2], 10);
    if (_id > _maxId) _maxId = _id;
    const _bodyStart = _m.index + _m[0].length;

    const _nextEndObj = _latin.indexOf(_kwEndObj, _bodyStart);
    if (_nextEndObj === -1) break;

    const _dictSlice = _latin.slice(_bodyStart, _nextEndObj);
    const _dictClose = _dictSlice.lastIndexOf('>>');
    let _stmKeywordRel = -1;
    if (_dictClose !== -1) {
      const _afterDict = _dictSlice.slice(_dictClose + 2);
      const _sm = /^\s*stream(?:\r\n|\n)/.exec(_afterDict);
      if (_sm) {
        _stmKeywordRel = _dictClose + 2 + _sm[0].length;
      }
    }

    if (_stmKeywordRel !== -1) {
      const _stmDataStart = _bodyStart + _stmKeywordRel;
      let _dictPart = _dictSlice.slice(0, _dictClose + 2).trim();
      const _lenMatch = new RegExp(_kwLen + '\\s+(\\d+)').exec(_dictPart);
      let _stmDataEnd = -1;
      let _endObjPos = _nextEndObj;

      if (_lenMatch) {
        const _declLen = Number.parseInt(_lenMatch[1], 10);
        const _candEnd = _stmDataStart + _declLen;
        const _esAfter = _latin.indexOf(_kwEndStream, _candEnd);
        if (_esAfter !== -1 && _esAfter - _candEnd <= 4) {
          _stmDataEnd = _candEnd;
          _endObjPos = _latin.indexOf(_kwEndObj, _esAfter + _kwEndStream.length);
        }
      }
      if (_stmDataEnd === -1) {
        const _esIdx = _latin.indexOf(_kwEndStream, _stmDataStart);
        if (_esIdx !== -1) {
          _stmDataEnd = _esIdx;
          if (_latin.charCodeAt(_stmDataEnd - 1) === 10) _stmDataEnd -= 1;
          if (_latin.charCodeAt(_stmDataEnd - 1) === 13) _stmDataEnd -= 1;
          _endObjPos = _latin.indexOf(_kwEndObj, _esIdx + _kwEndStream.length);
        }
      }

      if (_stmDataEnd !== -1 && _endObjPos !== -1) {
        _inspected += 1;
        const _rawSlice = pdfBytes.subarray(_stmDataStart, _stmDataEnd);
        const _isFlate = _dictPart.indexOf(_kwFlate) !== -1;
        const _uncompBytes = _isFlate ? inflateFn(_rawSlice) : _rawSlice;
        const _uncompLatin = Buffer.from(_uncompBytes).toString('latin1');

        const _rw = rewritePdfStreamKernel(_uncompLatin, options);
        let _finalStmBytes: Uint8Array;
        if (_rw.totalRedactions > 0) {
          _modified += 1;
          _tot += _rw.totalRedactions;
          const _ks = Object.keys(_rw.categoryCounts) as PiiCategory[];
          for (let _k = 0; _k < _ks.length; _k++) {
            const _cat = _ks[_k];
            _counts[_cat] = (_counts[_cat] ?? 0) + (_rw.categoryCounts[_cat] ?? 0);
          }
          const _rwBuf = Buffer.from(_rw.rewrittenLatin1, 'latin1');
          _finalStmBytes = _isFlate ? deflateFn(_rwBuf) : _rwBuf;
        } else {
          _finalStmBytes = _isFlate ? deflateFn(_uncompBytes) : _uncompBytes;
        }

        if (new RegExp(_kwLen + '\\s+\\d+').test(_dictPart)) {
          _dictPart = _dictPart.replace(new RegExp(_kwLen + '\\s+\\d+'), _kwLen + ' ' + String(_finalStmBytes.byteLength));
        } else {
          _dictPart = _dictPart.slice(0, -2) + ' ' + _kwLen + ' ' + String(_finalStmBytes.byteLength) + ' >>';
        }

        _objs.set(_id, {
          id: _id,
          gen: _gen,
          headText: _dictPart,
          streamBytes: _finalStmBytes
        });
        _objHdrRx.lastIndex = _endObjPos + _kwEndObj.length;
        continue;
      }
    }

    const _scrubbed = _scrubDictLiterals(_dictSlice.trim(), options, _counts);
    _tot += _scrubbed.hits;
    _objs.set(_id, {
      id: _id,
      gen: _gen,
      headText: _scrubbed.text,
      streamBytes: null
    });
    _objHdrRx.lastIndex = _nextEndObj + _kwEndObj.length;
  }

  const _rootMatch = new RegExp(_d0(54) + '\\s+(\\d+\\s+\\d+\\s+R)').exec(_latin);
  const _rootRef = _rootMatch ? _rootMatch[1] : '1 0 R';

  const _chunks: Buffer[] = [];
  let _pos = 0;
  const _pushStr = (_s: string): void => {
    const _b = Buffer.from(_s, 'latin1');
    _chunks.push(_b);
    _pos += _b.byteLength;
  };
  const _pushBuf = (_b: Uint8Array): void => {
    const _bf = Buffer.from(_b);
    _chunks.push(_bf);
    _pos += _bf.byteLength;
  };

  _pushStr(_d0(39));
  const _offsets = new Array<number>(_maxId + 1).fill(0);

  for (let _oid = 1; _oid <= _maxId; _oid++) {
    const _ob = _objs.get(_oid);
    if (!_ob) continue;
    _offsets[_oid] = _pos;
    _pushStr(String(_ob.id) + ' ' + String(_ob.gen) + ' ' + _d0(37) + '\n');
    _pushStr(_ob.headText + '\n');
    if (_ob.streamBytes !== null) {
      _pushStr(_kwStream + '\n');
      _pushBuf(_ob.streamBytes);
      _pushStr('\n' + _kwEndStream + '\n');
    }
    _pushStr(_kwEndObj + '\n');
  }

  const _xrefStart = _pos;
  _pushStr(_d0(40) + String(_maxId + 1) + '\n');
  _pushStr(_d0(41));
  for (let _oid = 1; _oid <= _maxId; _oid++) {
    if (_objs.has(_oid)) {
      _pushStr(String(_offsets[_oid]).padStart(10, '0') + _d0(42));
    } else {
      _pushStr(_d0(41));
    }
  }
  _pushStr(_d0(43) + String(_maxId + 1) + _d0(44) + _rootRef + _d0(45) + String(_xrefStart) + _d0(46));

  return {
    outputBytes: Buffer.concat(_chunks),
    totalRedactions: _tot,
    categoryCounts: _counts,
    streamsInspected: _inspected,
    streamsModified: _modified
  };
}

export function buildSamplePdfKernel(
  options: SamplePdfOptions,
  deflateFn: (data: Uint8Array) => Uint8Array
): Buffer {
  const _ops: string[] = [_d0(51)];
  for (let _i = 0; _i < options.lines.length; _i++) {
    const _ln: PdfLineSpec = options.lines[_i];
    if (typeof _ln === 'string') {
      _ops.push('(' + _encPdfLit(_ln) + ') ' + _d0(30) + '\n');
    } else {
      const _arr: string[] = [];
      for (let _j = 0; _j < _ln.length; _j++) {
        const _el = _ln[_j];
        if (typeof _el === 'number') _arr.push(String(_el));
        else _arr.push('(' + _encPdfLit(_el) + ')');
      }
      _ops.push('[' + _arr.join(' ') + '] ' + _d0(31) + '\n');
    }
    if (_i + 1 < options.lines.length) _ops.push(_d0(53));
  }
  _ops.push(_d0(52));

  const _rawContent = Buffer.from(_ops.join(''), 'latin1');
  const _bodyBytes = options.compress ? deflateFn(_rawContent) : _rawContent;
  const _dict5 = options.compress
    ? '<< ' + _d0(33) + ' /' + _d0(32) + ' ' + _d0(34) + ' ' + String(_bodyBytes.byteLength) + ' >>'
    : '<< ' + _d0(34) + ' ' + String(_bodyBytes.byteLength) + ' >>';

  const _chunks: Buffer[] = [];
  let _pos = 0;
  const _push = (_s: string): void => {
    const _b = Buffer.from(_s, 'latin1');
    _chunks.push(_b);
    _pos += _b.byteLength;
  };

  _push(_d0(39));
  const _offs = [0, 0, 0, 0, 0, 0];
  const _defs = [_d0(47), _d0(48), _d0(49), _d0(50)];

  for (let _id = 1; _id <= 4; _id++) {
    _offs[_id] = _pos;
    _push(String(_id) + ' 0 ' + _d0(37) + '\n' + _defs[_id - 1] + '\n' + _d0(38) + '\n');
  }

  _offs[5] = _pos;
  _push('5 0 ' + _d0(37) + '\n' + _dict5 + '\n' + _d0(35) + '\n');
  const _stmBuf = Buffer.from(_bodyBytes);
  _chunks.push(_stmBuf);
  _pos += _stmBuf.byteLength;
  _push('\n' + _d0(36) + '\n' + _d0(38) + '\n');

  const _xrefStart = _pos;
  _push(_d0(40) + '6\n' + _d0(41));
  for (let _id = 1; _id <= 5; _id++) {
    _push(String(_offs[_id]).padStart(10, '0') + _d0(42));
  }
  _push(_d0(43) + '6' + _d0(44) + '1 0 R' + _d0(45) + String(_xrefStart) + _d0(46));
  return Buffer.concat(_chunks);
}
