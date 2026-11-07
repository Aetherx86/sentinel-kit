import {
  createCipheriv,
  createDecipheriv,
  createHash,
  hkdfSync,
  randomBytes,
  timingSafeEqual
} from 'node:crypto';
import type {
  CompliancePostureReport,
  ControlEvaluation,
  ControlFramework,
  ControlStatus,
  NormalizedTelemetryBundle
} from '../types.ts';

const _SD1 = 0x3b8d57a1;
const _XK1 = 0x73c91a5d;

const _P1 = Uint8Array.from([203,149,165,57,42,168,214,99,248,110,128,7,239,38,203,181,163,92,9,174,108,59,3,224,19,205,245,167,197,143,214,64,233,35,81,63,27,222,241,10,69,105,55,124,131,181,244,101,109,101,2,106,94,25,93,203,30,138,202,101,155,102,243,0,74,211,191,96,217,214,210,172,142,53,151,17,97,167,67,32,153,142,27,166,62,228,53,209,213,94,87,72,212,62,43,5,52,219,140,13,12,30,157,77,139,197,52,86,128,17,35,252,36,50,121,234,95,242,27,130,234,72,100,107,228,136,129,31,42,140,140,27,107,50,119,56,248,208,126,99,151,148,252,119,191,167,159,162,53,23,202,249,81,25,22,251,129,36,7,17,208,135,19,89,193,136,208,121,245,228,35,10,98,150,254,241,22,107,156,147,192,153,136,138,99,13,116,176,100,254,65,193,250,15,182,51,24,31,15,176,12,180,225,205,69,136,158,197,214,109,183,35,116,67,61,175,92,216,93,98,6,98,7,104,76,170,64,124,98,234,5,167,205,122,44,45,49,130,85,26,5,18,82,10,174,209,87,100,232,247,2,78,140,167,16,164,150,231,227,189,26,143,174,118,204,164,135,7,230,203,30,108,231,219,61,144,87,128,191,11,110,97,3,215,147,169,250,161,70,96,230,169,133,101,187,193,111,150,98,19,15,66,180,129,156,33,98,3,70,236,186,210,26,126,167,50,107,33,195,187,161,81,197,230,117,182,19,164,98,202,204,165,107,1,159,238,26,173,190,157,247,14,148,2,61,248,112,223,247,116,160,133,163,243,116,155,50,192,209,162,188,86,217,150,91,36,226,38,88,123,179,44,201,48,143,243,247,56,186,55,122,35,68,152,14,231,181,150,136,68,115,73,126,53,135,79,145,123,221,60,34,199,1,187,105,251,172,159,128,252,31,134,82,103,150,198,185,244,134,227,215,242,106,234,239,24,205,83,133,128,94,100,72,73,103,134,141,218,30,146,148,41,202,5,27,97,179,130,159,79,115,52,208,113,73,16,255,233,78,197,55,210,66,198,48,99,182,136,112,84,237,134,198,58,182,114,135,220,245,235,23,95,157,125,226,75,38,47,157,205,97,119,237,248,37,15,181,252,123,163,204,80,206,214,164,164,52,118,164,136,107,221,70,182,175,83,0,204,87,197,255,59,241,185,52,42,224,46,147,85,215,9,49,241,216,102,71,189,131,187,66,144,33,75,147,69,198,217,231,201,192,211,192,163,153,189,189,196,203,24,80,49,227,81,154,8,167,16,10,31,198,8,32,61,248,216,210,77,165,122,11,131,231,107,132,162,147,34,19,103,214,193,53,252,119,189,176,121,63,212,111,1,183,228,36,3,255,22,133,250,63,155,40,36,141,84,169,42,48,48,12,199,127,212,2,73,1,177,1,168,40,139,210,69,30,74,192,30,90,53,60,182,116,231,13,210,13,50,133,143,186,164,235,10,227,157,185,175,105,243,126,245,132,8,132,242,82,108,26,226,157,34,27,111,228,147,87,0,155,241,42,145,66,222,65,23,194,243,220,146,102,137,39,57,92,80,130,134,73,244,206,124,183,0,56,165,182,114,172,77,97,41,30,238,147,179,253,64,127,214,14,189,197,16,64,132,77,6,142,123,151,172,221,134,20,137,105,136,175,215,154,46,60,235,151,2,46,3,68,20,207,150,69,170,207,81,192,169,56,40,162,168,117,80,93,154,36,57,85,27,247,212,156,139,104,157,46,81,211,204,241,6,0,249,31,220,209,193,80,140,141,243,225,253,182,134,105,89,114,214,68,64,97,108,177,128,75,45,102,44,111,193,72,115,240,24,221,198,145,110,245,218,8,231,76,174,21,96,196,18,65,161,204,33,103,70,2,221,52,221,107,142,154,228,200,29,228,136,236,237,131,39,249,122,251,213,251,95,114,23,207,162,213,208,59,1,93,60,65,247,46,246,234,223,205,161,73,112,67,184,140,25,245,167,26,26,175,143,75,195,59,216,207,56,71,120,63,85,134,222,176,236,225,31,138,88,160,202,216,117,209,219,180,2,196,100,202,26,33,249,41,214,32,63,190,158,243,15,184,223,120,111,156,231,243,145,222,249,78,36,228,92,199,20,38,249,151,154,149,151,159,224,219,139,227,181,17,175,119,122,137,60,137,205,125,6,199,46,107,139,28,42,18,161,233,20,136,63,141,160,192,116,225,8,1,253,81,220,3,55,220,238,103,124,167,237,87,124,200,52,218,71,199,178,143,205,102,180,1,79,62,49,51,26,68,106,194,99,135,12,143,203,117,170,212,74,4,108,194,96,201,128,147,60,55,167,137,14,28,37,216,215,112,140,180,246,103,64,127,240,66,56,185,214,21,93,209,236,213,87,24,202,45,149,172,116,244,128,82,221,179,34,16,54,83,46,170,130,112,147,103,140,34,66,23,110,1,80,191,40,191,111,56,2,115,27,8,11,166,234,135,62,200,121,154,151,216,66,26,139,109,122,192,81,55,251,239,215,231,174,172,192,138,106,239,186,111,241,213,10,48,58,131,219,54,235,125,54,208,9,121,238,228,218,36,210,139,148,137,0,82,122,219,64,164,108,230,178,36,156,233,25,24,104,208,223,196,216,150,216,58,92,214,243,240,215,44,237,68,20,175,55,252,205,128,84,123,243,221,252,170,151,251,102,5,89,152,202,230,240,174,30,191,24,234,161,236,92,208,89,164,117,239,124,79,125,154,231,149,8,252,205,62,146,20,6,211,103,236,81,30,0,37,223,52,156,14,121,137,168,54,25,201,175,187,122,40,182,105,73,14,80,230,73,95,190,114,174,1,25,189,59,37,171,215,120,234,223,143,92,194,157,107,101,140,225,57,114,75,20,110,218,175,54,148,136,247,43,118,243,5,153,177,125,240,239,240,119,99,188,185,44,9,112,214,100,56,160,123,192,243,191,105,151,86,112,90,44,254,11,62,217,129,121,154,56,182,31,89,157,151,172,120,166,159,150,241,84,212,214,76,53,247,111,79,110,169,136,192,152,85,20,131,152,248,149,205,141,144,191,14,168,0,94,169,56,121,239,166,92,86,115,236,225,96,123,9,247,239,52,228,94,243,31,114,9,218,244,206,188,81,216,152,88,154,24,24,104,241,198,32,182,74,79,63,200,68,114,48,225,64,240,35,23,14,246,150,142,131,7,105,137,235,174,51,11,22,84,195,218,88,242,70,210,230,213,48,122,95,205,202,21,96,230,201,147,247,129,169,47,172,194,200,0,41,145,70,242,7,6,3,202,242,199,65,128,224,41,64,228,152,151,199,236,8,47,60,229,228,197,35,194,163,216,175,30,7,236,106,228,159,137,155,4,252,168,24,190,193,10,254,42,242,30,157,82,30,45,218,7,236,139,248,175,204,179,119,87,24,56,182,28,216,27,143,164,142,183,29,7,224,252,145,72,44,196,82,208,219,197,130,20,213,210,74,147,38,116,192,75,10,30,121,35,79,1,135,174,39,204,19,55,64,224,78,0,142,97,72,218,239,91,110,221,202,229,16,107,137,239,171,254,189,62,161,228,149,74,193,141,139,145,142,132,159,165,110,153,200,172,113,96,110,17,80,210,102,124,7,230,45,1,76,235,71,35,234,141,38,144,253,72,48,172,58,224,27,212,171,115,188,184,87,53,39,103,216,186,0,80,133,201,62,225,193,232,59,251,255,192,29,128,144,106,6,148,169,105,88,154,48,111,163,151,13,182,41,242,109,7,127,243,36,41,250,67,180,55,64,1,28,224,43,163,248,87,89,147,24,250,63,128,53,221,61,243,66,201,93,63,58,218,155,83,197,210,30,104,217,159,80,211,22,246,53,49,164,85,27,141,237,105,247,96,242,166,237,176,106,4,35,154,90,200,46,39,128,159,145,254,184,142,147,185,201,81,51,42,95,236,160,106,82,128,244,217,27,177,54,97,215,209,132,197,28,16,202,197,243,214,10,64,109,150,189,91,142,53,88,190,1,199,160,220,106,21,65,254,158,191,248,136,176,131,79,215,154,146,44,48,100,203,208,124,230,100,80,32,215,177,231,68,148,100,35,254,139,20,87,91,214,161,150,178,216,197,226,100,113,176,250,4,63,121,172,106,197,132,97,95,39,254,197,203,154,114,240,106,47,40,236,7,60,144,98,207,253,59,241,137,82,7,128,152,16,74,165,207,254,189,37,107,231,54,172,10,220,156,11,90,91,233,7,205,41,161,176,116,215,18,174,53,15,84,183,139,198,236,200,72,158,112,104,195,88,193,229,83,135,82,124,51,226,165,45,154,166,205,50,88,158,51,229,145,203,136,109,15,196,98,217,138,44,237,233,22,219,21,115,70,185,224,235,111,7,38,220,206,67,122,22,248,148,26,53,212,112,17,35,218,185,161,129,117,144,114,219,136,248,166,43,62,90,8,81,162,144,202,12,137,170,58,146,134,118,63,184,21,51,174,52,92,72,219,92,112,202,107,132,214,242,178,196,129,170,169,229,11,100,190,175,122,109,199,80,239,73,102,194,24,220,21,227,233,15,9,185,32,11,17,176,28,75,124,184,211,226,124,182,116,145,108,51,152,208,13,72,112,44,209,120,141,96,248,128,75,48,197,225,92,224,64,218,10]);
const _O1 = Uint32Array.from([0,4,12,16,23,27,48,74,94,118,137,157,180,199,215,230,253,277,299,317,339,360,379,423,428,464,560,565,601,686,691,730,817,822,865,955,960,988,1078,1082,1115,1198,1204,1237,1318,1324,1361,1447,1452,1482,1570,1575,1599,1694,1700,1718,1802,1808,1827,1909,1915,1918,1929,1943,1944,1945,1953,1962,1970,1981,1985,1995,2000]);
const _L1 = Uint32Array.from([4,8,4,7,4,21,26,20,24,19,20,23,19,16,15,23,24,22,18,22,21,19,44,5,36,96,5,36,85,5,39,87,5,43,90,5,28,90,4,33,83,6,33,81,6,37,86,5,30,88,5,24,95,6,18,84,6,19,82,6,3,11,14,1,1,8,9,8,11,4,10,5,64]);
const _C1 = new Map<number, string>();
const _TD1 = new TextDecoder();
const _TE1 = new TextEncoder();

