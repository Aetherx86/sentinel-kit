import type { BotChallengeTelemetry, CatalogSnapshot, ChallengeVendor, EngineState, HysteresisConfig, PollRegime, PollScheduleDecision, PollScheduleInput, StockAlertEvent, TierPlanEstimate, TransitionEvaluationResult, TransitionEventType, VariantTrackerState } from '../types.ts';

const _S0 = 0x4d92b7e1;
const _P0 = new Uint8Array([
  144,152,187,235,176,146,38,176,254,242,81,24,105,153,11,176,212,38,37,233,98,94,4,175,61,173,110,32,37,112,17,92,184,66,153,201,69,82,139,161,116,181,33,61,46,63,29,208,197,213,126,23,99,140,112,145,19,5,0,144,66,9,201,81,79,32,66,66,87,234,116,77,59,168,37,171,98,175,189,84,72,65,220,123,9,215,183,17,33,99,63,115,232,29,35,239,126,192,233,245,197,160,53,44,63,60,241,87,122,221,20,59,14,138,160,187,61,108,230,139,173,246,190,237,61,160,99,110,248,111,148,126,151,241,14,200,72,200,118,240,152,12,130,172,170,133,236,137,199,203,230,10,19,49,151,130,156,81,1,69,16,152,101,121,149,93,149,173,197,53,147,110,45,196,222,7,184,197,247,46,144,197,47,39,132,235,73,189,25,184,161,214,137,150,108,182,111,174,112,1,214,173,208,251,132,190,151,95,59,66,50,136,105,88,239,26,6,182,81,199,227,9,215,69,195,6,152,124,70,112,248,36,229,166,251,43,174,210,82,20,232,4,118,85,99,129,188,197,88,3,109,237,249,69,9,147,209,104,171,84,60,239,187,90,11,32,228,179,241,196,72,125,114,84,92,94,192,147,185,118,220,9,90,120,12,213,144,156,216,34,206,107,47,84,144,216,96,208,198,237,143,49,64,47,157,149,119,194,193,87,90,18,0,160,244,167,54,206,34,155,127,91,87,21,253,13,239,41,58,197,210,76,98,175,78,184,235,149,154,118,163,7,48,204,155,93,120,240,112,144,180,171,56,82,199,18,44,176,104,125,25,110,253,75,130,213,50,74,187,115,49,142,233,226,187,247,46,115,79,2,74,85,87,223,18,186,220,64,76,11,81,19,53,54,248,50,105,74,69,172,17,95,5,2,243,79,145,56,188,154,8,60,168,110,7,184,37,85,198,70,16,226,54,112,208,163,249,226,191,240,69,27,158,9,177,200,53,70,151,216,73,198,38,177,71,37,66,132,118,217,14,65,67,63,236,27,217,53,10,163,200,24,38,2,44,35,215,97,114,144,64,156,175,29,86,74,46,244,145,108,60,148,78,176,137,192,166,107,198,85,81,116,142,226,123,185,18,109,38,203,10,56,124,21,196,197,252,140,187,204,27,227,194,28,25,22,54,132,232,104,222,198,247,13,57,89,216,254,239,147,153,94,26,34,72,90,92,148,252,209,150,97,233,22,115,150,185,237,224,250,243,127,122,171,255,11
]);
const _O0 = new Uint32Array([
  0,10,20,28,34,45,57,83,115,131,141,151,161,185,193,204,217,224,243,259,274,289,310,326,341,358,380,390,401,418,433,452,456,464,475,488,505,512,515,519,526,531,538,543,552
]);
const _L0 = new Uint32Array([
  10,10,8,6,11,12,26,32,16,10,10,10,24,8,11,13,7,19,16,15,15,21,16,15,17,22,10,11,17,15,19,4,8,11,13,17,7,3,4,7,5,7,5,9,4
]);

