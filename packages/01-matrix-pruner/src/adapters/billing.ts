import type {
  LedgerEvent,
  MatrixCell,
  OsCostBreakdown,
  RepoTier,
  RunnerArch,
  RunnerOS,
  RunnerProvider,
  SavingsInvoice,
  SavingsInvoiceInput
} from '../types.ts';

const SAVINGS_SHARE_RATE = 0.20;

const BASE_MINUTE_RATES: Record<RunnerProvider, Record<RunnerOS, Record<RunnerArch, number>>> = {
  github: {
    linux: { x64: 0.008, arm64: 0.005 },
    windows: { x64: 0.016, arm64: 0.010 },
    macos: { x64: 0.080, arm64: 0.080 }
  },
  aws: {
    linux: { x64: 0.004, arm64: 0.003 },
    windows: { x64: 0.010, arm64: 0.008 },
    macos: { x64: 0.050, arm64: 0.065 }
  }
};

const FLAT_TIER_PRICES: Record<RepoTier, number> = {
  starter: 49,
  growth: 149,
  scale: 299
};

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function roundPrecise(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 10000) / 10000;
}

export function getRunnerMinuteRateUsd(
  provider: RunnerProvider,
  os: RunnerOS,
  arch: RunnerArch,
  vcpu?: number
): number {
  const baseRate = BASE_MINUTE_RATES[provider]?.[os]?.[arch] ?? 0.008;
  const baselineVcpu = os === 'macos' ? 3 : 2;
  if (vcpu !== undefined && vcpu > baselineVcpu) {
    return roundPrecise(baseRate * (vcpu / baselineVcpu));
  }
  return baseRate;
}

export function estimateCellCostUsd(cell: MatrixCell): number {
  const provider = cell.provider ?? 'github';
  const minutes = cell.estimatedMinutes ?? 8;
  const rate = getRunnerMinuteRateUsd(provider, cell.os, cell.arch, cell.vcpu);
  return roundPrecise(minutes * rate);
}

export function resolveRepoTier(
  activeContributors = 5,
  explicitTier?: RepoTier
): { tier: RepoTier; flatTierFeeUsd: number } {
  let tier: RepoTier;
  if (explicitTier) {
    tier = explicitTier;
  } else if (activeContributors <= 10) {
    tier = 'starter';
  } else if (activeContributors <= 50) {
    tier = 'growth';
  } else {
    tier = 'scale';
  }
  return {
    tier,
    flatTierFeeUsd: FLAT_TIER_PRICES[tier]
  };
}

export function computeSavingsInvoice(input: SavingsInvoiceInput): SavingsInvoice {
  const { tier, flatTierFeeUsd } = resolveRepoTier(
    input.activeContributors,
    input.repoSizeTier
  );
  const pricingModel = input.pricingModel ?? 'best-for-customer';

  const breakdownByOs: Record<RunnerOS, OsCostBreakdown> = {
    linux: { savedMinutes: 0, executedMinutes: 0, savedCostUsd: 0 },
    macos: { savedMinutes: 0, executedMinutes: 0, savedCostUsd: 0 },
    windows: { savedMinutes: 0, executedMinutes: 0, savedCostUsd: 0 }
  };

  let rawSavedUsd = 0;
  let rawExecutedUsd = 0;

  for (const ev of input.events as LedgerEvent[]) {
    const savedMin = Math.max(0, ev.savedMinutes);
    const execMin = Math.max(0, ev.executedMinutes ?? 0);
    const rate = getRunnerMinuteRateUsd(ev.provider, ev.os, ev.arch, ev.vcpu);
    const savedCost = savedMin * rate;
    const execCost = execMin * rate;

    rawSavedUsd += savedCost;
    rawExecutedUsd += execCost;

    const bucket = breakdownByOs[ev.os];
    bucket.savedMinutes = roundCurrency(bucket.savedMinutes + savedMin);
    bucket.executedMinutes = roundCurrency(bucket.executedMinutes + execMin);
    bucket.savedCostUsd = roundCurrency(bucket.savedCostUsd + savedCost);
  }

  const grossComputeSavedUsd = roundCurrency(rawSavedUsd);
  const grossExecutedCostUsd = roundCurrency(rawExecutedUsd);
  const grossBaselineCostUsd = roundCurrency(rawSavedUsd + rawExecutedUsd);
  const savingsShareFeeUsd = roundCurrency(grossComputeSavedUsd * SAVINGS_SHARE_RATE);

  const netCustomerSavingsOnShareUsd = roundCurrency(
    grossComputeSavedUsd - savingsShareFeeUsd
  );
  const netCustomerSavingsOnFlatUsd = roundCurrency(
    grossComputeSavedUsd - flatTierFeeUsd
  );

  let billingModeApplied: 'savings-share' | 'flat-tier';
  if (pricingModel === 'savings-share') {
    billingModeApplied = 'savings-share';
  } else if (pricingModel === 'flat-tier') {
    billingModeApplied = 'flat-tier';
  } else {
    billingModeApplied =
      savingsShareFeeUsd <= flatTierFeeUsd ? 'savings-share' : 'flat-tier';
  }

  const effectiveFeeUsd =
    billingModeApplied === 'savings-share' ? savingsShareFeeUsd : flatTierFeeUsd;

  return {
    month: input.month,
    tier,
    flatTierFeeUsd,
    grossBaselineCostUsd,
    grossExecutedCostUsd,
    grossComputeSavedUsd,
    savingsShareRate: SAVINGS_SHARE_RATE,
    savingsShareFeeUsd,
    netCustomerSavingsOnShareUsd,
    netCustomerSavingsOnFlatUsd,
    effectiveFeeUsd,
    billingModeApplied,
    breakdownByOs
  };
}