const _CTRL_M = Uint32Array.from([
  0xf9a3f0c8, 0x7fa0af2c, 0x058c799e, 0x8b55441d, 0x117e0174, 0x974fd8d8,
  0x1d3ba342, 0xa30a6dac, 0x290e2a20, 0xaeff02eb, 0x34eace76, 0xbae49775,
  0x40e26fcc, 0xc6ae2d37, 0x4c98f4a2, 0xd2a8c119, 0x58528478, 0xde5d95e3,
  0x6448204e, 0xea06eaad, 0x7006a724, 0xf60c638f, 0x7bf869fa, 0x01d6147c,
  0x86e6cad0, 0x0dbba924, 0x93a773a6, 0x19be3e05, 0x9e53077c, 0x256ad2e0,
  0xab569d5a, 0x316f67a4, 0xb6012028, 0x3d19fcf3, 0xc305c57e, 0x48c3917b,
  0xcfef54d4, 0x54c9672f, 0xdab572aa, 0x608dbb07, 0xe7b99580, 0x6c7853eb,
  0xf2643a56, 0x787de4d8, 0xff03bf2c, 0x842771b7, 0x0a134402, 0x8fc80e79
]);

const _THR_M = Uint32Array.from([
  0xf9b4e492, 0x7fa0af3c, 0x058c7980, 0x8b784417, 0x11640e3c, 0x974fd8c7,
  0x1d3ba354, 0xa3276db2, 0x29133821, 0xfda94edf, 0x34eaccf7, 0xbad69771,
  0x40c261c0, 0xc6ae2c27, 0x4c99f693, 0xd285c12d
]);

