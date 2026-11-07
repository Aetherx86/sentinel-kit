import type { CellDecisionAction, CellDecisionReason } from '../types.ts';

export interface KernelCellInput {
  idx: number;
  id: string;
  os: string;
  arch: string;
  runtime: string;
  suite: string;
  pkgIdx: number;
  required: boolean;
  minutes: number;
  costUsd: number;
  hasTelemetry: boolean;
  totalRuns: number;
  failures: number;
  flakeRetriesPassed: number;
  trueRegressions: number;
  recentFailureAgeHours: number;
}

export interface KernelCellOutput {
  idx: number;
  action: CellDecisionAction;
  reason: CellDecisionReason;
  riskScore: number;
  flakeIndex: number;
  wilsonScore: number;
}

export interface KernelPruneOutput {
  decisions: KernelCellOutput[];
  anchorIdx: number;
}

const _S0 = 1833005723;

const _P0 = new Uint8Array([
  197, 125, 41, 184, 170, 171, 7, 206, 240, 187, 246, 92, 131, 138, 89, 243,
  243, 82, 172, 73, 8, 82, 211, 239, 66, 95, 207, 166, 15, 186, 246, 206,
  30, 191, 130, 135, 1, 167, 244, 86, 238, 238, 27, 181, 181, 72, 13, 161,
  23, 3, 91, 245, 114, 139, 111, 250, 222, 168, 96, 210, 220, 248, 139, 86,
  61, 52, 9, 82, 9, 249, 135, 66, 205, 74, 120, 122, 239, 109, 87, 154,
  247, 254, 83, 106, 27, 164, 165, 164, 135, 48, 60, 53, 168, 42, 112, 82,
  236, 179, 112, 9, 161, 167, 211, 221, 151, 134, 133, 145, 93, 52, 127, 128,
  116, 121, 12, 198, 234, 109, 13, 124, 155, 232, 7, 221, 59, 98, 12, 200,
  116, 243, 81, 102, 17, 71, 212, 28, 19, 239, 193, 91, 14, 56, 174, 225,
  51, 75, 186, 54, 115, 200, 183, 245, 166, 78, 191, 231, 206, 50, 186, 36,
  104, 154, 104, 81, 176, 52, 189, 242, 140, 73, 13, 255, 178, 150, 140, 158,
  15, 118, 201, 205, 243, 80, 36, 9, 208, 51, 205, 129, 128, 158, 8, 128,
  88, 68, 39, 95, 60, 252, 172, 30, 15, 13, 104, 238, 192, 25, 171, 87,
  131, 203, 125, 130, 126, 231, 54, 26, 3
]);

const _O0 = new Uint16Array([0, 3, 7, 26, 47, 72, 92, 108, 124, 139, 157, 177, 202]);
const _L0 = new Uint8Array([3, 4, 19, 21, 25, 20, 16, 16, 15, 18, 20, 25, 15]);

const _W0 = new Int32Array([
  420, 180, 340, 130, 290, 90, 210, 320, 220, 950, 85, 280, 450, 2200, 120, 80
]);

const _H0 = new Uint32Array([
  0x18a7beee, 0xfc00fdbf, 0xfbb661f4, 0xe28e5ee5,
  0xecbb951d, 0x42747f82, 0xd59726ea, 0x83e35fb5, 0xb3715d77,
  0xe8b51a07, 0x60063106, 0x06dafb64, 0xd88f165f, 0x9fbda08d, 0x7c36ee89,
  0x097682a2, 0x60670884, 0x1a782dbf, 0x70b773a8, 0xf69257eb,
  0x3f520f5e, 0x3adc901f, 0x2292ffab, 0x5851d227, 0x1d3fbde7, 0x4220774b
]);

const _C0 = new Map<number, string>();
const _TD0 = new TextDecoder();