const _T0 = new Uint32Array([
  (5 << 16) | (0 << 8) | 65,
  (6 << 16) | (0 << 8) | 60,
  (7 << 16) | (0 << 8) | 65,
  (16 << 16) | (0 << 8) | 55,
  (9 << 16) | (1 << 8) | 70,
  (10 << 16) | (1 << 8) | 70,
  (12 << 16) | (2 << 8) | 70,
  (14 << 16) | (3 << 8) | 45
]);

const _T1 = new Int32Array([
  1000, 450, 200, 350, 2000,
  125, 100, 90, 80, 150
]);

const _T2 = new Uint32Array([
  50, 30, 29,
  250, 10, 79,
  2000, 3, 249
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

function _f0(_x0: string): number {
  let _h0 = 0x811c9dc5;
  for (let _i1 = 0; _i1 < _x0.length; _i1++) {
    _h0 ^= _x0.charCodeAt(_i1);
    _h0 = Math.imul(_h0, 0x01000193) >>> 0;
  }
  return _h0 >>> 0;
}

function _x32(_sd: number): number {
  let _z1 = (_sd + 0x9e3779b9) >>> 0;
  _z1 = Math.imul(_z1 ^ (_z1 >>> 16), 0x85ebca6b) >>> 0;
  _z1 = Math.imul(_z1 ^ (_z1 >>> 13), 0xc2b2ae35) >>> 0;
  return (_z1 ^ (_z1 >>> 16)) >>> 0;
}

export function scoreBotChallengeKernel(
  statusCode: number,
  headerPairs: Array<[string, string]>,
  bodySample: string
): BotChallengeTelemetry {
  let _st = 1;
  let _sc = 0;
  let _vn = -1;
  let _ra: number | null = null;
  let _cfRay = false;
  let _cfSrv = false;
  const _sg: string[] = [];
  const _lw = bodySample.slice(0, 24576).toLowerCase();

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (statusCode === 403 || statusCode === 503) {
          _sc += 25;
        } else if (statusCode === 429) {
          _sc += 55;
          _sg.push(_d0(23));
          if (_vn < 0) _vn = 4;
        }
        _st = 2;
        break;
      }
      case 2: {
        for (let _i2 = 0; _i2 < headerPairs.length; _i2++) {
          const _hk = headerPairs[_i2][0].toLowerCase().trim();
          const _hv = headerPairs[_i2][1].toLowerCase().trim();
          const _hh = _f0(_hk);
          if (_hh === 0xcc556163) {
            _sc += 75;
            _vn = 0;
            _sg.push(_d0(17));
          } else if (_hh === 0xa9decced) {
            _cfRay = true;
          } else if (_hh === 0x40ac3dd2) {
            const _vh = _f0(_hv);
            if (_vh === 0xa187f48e) _cfSrv = true;
            else if (_vh === 0xcffbe6c8) {
              if (_vn < 0) _vn = 3;
            }
          } else if (_hh === 0x31beb3ed || _hh === 0xcf9b4ddc) {
            _sc += 70;
            _vn = 2;
            _sg.push(_d0(20));
          } else if (_hh === 0x6c84ff96 || _hh === 0xcd9ad917) {
            _sc += 70;
            _vn = 1;
            _sg.push(_d0(19));
          } else if (_hh === 0xc6da1376) {
            const _p0 = Number.parseInt(_hv, 10);
            if (Number.isFinite(_p0) && _p0 >= 0) _ra = _p0;
          }
        }
        _st = 3;
        break;
      }
      case 3: {
        for (let _i3 = 0; _i3 < _T0.length; _i3++) {
          const _pk = _T0[_i3];
          const _pi = (_pk >>> 16) & 0xff;
          const _pv = (_pk >>> 8) & 0xff;
          const _pw = _pk & 0xff;
          if (_lw.indexOf(_d0(_pi)) !== -1) {
            _sc += _pw;
            _vn = _pv;
            const _si = _pv === 0 ? 18 : _pv === 1 ? 19 : _pv === 2 ? 21 : 22;
            if (_sg.indexOf(_d0(_si)) === -1) _sg.push(_d0(_si));
          }
        }
        if ((_cfRay || _cfSrv) && (statusCode === 403 || statusCode === 503) && _lw.indexOf(_d0(8)) !== -1) {
          _sc += 55;
          _vn = 0;
          if (_sg.indexOf(_d0(18)) === -1) _sg.push(_d0(18));
        }
        if (statusCode === 403 && _lw.indexOf(_d0(15)) !== -1 && _lw.indexOf(_d0(14)) !== -1) {
          _sc += 45;
          _vn = 3;
          if (_sg.indexOf(_d0(22)) === -1) _sg.push(_d0(22));
        }
        _st = 4;
        break;
      }
      case 4: {
        if (_sc > 100) _sc = 100;
        if (_sc >= 50 && _vn < 0) _vn = 4;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }

  return {
    challenged: _sc >= 50,
    vendor: _vn >= 0 ? (_d0(_vn) as ChallengeVendor) : null,
    statusCode: statusCode,
    challengeScore: _sc,
    matchedSignals: _sg,
    retryAfterSeconds: _ra
  };
}

function _mkEvt(
  _tyIdx: number,
  _pr: CatalogSnapshot,
  _vr: { variantId: string; sku: string | null; title: string; lowStockRemaining: number | null; priceCents: number; compareAtPriceCents: number | null },
  _pa: boolean,
  _ca: boolean,
  _pp: number,
  _cp: number,
  _bps: number,
  _zs: number,
  _cbps: number,
  _vel: number,
  _sev: number,
  _ts: number
): StockAlertEvent {
  const _eh = _f0(_pr.productId + ':' + _vr.variantId + ':' + String(_tyIdx) + ':' + String(_ts)).toString(16).padStart(8, '0');
  return {
    eventId: _d0(44) + _eh,
    type: _d0(_tyIdx) as TransitionEventType,
    productId: _pr.productId,
    productTitle: _pr.title,
    sourceUrl: _pr.sourceUrl,
    variantId: _vr.variantId,
    sku: _vr.sku,
    variantTitle: _vr.title,
    previousAvailable: _pa,
    currentAvailable: _ca,
    previousPriceCents: _pp,
    currentPriceCents: _cp,
    priceDeltaBps: _bps,
    priceZScore: Math.round(_zs * 1000) / 1000,
    discountFromCompareAtBps: _cbps,
    restockVelocityPerHour: Math.round(_vel * 100) / 100,
    severityScore: Math.min(100, Math.max(0, Math.round(_sev))),
    detectedAtMs: _ts
  };
}

export function evaluateCatalogTransitionKernel(
  prevState: EngineState | null,
  incomingSnapshots: CatalogSnapshot[],
  challenge: BotChallengeTelemetry | null,
  config: HysteresisConfig,
  evaluatedAtMs: number
): TransitionEvaluationResult {
  let _st = 1;
  const _rc = Math.max(1, config.restockConfirmTicks ?? 2);
  const _oc = Math.max(1, config.outOfStockConfirmTicks ?? 2);
  const _mdb = Math.max(1, config.minPriceDropBps ?? 500);
  const _msb = Math.max(1, config.minPriceSpikeBps ?? 1500);
  const _zt = config.anomalyZScoreThreshold ?? -2.0;
  const _hw = Math.max(4, config.priceHistoryWindow ?? 16);
  const _vw = Math.max(60000, config.velocityWindowMs ?? 3600000);

  const _nxV: Record<string, VariantTrackerState> = {};
  if (prevState) {
    const _ks = Object.keys(prevState.variants);
    for (let _k = 0; _k < _ks.length; _k++) {
      const _id = _ks[_k];
      const _ov = prevState.variants[_id];
      _nxV[_id] = {
        variantId: _ov.variantId,
        confirmedAvailable: _ov.confirmedAvailable,
        pendingAvailable: _ov.pendingAvailable,
        pendingStreak: _ov.pendingStreak,
        lastConfirmedPriceCents: _ov.lastConfirmedPriceCents,
        priceHistoryCents: _ov.priceHistoryCents.slice(),
        restockTimestampsMs: _ov.restockTimestampsMs.slice(),
        lastSeenLowStock: _ov.lastSeenLowStock,
        lastUpdatedAtMs: _ov.lastUpdatedAtMs
      };
    }
  }

  const _al: StockAlertEvent[] = [];
  const _fl: StockAlertEvent[] = [];
  let _pres = false;
  let _act: CatalogSnapshot[] = incomingSnapshots;
  let _chCnt = prevState ? prevState.consecutiveChallenges : 0;
  let _tick = prevState ? prevState.pollTick + 1 : 1;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (challenge && challenge.challenged) {
          _pres = true;
          _chCnt += 1;
          _act = prevState ? prevState.lastValidSnapshots : [];
          if (_act.length > 0 && _act[0].variants.length > 0) {
            const _s0 = _act[0];
            const _v0 = _s0.variants[0];
            _fl.push(
              _mkEvt(30, _s0, _v0, _v0.available, _v0.available, _v0.priceCents, _v0.priceCents, 0, 0, 0, 0, challenge.challengeScore, evaluatedAtMs)
            );
          }
          _st = 0;
        } else {
          _chCnt = 0;
          _st = 2;
        }
        break;
      }
      case 2: {
        for (let _si = 0; _si < incomingSnapshots.length; _si++) {
          const _sn = incomingSnapshots[_si];
          for (let _vi = 0; _vi < _sn.variants.length; _vi++) {
            const _vr = _sn.variants[_vi];
            const _key = _sn.productId + '::' + _vr.variantId;
            const _tr = _nxV[_key];

            if (!_tr) {
              _nxV[_key] = {
                variantId: _vr.variantId,
                confirmedAvailable: _vr.available,
                pendingAvailable: null,
                pendingStreak: 0,
                lastConfirmedPriceCents: _vr.priceCents,
                priceHistoryCents: [_vr.priceCents],
                restockTimestampsMs: _vr.available ? [evaluatedAtMs] : [],
                lastSeenLowStock: _vr.lowStockRemaining,
                lastUpdatedAtMs: evaluatedAtMs
              };
              continue;
            }

            const _prevAv = _tr.confirmedAvailable;
            const _prevPr = _tr.lastConfirmedPriceCents;
            const _prunedTs = _tr.restockTimestampsMs.filter((_t) => evaluatedAtMs - _t <= _vw);

            if (_vr.available !== _prevAv) {
              const _need = _vr.available ? _rc : _oc;
              const _streak = _tr.pendingAvailable === _vr.available ? _tr.pendingStreak + 1 : 1;
              if (_streak >= _need) {
                _tr.confirmedAvailable = _vr.available;
                _tr.pendingAvailable = null;
                _tr.pendingStreak = 0;
                if (_vr.available) {
                  _prunedTs.push(evaluatedAtMs);
                  const _vel = _prunedTs.length * (3600000 / _vw);
                  const _cbps = _vr.compareAtPriceCents && _vr.compareAtPriceCents > _vr.priceCents
                    ? Math.round(((_vr.compareAtPriceCents - _vr.priceCents) * 10000) / _vr.compareAtPriceCents)
                    : 0;
                  _al.push(_mkEvt(24, _sn, _vr, false, true, _prevPr, _vr.priceCents, 0, 0, _cbps, _vel, 85 + Math.min(15, _vel * 3), evaluatedAtMs));
                } else {
                  const _vel = _prunedTs.length * (3600000 / _vw);
                  _al.push(_mkEvt(25, _sn, _vr, true, false, _prevPr, _vr.priceCents, 0, 0, 0, _vel, 55, evaluatedAtMs));
                }
              } else {
                _tr.pendingAvailable = _vr.available;
                _tr.pendingStreak = _streak;
                _fl.push(_mkEvt(29, _sn, _vr, _prevAv, _prevAv, _prevPr, _vr.priceCents, 0, 0, 0, 0, 20, evaluatedAtMs));
              }
            } else {
              _tr.pendingAvailable = null;
              _tr.pendingStreak = 0;
            }

            _tr.restockTimestampsMs = _prunedTs;
            const _velNow = _prunedTs.length * (3600000 / _vw);

            if (_vr.priceCents > 0 && _prevPr > 0) {
              const _bps = Math.round(((_vr.priceCents - _prevPr) * 10000) / _prevPr);
              const _hist = _tr.priceHistoryCents;
              let _sum = 0;
              for (let _hi = 0; _hi < _hist.length; _hi++) _sum += _hist[_hi];
              const _mean = _hist.length > 0 ? _sum / _hist.length : _prevPr;
              let _vsum = 0;
              for (let _hi = 0; _hi < _hist.length; _hi++) {
                const _df = _hist[_hi] - _mean;
                _vsum += _df * _df;
              }
              const _sd = _hist.length > 1 ? Math.sqrt(_vsum / _hist.length) : 0;
              const _denom = _sd > 0 ? _sd : Math.max(1, _mean * 0.02);
              const _zs = _hist.length >= 2 || _vr.priceCents !== _mean ? (_vr.priceCents - _mean) / _denom : 0;
              const _cbps = _vr.compareAtPriceCents && _vr.compareAtPriceCents > _vr.priceCents
                ? Math.round(((_vr.compareAtPriceCents - _vr.priceCents) * 10000) / _vr.compareAtPriceCents)
                : 0;

              if (_vr.priceCents < _prevPr && (-_bps >= _mdb || (_hist.length >= 4 && -_bps >= 250 && _zs <= _zt))) {
                const _sev = 60 + Math.min(40, Math.round((-_bps) / 100));
                _al.push(_mkEvt(26, _sn, _vr, _prevAv, _tr.confirmedAvailable, _prevPr, _vr.priceCents, _bps, _zs, _cbps, _velNow, _sev, evaluatedAtMs));
              } else if (_vr.priceCents > _prevPr && _bps >= _msb) {
                _al.push(_mkEvt(27, _sn, _vr, _prevAv, _tr.confirmedAvailable, _prevPr, _vr.priceCents, _bps, _zs, _cbps, _velNow, 40, evaluatedAtMs));
              }

              _tr.lastConfirmedPriceCents = _vr.priceCents;
              _hist.push(_vr.priceCents);
              while (_hist.length > _hw) _hist.shift();
            }

            if (
              _tr.confirmedAvailable &&
              _vr.lowStockRemaining !== null &&
              _vr.lowStockRemaining > 0 &&
              _vr.lowStockRemaining <= 5 &&
              (_tr.lastSeenLowStock === null || _tr.lastSeenLowStock > 5)
            ) {
              _al.push(_mkEvt(28, _sn, _vr, _prevAv, true, _prevPr, _vr.priceCents, 0, 0, 0, _velNow, 65, evaluatedAtMs));
            }

            _tr.lastSeenLowStock = _vr.lowStockRemaining;
            _tr.lastUpdatedAtMs = evaluatedAtMs;
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

  return {
    state: {
      variants: _nxV,
      lastValidSnapshots: _act,
      consecutiveChallenges: _chCnt,
      pollTick: _tick
    },
    alerts: _al,
    suppressedFlaps: _fl,
    preservedPriorState: _pres,
    activeSnapshots: _act
  };
}

export function computePollScheduleKernel(input: PollScheduleInput): PollScheduleDecision {
  let _st = 1;
  const _minB = Math.max(250, input.minIntervalMs ?? 1500);
  const _maxB = Math.max(_minB, input.maxIntervalMs ?? 300000);
  const _base = Math.max(_minB, input.baseIntervalMs);
  const _ch = input.consecutiveChallenges ?? 0;
  const _vel = input.recentRestockVelocityPerHour ?? 0;
  let _rgIdx = 0;
  let _calc = _base;
  let _lo = _minB;
  let _hi = _maxB;
  let _jit = 0;
  let _fin = _base;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (_ch > 0) {
          _rgIdx = 4;
          const _exp = Math.min(6, _ch);
          _calc = Math.min(_maxB, _base * (1 << _exp));
        } else if (
          input.dropWindowStartMs !== undefined &&
          input.dropWindowStartMs !== null &&
          input.dropWindowEndMs !== undefined &&
          input.dropWindowEndMs !== null &&
          input.nowMs >= input.dropWindowStartMs &&
          input.nowMs <= input.dropWindowEndMs
        ) {
          _rgIdx = 2;
          _calc = Math.round((_base * _T1[2]) / 1000);
        } else if (input.pendingConfirmation) {
          _rgIdx = 3;
          _calc = Math.round((_base * _T1[3]) / 1000);
        } else if (
          input.dropWindowStartMs !== undefined &&
          input.dropWindowStartMs !== null &&
          input.nowMs < input.dropWindowStartMs &&
          input.dropWindowStartMs - input.nowMs <= 900000
        ) {
          _rgIdx = 1;
          _calc = Math.round((_base * _T1[1]) / 1000);
        } else {
          _rgIdx = 0;
          const _vBoost = _vel >= 2 ? 650 : 1000;
          _calc = Math.round((_base * _vBoost) / 1000);
        }
        _calc = Math.min(_maxB, Math.max(_minB, _calc));
        _st = 2;
        break;
      }
      case 2: {
        const _pct = _T1[5 + _rgIdx];
        const _span = Math.max(1, Math.round((_calc * _pct) / 1000));
        _lo = Math.max(_minB, _calc - _span);
        _hi = Math.min(_maxB, _calc + _span);
        const _sd = ((input.jitterSeed ?? 0x243f6a88) ^ (input.nowMs & 0xffffffff) ^ (_rgIdx * 0x9e3779b9)) >>> 0;
        const _r0 = _x32(_sd);
        const _rng = _hi - _lo;
        _fin = _rng > 0 ? _lo + (_r0 % (_rng + 1)) : _lo;
        _jit = _fin - _calc;
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }

  return {
    nextDelayMs: _fin,
    baseCalculatedMs: _calc,
    jitterOffsetMs: _jit,
    minBoundMs: _lo,
    maxBoundMs: _hi,
    regime: _d0(31 + _rgIdx) as PollRegime
  };
}

export function computeTierPlanKernel(monitoredSkus: number, pollIntervalSeconds: number): TierPlanEstimate {
  let _st = 1;
  const _sk = Math.max(1, Math.floor(monitoredSkus));
  const _iv = Math.max(1, Math.floor(pollIntervalSeconds));
  const _req = Math.ceil((86400 / _iv) * _sk);
  let _ti = 2;
  let _ok = true;

  while (_st !== 0) {
    switch (_st) {
      case 1: {
        if (_sk <= _T2[0] && _iv >= _T2[1] && _req <= 150000) {
          _ti = 0;
        } else if (_sk <= _T2[3] && _iv >= _T2[4] && _req <= 2200000) {
          _ti = 1;
        } else {
          _ti = 2;
          _ok = _sk <= _T2[6] && _iv >= _T2[7];
        }
        _st = 0;
        break;
      }
      default:
        _st = 0;
        break;
    }
  }

  const _ch: string[] = [_d0(39), _d0(40)];
  if (_ti >= 1) {
    _ch.push(_d0(41), _d0(42));
  }
  if (_ti >= 2) {
    _ch.push(_d0(43));
  }

  return {
    recommendedTier: _d0(36 + _ti) as 'starter' | 'pro' | 'desk',
    monthlyPriceUsd: _T2[_ti * 3 + 2],
    monitoredSkus: _sk,
    pollIntervalSeconds: _iv,
    estimatedDailyRequests: _req,
    alertChannels: _ch,
    withinQuota: _ok
  };
}