function _u1(_tbl: Uint32Array, _idx: number): number {
  return (_tbl[_idx] ^ ((_XK1 + Math.imul(_idx + 1, 0x85ebca6b)) >>> 0)) >>> 0;
}

function _d1(_ix: number): string {
  if (_C1.has(_ix)) {
    return _C1.get(_ix)!;
  }
  const _s = _O1[_ix];
  const _n = _L1[_ix];
  const _u = new Uint8Array(_n);
  let _q = _SD1 >>> 0;
  for (let _i = 0; _i < _s + _n; _i++) {
    _q = (_q + 0x9e3779b9) >>> 0;
    if (_i >= _s) {
      let _z = _q;
      _z = Math.imul(_z ^ (_z >>> 16), 0x85ebca6b) >>> 0;
      _z = Math.imul(_z ^ (_z >>> 13), 0xc2b2ae35) >>> 0;
      _z = (_z ^ (_z >>> 16)) >>> 0;
      _u[_i - _s] = _P1[_i] ^ (_z & 0xff) ^ ((_i * 31) & 0xff);
    }
  }
  const _v = _TD1.decode(_u);
  _C1.set(_ix, _v);
  return _v;
}

function _fnv1(_str: string): number {
  let _h = 0x811c9dc5;
  for (let _j = 0; _j < _str.length; _j++) {
    let _c = _str.charCodeAt(_j);
    if (_c >= 97 && _c <= 122) {
      _c -= 32;
    }
    _h ^= _c;
    _h = Math.imul(_h, 0x01000193) >>> 0;
  }
  return _h >>> 0;
}