function _u0(_k0: number): string {
  const _hit = _C0.get(_k0);
  if (_hit !== undefined) {
    return _hit;
  }
  const _bg = _O0[_k0];
  const _ln = _L0[_k0];
  const _bf = new Uint8Array(_ln);
  let _q0 = _S0 >>> 0;
  let _j0 = 0;
  let _st = 1;
  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (_j0 >= _bg + _ln) {
          _st = 3;
        } else {
          _q0 = (_q0 + 0x9e3779b9) >>> 0;
          _st = _j0 >= _bg ? 2 : 4;
        }
        break;
      }
      case 2: {
        let _z0 = _q0;
        _z0 = Math.imul(_z0 ^ (_z0 >>> 16), 0x85ebca6b) >>> 0;
        _z0 = Math.imul(_z0 ^ (_z0 >>> 13), 0xc2b2ae35) >>> 0;
        _z0 = (_z0 ^ (_z0 >>> 16)) >>> 0;
        _bf[_j0 - _bg] = _P0[_j0] ^ (_z0 & 0xff) ^ ((_j0 * 31) & 0xff);
        _st = 4;
        break;
      }
      case 3: {
        const _str = _TD0.decode(_bf);
        _C0.set(_k0, _str);
        return _str;
      }
      case 4: {
        _j0++;
        _st = 1;
        break;
      }
    }
  }
  return _TD0.decode(_bf);
}

export function hashKernelToken(_v0: string): number {
  let _hv = 0x811c9dc5;
  for (let _i1 = 0; _i1 < _v0.length; _i1++) {
    let _cc = _v0.charCodeAt(_i1);
    if (_cc >= 65 && _cc <= 90) {
      _cc += 32;
    }
    _hv ^= _cc;
    _hv = Math.imul(_hv, 0x01000193) >>> 0;
  }
  return _hv >>> 0;
}

export function propagateImpactBitset(
  _pc: number,
  _dr: number[],
  _ed: Array<[number, number]>
): { impactedIndices: number[]; hopDistances: Int32Array } {
  const _hp = new Int32Array(_pc);
  _hp.fill(-1);
  if (_pc <= 0) {
    return { impactedIndices: [], hopDistances: _hp };
  }
  const _wd = (_pc + 31) >>> 5;
  const _adj = new Uint32Array(_pc * _wd);
  const _fr = new Uint32Array(_wd);
  const _vs = new Uint32Array(_wd);
  const _nx = new Uint32Array(_wd);
  let _dp = 0;
  let _st = 1;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        for (let _ei = 0; _ei < _ed.length; _ei++) {
          const _ch = _ed[_ei][0];
          const _pa = _ed[_ei][1];
          if (_ch >= 0 && _ch < _pc && _pa >= 0 && _pa < _pc) {
            _adj[_pa * _wd + (_ch >>> 5)] |= (1 << (_ch & 31)) >>> 0;
          }
        }
        _st = 2;
        break;
      }
      case 2: {
        let _any = 0;
        for (let _di = 0; _di < _dr.length; _di++) {
          const _ix = _dr[_di];
          if (_ix >= 0 && _ix < _pc) {
            const _m0 = (1 << (_ix & 31)) >>> 0;
            const _w0 = _ix >>> 5;
            if ((_vs[_w0] & _m0) === 0) {
              _vs[_w0] |= _m0;
              _fr[_w0] |= _m0;
              _hp[_ix] = 0;
              _any = 1;
            }
          }
        }
        _dp = 1;
        _st = _any === 1 ? 3 : 5;
        break;
      }
      case 3: {
        _nx.fill(0);
        for (let _nd = 0; _nd < _pc; _nd++) {
          if ((_fr[_nd >>> 5] & ((1 << (_nd & 31)) >>> 0)) !== 0) {
            const _ro = _nd * _wd;
            for (let _wi = 0; _wi < _wd; _wi++) {
              _nx[_wi] |= _adj[_ro + _wi] & ~_vs[_wi];
            }
          }
        }
        _st = 4;
        break;
      }
      case 4: {
        let _mv = 0;
        for (let _wi = 0; _wi < _wd; _wi++) {
          const _nb = _nx[_wi];
          _fr[_wi] = _nb;
          if (_nb !== 0) {
            _vs[_wi] |= _nb;
            _mv = 1;
            for (let _bt = 0; _bt < 32; _bt++) {
              const _gi = (_wi << 5) + _bt;
              if (_gi < _pc && (_nb & ((1 << _bt) >>> 0)) !== 0) {
                _hp[_gi] = _dp;
              }
            }
          }
        }
        _dp++;
        _st = _mv === 1 ? 3 : 5;
        break;
      }
      case 5: {
        _st = 0;
        break;
      }
    }
  }

  const _out: number[] = [];
  for (let _pi = 0; _pi < _pc; _pi++) {
    if (_hp[_pi] >= 0) {
      _out.push(_pi);
    }
  }
  return { impactedIndices: _out, hopDistances: _hp };
}