function _popcnt(_v: number): number {
  let _x = _v >>> 0;
  let _cnt = 0;
  while (_x !== 0) {
    _x &= (_x - 1) >>> 0;
    _cnt++;
  }
  return _cnt;
}

export function normalizeThresholds(_ovr?: {
  keyDays?: number;
  lockMin?: number;
  patchDays?: number;
  checkinHrs?: number;
  rpoHrs?: number;
  retDays?: number;
}): Uint32Array {
  const _out = new Uint32Array(9);
  for (let _k = 0; _k < 9; _k++) {
    _out[_k] = _u1(_THR_M, _k);
  }
  if (_ovr) {
    if (typeof _ovr.keyDays === 'number' && _ovr.keyDays > 0) _out[0] = _ovr.keyDays;
    if (typeof _ovr.lockMin === 'number' && _ovr.lockMin > 0) _out[1] = _ovr.lockMin;
    if (typeof _ovr.patchDays === 'number' && _ovr.patchDays > 0) _out[3] = _ovr.patchDays;
    if (typeof _ovr.checkinHrs === 'number' && _ovr.checkinHrs > 0) _out[4] = _ovr.checkinHrs;
    if (typeof _ovr.rpoHrs === 'number' && _ovr.rpoHrs > 0) _out[5] = _ovr.rpoHrs;
    if (typeof _ovr.retDays === 'number' && _ovr.retDays > 0) _out[6] = _ovr.retDays;
  }
  return _out;
}

export function isWildcardStatement(_eff: string, _acts: string[], _res: string[]): boolean {
  let _st = 1;
  let _hitAct = false;
  let _hitRes = false;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (_fnv1((_eff || String()).trim()) !== 0x40a195d2) {
          _st = 0;
          break;
        }
        _st = 2;
        break;
      }
      case 2: {
        for (let _a = 0; _a < _acts.length; _a++) {
          const _ah = _fnv1((_acts[_a] || String()).trim());
          if (_ah === 0x2f0c9f3d || _ah === 0xc204d1fd || _ah === 0xd17bd08a || _ah === 0xece909ec) {
            _hitAct = true;
            break;
          }
        }
        _st = _hitAct ? 3 : 0;
        break;
      }
      case 3: {
        for (let _r = 0; _r < _res.length; _r++) {
          const _rh = _fnv1((_res[_r] || String()).trim());
          if (_rh === 0x2f0c9f3d || _rh === 0xc204d1fd) {
            _hitRes = true;
            break;
          }
        }
        _st = 0;
        break;
      }
      default: {
        _st = 0;
        break;
      }
    }
  }
  return _hitAct && _hitRes;
}