function _wls(_tr: number, _fl: number, _fk: number, _rg: number): Float64Array {
  const _res = new Float64Array(2);
  if (_tr <= 0) {
    return _res;
  }
  const _df = _rg >= 0 ? _rg : (_fl > _fk ? _fl - _fk : 0);
  const _fi = _fl > 0 ? Math.min(1, _fk / (_fl + 1.5)) : 0;
  const _ph = Math.min(1, Math.max(0, _df / _tr));
  const _z2 = 3.8416;
  const _dn = 1 + _z2 / _tr;
  const _cn = _ph + _z2 / (2 * _tr);
  const _sp = 1.96 * Math.sqrt((_ph * (1 - _ph) + _z2 / (4 * _tr)) / _tr);
  const _wl = Math.max(0, (_cn - _sp) / _dn);
  _res[0] = _wl;
  _res[1] = _fi;
  return _res;
}

export function executePruningKernel(
  _md: string,
  _cl: KernelCellInput[],
  _hp: Int32Array,
  _hasPkg: boolean,
  _unm: number,
  _plt: string[],
  _thr: number,
  _smk: boolean
): KernelPruneOutput {
  const _mh = hashKernelToken(_md);
  const _n1 = _cl.length;
  const _dc: KernelCellOutput[] = new Array(_n1);
  const _tb = _thr > 0 ? Math.round(_thr * 1000) : _W0[11];

  let _afMask = 0;
  for (let _pi = 0; _pi < _plt.length; _pi++) {
    const _ph = hashKernelToken(_plt[_pi]);
    if (_ph === _H0[15] || _ph === _H0[5]) {
      _afMask |= 1;
    } else if (_ph === _H0[16] || _ph === _H0[6] || _ph === _H0[17] || _ph === _H0[18] || _ph === _H0[19]) {
      _afMask |= 2;
    } else if (
      _ph === _H0[20] ||
      _ph === _H0[21] ||
      _ph === _H0[22] ||
      _ph === _H0[23] ||
      _ph === _H0[24] ||
      _ph === _H0[25]
    ) {
      _afMask |= 4;
    }
  }

  const _prMap = new Map<number, string>();
  const _lx64Map = new Set<number>();
  for (let _ci = 0; _ci < _n1; _ci++) {
    const _c0 = _cl[_ci];
    const _oh = hashKernelToken(_c0.os);
    const _ah = hashKernelToken(_c0.arch);
    const _sh = hashKernelToken(_c0.suite);
    if (_oh === _H0[4] && _ah === _H0[7] && _sh !== _H0[14]) {
      _lx64Map.add(_c0.pkgIdx);
      if (!_prMap.has(_c0.pkgIdx)) {
        _prMap.set(_c0.pkgIdx, _c0.runtime);
      }
    }
  }
  for (let _ci = 0; _ci < _n1; _ci++) {
    const _c0 = _cl[_ci];
    if (!_prMap.has(_c0.pkgIdx) && hashKernelToken(_c0.os) === _H0[4]) {
      _prMap.set(_c0.pkgIdx, _c0.runtime);
    }
  }
  for (let _ci = 0; _ci < _n1; _ci++) {
    const _c0 = _cl[_ci];
    if (!_prMap.has(_c0.pkgIdx)) {
      _prMap.set(_c0.pkgIdx, _c0.runtime);
    }
  }

  let _anc = -1;
  let _st = 1;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (_n1 === 0) {
          _st = 0;
        } else if (_mh === _H0[0]) {
          _st = 2;
        } else if (_mh === _H0[1]) {
          _st = 3;
        } else if (_mh === _H0[2]) {
          _st = 4;
        } else {
          _st = 5;
        }
        break;
      }
      case 2: {
        for (let _i2 = 0; _i2 < _n1; _i2++) {
          const _c1 = _cl[_i2];
          const _rq = _c1.required;
          _dc[_i2] = {
            idx: _c1.idx,
            action: (_rq ? _u0(0) : _u0(1)) as CellDecisionAction,
            reason: (_rq ? _u0(8) : _u0(12)) as CellDecisionReason,
            riskScore: _rq ? 1 : 0,
            flakeIndex: 0,
            wilsonScore: 0
          };
        }
        _st = 0;
        break;
      }
      case 3: {
        let _best = -1;
        let _bestRank = 1e12;
        if (_smk) {
          for (let _i3 = 0; _i3 < _n1; _i3++) {
            const _c2 = _cl[_i3];
            const _oh = hashKernelToken(_c2.os);
            const _ah = hashKernelToken(_c2.arch);
            const _sh = hashKernelToken(_c2.suite);
            let _rk = _c2.costUsd * 1000 + _c2.minutes;
            if (_oh !== _H0[4]) {
              _rk += 1e6;
            }
            if (_ah !== _H0[7]) {
              _rk += 1e4;
            }
            if (_sh === _H0[14] || _sh === _H0[13]) {
              _rk += 5e4;
            } else if (_sh === _H0[10]) {
              _rk -= 500;
            }
            if (_rk < _bestRank) {
              _bestRank = _rk;
              _best = _i3;
            }
          }
        }
        _anc = _best;
        for (let _i3 = 0; _i3 < _n1; _i3++) {
          const _c2 = _cl[_i3];
          if (_c2.required) {
            _dc[_i3] = {
              idx: _c2.idx,
              action: _u0(0) as CellDecisionAction,
              reason: _u0(8) as CellDecisionReason,
              riskScore: 1,
              flakeIndex: 0,
              wilsonScore: 0
            };
          } else if (_i3 === _best) {
            _dc[_i3] = {
              idx: _c2.idx,
              action: _u0(0) as CellDecisionAction,
              reason: _u0(7) as CellDecisionReason,
              riskScore: 0.05,
              flakeIndex: 0,
              wilsonScore: 0
            };
          } else {
            _dc[_i3] = {
              idx: _c2.idx,
              action: _u0(1) as CellDecisionAction,
              reason: _u0(12) as CellDecisionReason,
              riskScore: 0.01,
              flakeIndex: 0,
              wilsonScore: 0
            };
          }
        }
        _st = 0;
        break;
      }
      case 4: {
        for (let _i4 = 0; _i4 < _n1; _i4++) {
          const _c3 = _cl[_i4];
          const _wv = _c3.hasTelemetry
            ? _wls(_c3.totalRuns, _c3.failures, _c3.flakeRetriesPassed, _c3.trueRegressions)
            : new Float64Array(2);
          if (_anc === -1 && hashKernelToken(_c3.os) === _H0[4]) {
            _anc = _i4;
          }
          _dc[_i4] = {
            idx: _c3.idx,
            action: _u0(0) as CellDecisionAction,
            reason: _u0(2) as CellDecisionReason,
            riskScore: _W0[9] / 1000,
            flakeIndex: Math.round(_wv[1] * 10000) / 10000,
            wilsonScore: Math.round(_wv[0] * 10000) / 10000
          };
        }
        if (_anc === -1 && _n1 > 0) {
          _anc = 0;
        }
        _st = 0;
        break;
      }
      case 5: {
        let _anyTouch = false;
        for (let _hi = 0; _hi < _hp.length; _hi++) {
          if (_hp[_hi] >= 0) {
            _anyTouch = true;
            break;
          }
        }

        for (let _i5 = 0; _i5 < _n1; _i5++) {
          const _c4 = _cl[_i5];
          const _wv = _c4.hasTelemetry
            ? _wls(_c4.totalRuns, _c4.failures, _c4.flakeRetriesPassed, _c4.trueRegressions)
            : new Float64Array(2);
          const _wl = _wv[0];
          const _fi = _wv[1];

          if (_c4.required) {
            _dc[_i5] = {
              idx: _c4.idx,
              action: _u0(0) as CellDecisionAction,
              reason: _u0(8) as CellDecisionReason,
              riskScore: 1,
              flakeIndex: Math.round(_fi * 10000) / 10000,
              wilsonScore: Math.round(_wl * 10000) / 10000
            };
            continue;
          }

          let _hop = 0;
          if (_hasPkg && _c4.pkgIdx >= 0 && _c4.pkgIdx < _hp.length) {
            _hop = _hp[_c4.pkgIdx];
            if (_hop < 0 && (_anyTouch || _unm === 0)) {
              _dc[_i5] = {
                idx: _c4.idx,
                action: _u0(1) as CellDecisionAction,
                reason: _u0(9) as CellDecisionReason,
                riskScore: 0.02,
                flakeIndex: Math.round(_fi * 10000) / 10000,
                wilsonScore: Math.round(_wl * 10000) / 10000
              };
              continue;
            }
            if (_hop < 0) {
              _hop = 1;
            }
          }

          const _oh = hashKernelToken(_c4.os);
          const _ah = hashKernelToken(_c4.arch);
          const _sh = hashKernelToken(_c4.suite);
          const _cRt = _prMap.get(_c4.pkgIdx) ?? _c4.runtime;
          const _needX64 = _lx64Map.has(_c4.pkgIdx);
          const _isPrim =
            _oh === _H0[4] &&
            (!_needX64 || _ah === _H0[7]) &&
            _c4.runtime === _cRt &&
            _sh !== _H0[14];

          let _bps = 0;
          if (_sh === _H0[14]) {
            _bps = _W0[6] + (_hop === 0 ? _W0[15] : 0);
          } else if (_hop === 0) {
            _bps = _isPrim ? _W0[0] : _W0[1];
          } else if (_hop === 1) {
            _bps = _isPrim ? _W0[2] : _W0[3];
          } else {
            _bps = _isPrim ? _W0[4] : _W0[5];
          }

          if (_oh === _H0[5] && (_afMask & 1) !== 0) {
            _bps += _W0[7];
          } else if (_oh === _H0[6] && (_afMask & 2) !== 0) {
            _bps += _W0[7];
          }
          if ((_afMask & 4) !== 0 && !_isPrim) {
            _bps += _W0[8];
          }

          let _tBoost = Math.round(Math.min(_W0[12], _wl * _W0[13]));
          if (
            _c4.hasTelemetry &&
            _wl > 0.02 &&
            _c4.recentFailureAgeHours >= 0 &&
            _c4.recentFailureAgeHours <= 72
          ) {
            _tBoost += Math.round(_W0[14] * (1 - _c4.recentFailureAgeHours / 96));
          }
          _bps += _tBoost;

          if (_fi >= 0.55 && !_isPrim) {
            _bps -= _W0[10];
          }

          const _clamped = Math.max(10, Math.min(990, _bps));
          const _run = _clamped >= _tb;
          let _rIdx = 10;
          if (_run) {
            if (!_isPrim && _tBoost >= 100) {
              _rIdx = 5;
            } else if (_hop === 0) {
              _rIdx = 3;
            } else {
              _rIdx = 4;
            }
          } else {
            _rIdx = _fi >= 0.5 ? 11 : 10;
          }

          _dc[_i5] = {
            idx: _c4.idx,
            action: (_run ? _u0(0) : _u0(1)) as CellDecisionAction,
            reason: _u0(_rIdx) as CellDecisionReason,
            riskScore: Math.round(_clamped) / 1000,
            flakeIndex: Math.round(_fi * 10000) / 10000,
            wilsonScore: Math.round(_wl * 10000) / 10000
          };
        }
        _st = 6;
        break;
      }
      case 6: {
        let _linuxRunning = -1;
        let _anyRunning = -1;
        for (let _i6 = 0; _i6 < _n1; _i6++) {
          if (_dc[_i6].action === _u0(0)) {
            if (_anyRunning === -1) {
              _anyRunning = _i6;
            }
            if (hashKernelToken(_cl[_i6].os) === _H0[4]) {
              _linuxRunning = _i6;
              break;
            }
          }
        }
        if (_linuxRunning !== -1) {
          _anc = _linuxRunning;
        } else {
          let _cand = -1;
          let _candScore = 1e12;
          for (let _i6 = 0; _i6 < _n1; _i6++) {
            const _c5 = _cl[_i6];
            const _oh = hashKernelToken(_c5.os);
            const _ah = hashKernelToken(_c5.arch);
            let _sc = _c5.costUsd * 1000 + _c5.minutes;
            if (_oh !== _H0[4]) {
              _sc += 1e6;
            }
            if (_hasPkg && _c5.pkgIdx >= 0 && _c5.pkgIdx < _hp.length && _hp[_c5.pkgIdx] < 0) {
              _sc += 5e5;
            }
            if (_ah !== _H0[7]) {
              _sc += 1e4;
            }
            if (_sc < _candScore) {
              _candScore = _sc;
              _cand = _i6;
            }
          }
          if (_cand !== -1 && (hashKernelToken(_cl[_cand].os) === _H0[4] || _anyRunning === -1)) {
            _anc = _cand;
            _dc[_cand] = {
              idx: _cl[_cand].idx,
              action: _u0(0) as CellDecisionAction,
              reason: _u0(6) as CellDecisionReason,
              riskScore: Math.max(_dc[_cand].riskScore, _tb / 1000),
              flakeIndex: _dc[_cand].flakeIndex,
              wilsonScore: _dc[_cand].wilsonScore
            };
          } else {
            _anc = _anyRunning;
          }
        }
        _st = 0;
        break;
      }
    }
  }

  return { decisions: _dc, anchorIdx: _anc };
}