export function getGenesisChainHash(): string {
  return _d1(72);
}

export function computeChainEntryHash(
  _seq: number,
  _artId: string,
  _artType: string,
  _objKey: string,
  _capAt: string,
  _ptHash: string,
  _ctHash: string,
  _byteLen: number,
  _prevHash: string
): string {
  const _sep = _d1(63);
  const _payload =
    String(_seq) +
    _sep +
    _artId +
    _sep +
    _artType +
    _sep +
    _objKey +
    _sep +
    _capAt +
    _sep +
    _ptHash +
    _sep +
    _ctHash +
    _sep +
    String(_byteLen) +
    _sep +
    _prevHash;
  return createHash(_d1(59)).update(_payload).digest(_d1(60) as 'hex');
}

function _normKey(_mk: string | Uint8Array): Buffer {
  const _kLen = _u1(_THR_M, 15);
  if (typeof _mk === 'string') {
    if (_mk.length === 64) {
      let _isHex = true;
      for (let _i = 0; _i < 64; _i++) {
        const _c = _mk.charCodeAt(_i);
        const _ok = (_c >= 48 && _c <= 57) || (_c >= 65 && _c <= 70) || (_c >= 97 && _c <= 102);
        if (!_ok) {
          _isHex = false;
          break;
        }
      }
      if (_isHex) {
        return Buffer.from(_mk, _d1(60) as BufferEncoding);
      }
    }
    return createHash(_d1(59)).update(_mk).digest();
  }
  if (_mk.byteLength === _kLen) {
    return Buffer.from(_mk);
  }
  return createHash(_d1(59)).update(_mk).digest();
}

export function sealVaultEnvelope(
  _masterKey: string | Uint8Array,
  _objectKey: string,
  _artifactType: string,
  _capturedAt: string,
  _plaintext: Uint8Array
): { packet: Buffer; plaintextSha256: string; ciphertextSha256: string } {
  let _st = 1;
  let _ikm = Buffer.alloc(0);
  let _ptHash = String();
  let _salt = Buffer.alloc(0);
  let _iv = Buffer.alloc(0);
  let _derived = Buffer.alloc(0);
  let _ct = Buffer.alloc(0);
  let _tag = Buffer.alloc(0);
  let _pkt = Buffer.alloc(0);
  let _ctHash = String();

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        _ikm = _normKey(_masterKey);
        _ptHash = createHash(_d1(59)).update(_plaintext).digest(_d1(60) as 'hex');
        _salt = randomBytes(_u1(_THR_M, 11));
        _iv = randomBytes(_u1(_THR_M, 12));
        _st = 2;
        break;
      }
      case 2: {
        const _info = _TE1.encode(_d1(62) + _objectKey + _d1(64) + _artifactType);
        const _ab = hkdfSync(_d1(59), _ikm, _salt, _info, _u1(_THR_M, 15));
        _derived = Buffer.from(_ab);
        _st = 3;
        break;
      }
      case 3: {
        const _aad = _TE1.encode(_objectKey + _d1(63) + _capturedAt + _d1(63) + _ptHash);
        const _cip = createCipheriv(_d1(61) as 'aes-256-gcm', _derived, _iv);
        _cip.setAAD(_aad);
        _ct = Buffer.concat([_cip.update(_plaintext), _cip.final()]);
        _tag = _cip.getAuthTag();
        _st = 4;
        break;
      }
      case 4: {
        const _hdrLen = _u1(_THR_M, 14);
        const _hdr = Buffer.alloc(_hdrLen);
        _hdr.writeUInt32BE(_u1(_THR_M, 9), 0);
        _hdr[4] = _u1(_THR_M, 10);
        _salt.copy(_hdr, 5);
        _iv.copy(_hdr, 21);
        _tag.copy(_hdr, 33);
        _pkt = Buffer.concat([_hdr, _ct]);
        _ctHash = createHash(_d1(59)).update(_pkt).digest(_d1(60) as 'hex');
        _st = 0;
        break;
      }
      default: {
        _st = 0;
        break;
      }
    }
  }

  return {
    packet: _pkt,
    plaintextSha256: _ptHash,
    ciphertextSha256: _ctHash
  };
}

export function openVaultEnvelope(
  _masterKey: string | Uint8Array,
  _objectKey: string,
  _artifactType: string,
  _capturedAt: string,
  _expectedPtHash: string,
  _packet: Uint8Array
): { ok: boolean; plaintext?: Buffer; code?: number } {
  let _st = 1;
  const _buf = Buffer.from(_packet);
  let _salt = Buffer.alloc(0);
  let _iv = Buffer.alloc(0);
  let _tag = Buffer.alloc(0);
  let _ct = Buffer.alloc(0);
  let _derived = Buffer.alloc(0);
  let _pt = Buffer.alloc(0);
  let _errCode = 0;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        const _hdrLen = _u1(_THR_M, 14);
        if (_buf.length < _hdrLen) {
          _errCode = 1;
          _st = 0;
          break;
        }
        const _mg = _buf.readUInt32BE(0);
        const _vr = _buf[4];
        if (_mg !== _u1(_THR_M, 9) || _vr !== _u1(_THR_M, 10)) {
          _errCode = 1;
          _st = 0;
          break;
        }
        _salt = _buf.subarray(5, 21);
        _iv = _buf.subarray(21, 33);
        _tag = _buf.subarray(33, 49);
        _ct = _buf.subarray(49);
        _st = 2;
        break;
      }
      case 2: {
        const _ikm = _normKey(_masterKey);
        const _info = _TE1.encode(_d1(62) + _objectKey + _d1(64) + _artifactType);
        const _ab = hkdfSync(_d1(59), _ikm, _salt, _info, _u1(_THR_M, 15));
        _derived = Buffer.from(_ab);
        _st = 3;
        break;
      }
      case 3: {
        try {
          const _aad = _TE1.encode(_objectKey + _d1(63) + _capturedAt + _d1(63) + _expectedPtHash);
          const _dec = createDecipheriv(_d1(61) as 'aes-256-gcm', _derived, _iv);
          _dec.setAAD(_aad);
          _dec.setAuthTag(_tag);
          _pt = Buffer.concat([_dec.update(_ct), _dec.final()]);
          _st = 4;
        } catch {
          _errCode = 1;
          _st = 0;
        }
        break;
      }
      case 4: {
        const _actualPtHash = createHash(_d1(59)).update(_pt).digest();
        const _expBuf = Buffer.from(_expectedPtHash, _d1(60) as BufferEncoding);
        if (_expBuf.length !== _actualPtHash.length || !timingSafeEqual(_actualPtHash, _expBuf)) {
          _errCode = 2;
        }
        _st = 0;
        break;
      }
      default: {
        _st = 0;
        break;
      }
    }
  }

  if (_errCode !== 0) {
    return { ok: false, code: _errCode };
  }
  return { ok: true, plaintext: _pt };
}

export function evaluateKernelPosture(_bundle: NormalizedTelemetryBundle): CompliancePostureReport {
  let _st = 1;
  let _mask = 0;
  const _assets: string[][] = [];
  for (let _z = 0; _z < 17; _z++) {
    _assets.push([]);
  }
  const _ctrls: ControlEvaluation[] = [];
  let _socWeighted = 0;
  let _socWeightSum = 0;
  let _isoWeighted = 0;
  let _isoWeightSum = 0;
  let _anyFail = false;
  let _anyPartial = false;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        const _iam = _bundle.iam;
        if (!_iam.rootMfaEnabled) {
          _mask |= 1 << 0;
          _assets[0].push(_d1(65));
        }
        if (_iam.rootActiveAccessKeys > 0) {
          _mask |= 1 << 1;
          _assets[1].push(_d1(65));
        }
        if (_iam.humanUsersWithoutMfa.length > 0) {
          _mask |= 1 << 2;
          for (let _i = 0; _i < _iam.humanUsersWithoutMfa.length; _i++) {
            _assets[2].push(_d1(66) + _iam.humanUsersWithoutMfa[_i]);
          }
        }
        if (_iam.staleAccessKeys.length > 0) {
          _mask |= 1 << 3;
          for (let _i = 0; _i < _iam.staleAccessKeys.length; _i++) {
            const _sk = _iam.staleAccessKeys[_i];
            _assets[3].push(_d1(67) + _sk.username + _d1(64) + _sk.keyId);
          }
        }
        if (_iam.wildcardPolicies.length > 0) {
          _mask |= 1 << 4;
          for (let _i = 0; _i < _iam.wildcardPolicies.length; _i++) {
            const _wp = _iam.wildcardPolicies[_i];
            _assets[4].push(_d1(68) + _wp.principal + _d1(64) + _wp.policyName);
          }
        }
        _st = 2;
        break;
      }
      case 2: {
        const _mdm = _bundle.endpoints;
        const _pfx = _d1(69);
        if (_mdm.unencryptedDevices.length > 0) {
          _mask |= 1 << 5;
          for (let _i = 0; _i < _mdm.unencryptedDevices.length; _i++) {
            _assets[5].push(_pfx + _mdm.unencryptedDevices[_i]);
          }
        }
        if (_mdm.screenLockCriticalDevices.length > 0) {
          _mask |= 1 << 6;
          for (let _i = 0; _i < _mdm.screenLockCriticalDevices.length; _i++) {
            _assets[6].push(_pfx + _mdm.screenLockCriticalDevices[_i]);
          }
        }
        if (_mdm.screenLockWarningDevices.length > 0) {
          _mask |= 1 << 7;
          for (let _i = 0; _i < _mdm.screenLockWarningDevices.length; _i++) {
            _assets[7].push(_pfx + _mdm.screenLockWarningDevices[_i]);
          }
        }
        if (_mdm.outdatedPatchDevices.length > 0) {
          _mask |= 1 << 8;
          for (let _i = 0; _i < _mdm.outdatedPatchDevices.length; _i++) {
            _assets[8].push(_pfx + _mdm.outdatedPatchDevices[_i]);
          }
        }
        if (_mdm.staleCheckinDevices.length > 0) {
          _mask |= 1 << 9;
          for (let _i = 0; _i < _mdm.staleCheckinDevices.length; _i++) {
            _assets[9].push(_pfx + _mdm.staleCheckinDevices[_i]);
          }
        }
        _st = 3;
        break;
      }
      case 3: {
        const _bc = _bundle.backupAndChange;
        const _dp = _d1(70);
        const _rp = _d1(71);
        if (_bc.rpoBreachDatastores.length > 0) {
          _mask |= 1 << 10;
          for (let _i = 0; _i < _bc.rpoBreachDatastores.length; _i++) {
            _assets[10].push(_dp + _bc.rpoBreachDatastores[_i]);
          }
        }
        if (_bc.unencryptedBackupDatastores.length > 0) {
          _mask |= 1 << 11;
          for (let _i = 0; _i < _bc.unencryptedBackupDatastores.length; _i++) {
            _assets[11].push(_dp + _bc.unencryptedBackupDatastores[_i]);
          }
        }
        if (_bc.criticalRetentionDatastores.length > 0) {
          _mask |= 1 << 12;
          for (let _i = 0; _i < _bc.criticalRetentionDatastores.length; _i++) {
            _assets[12].push(_dp + _bc.criticalRetentionDatastores[_i]);
          }
        }
        if (_bc.shortRetentionDatastores.length > 0) {
          _mask |= 1 << 13;
          for (let _i = 0; _i < _bc.shortRetentionDatastores.length; _i++) {
            _assets[13].push(_dp + _bc.shortRetentionDatastores[_i]);
          }
        }
        if (_bc.unprotectedRepositories.length > 0) {
          _mask |= 1 << 14;
          for (let _i = 0; _i < _bc.unprotectedRepositories.length; _i++) {
            _assets[14].push(_rp + _bc.unprotectedRepositories[_i]);
          }
        }
        if (_bc.missingPrReviewRepositories.length > 0) {
          _mask |= 1 << 15;
          for (let _i = 0; _i < _bc.missingPrReviewRepositories.length; _i++) {
            _assets[15].push(_rp + _bc.missingPrReviewRepositories[_i]);
          }
        }
        if (_bc.weakGovernanceRepositories.length > 0) {
          _mask |= 1 << 16;
          for (let _i = 0; _i < _bc.weakGovernanceRepositories.length; _i++) {
            _assets[16].push(_rp + _bc.weakGovernanceRepositories[_i]);
          }
        }
        _st = 4;
        break;
      }
      case 4: {
        for (let _ci = 0; _ci < 12; _ci++) {
          const _base = _ci * 4;
          const _w0 = _u1(_CTRL_M, _base);
          const _fMask = _u1(_CTRL_M, _base + 1);
          const _pMask = _u1(_CTRL_M, _base + 2);
          const _w3 = _u1(_CTRL_M, _base + 3);

          const _fwIdx = (_w0 >>> 24) & 0xff;
          const _sBase = (_w0 >>> 16) & 0xff;
          const _wt = (_w0 >>> 8) & 0xff;
          const _fPen = (_w3 >>> 16) & 0xffff;
          const _pPen = _w3 & 0xffff;

          const _fHits = _mask & _fMask;
          const _pHits = _mask & _pMask;
          const _allHits = _fHits | _pHits;

          let _stIdx = 2;
          let _sc = 100;
          if (_fHits !== 0) {
            _stIdx = 4;
            _anyFail = true;
            const _raw = 100 - _popcnt(_fHits) * _fPen - _popcnt(_pHits) * _pPen;
            _sc = _raw < 0 ? 0 : (_raw > 40 ? 40 : _raw);
          } else if (_pHits !== 0) {
            _stIdx = 3;
            _anyPartial = true;
            const _raw = 100 - _popcnt(_pHits) * _pPen;
            _sc = _raw < 50 ? 50 : _raw;
          }

          const _defs: string[] = [];
          const _seenAssets = new Set<string>();
          const _failList: string[] = [];
          for (let _bit = 0; _bit < 17; _bit++) {
            if (((_allHits >>> _bit) & 1) === 1) {
              _defs.push(_d1(5 + _bit));
              const _bArr = _assets[_bit];
              for (let _bi = 0; _bi < _bArr.length; _bi++) {
                if (!_seenAssets.has(_bArr[_bi])) {
                  _seenAssets.add(_bArr[_bi]);
                  _failList.push(_bArr[_bi]);
                }
              }
            }
          }

          if (_fwIdx === 0) {
            _socWeighted += _sc * _wt;
            _socWeightSum += _wt;
          } else {
            _isoWeighted += _sc * _wt;
            _isoWeightSum += _wt;
          }

          _ctrls.push({
            framework: _d1(_fwIdx) as ControlFramework,
            controlId: _d1(_sBase),
            title: _d1(_sBase + 1),
            status: _d1(_stIdx) as ControlStatus,
            score: _sc,
            deficitCodes: _defs,
            failingAssets: _failList,
            remediationSummary: _stIdx === 2 ? _d1(22) : _d1(_sBase + 2)
          });
        }
        _st = 0;
        break;
      }
      default: {
        _st = 0;
        break;
      }
    }
  }

  const _soc2Score = _socWeightSum > 0 ? Math.round(_socWeighted / _socWeightSum) : 100;
  const _isoScore = _isoWeightSum > 0 ? Math.round(_isoWeighted / _isoWeightSum) : 100;
  const _readiness = Math.round((_soc2Score + _isoScore) / 2);
  const _overallIdx = _anyFail ? 4 : (_anyPartial ? 3 : 2);

  const _dig = createHash(_d1(59));
  _dig.update(_bundle.organizationName + _d1(63) + _bundle.evaluatedAt + _d1(63) + String(_mask));
  for (let _m = 0; _m < _ctrls.length; _m++) {
    const _ce = _ctrls[_m];
    _dig.update(_d1(63) + _ce.controlId + _d1(64) + _ce.status + _d1(64) + String(_ce.score));
  }
  const _evDigest = _dig.digest(_d1(60) as 'hex');
  const _prev = _bundle.previousChainHash && _bundle.previousChainHash.length === 64
    ? _bundle.previousChainHash
    : _d1(72);
  const _seal = createHash(_d1(59))
    .update(_prev + _d1(64) + _evDigest)
    .digest(_d1(60) as 'hex');

  return {
    organizationName: _bundle.organizationName,
    evaluatedAt: _bundle.evaluatedAt,
    overallStatus: _d1(_overallIdx) as ControlStatus,
    readinessScore: _readiness,
    soc2Score: _soc2Score,
    iso27001Score: _isoScore,
    controls: _ctrls,
    evidenceDigest: _evDigest,
    chainSealHash: _seal
  };
}
