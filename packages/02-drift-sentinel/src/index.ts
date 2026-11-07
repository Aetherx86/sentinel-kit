import type {
  MigrationAnalysisOptions,
  MigrationFile,
  MigrationSafetyReport,
  PreflightCheckInput,
  PreflightCheckReport,
  SchemaCatalogInput,
  SchemaDriftReport,
  Severity
} from './types.ts';
import {
  canonicalizePgTypeKernel,
  compareCatalogsKernel,
  evaluateMigrationsKernel,
  fingerprintCatalogKernel,
  severityRankKernel,
  splitSqlKernel
} from './core/kernel.ts';
import {
  extractExistingTables,
  extractSeedColumns,
  normalizeCatalog
} from './adapters/catalog.ts';
import { loadMigrations, toKernelUnits } from './adapters/frameworks.ts';

export type * from './types.ts';
export {
  canonicalizePgTypeKernel,
  compareCatalogsKernel,
  evaluateMigrationsKernel,
  fingerprintCatalogKernel,
  severityRankKernel,
  splitSqlKernel
} from './core/kernel.ts';
export {
  extractExistingTables,
  extractSeedColumns,
  normalizeCatalog
} from './adapters/catalog.ts';
export { loadMigrations, toKernelUnits } from './adapters/frameworks.ts';

export function analyzeMigrationSafety(
  migrations: string | MigrationFile[],
  options: MigrationAnalysisOptions = {}
): MigrationSafetyReport {
  const engine = options.engine ?? 'postgres';
  const engineVersion = options.engineVersion ?? 15;
  const seedCols = extractSeedColumns(options.catalog);
  const catalogTables = extractExistingTables(options.catalog);
  const existingTables = Array.from(new Set([...catalogTables, ...(options.existingTables ?? [])]));

  const files = loadMigrations(migrations);
  const units = toKernelUnits(files);
  const evaluation = evaluateMigrationsKernel(units, engineVersion, seedCols, existingTables);

  return {
    engine,
    ...evaluation
  };
}

export function compareSchemaCatalogs(
  expected: SchemaCatalogInput,
  actual: SchemaCatalogInput
): SchemaDriftReport {
  const normExp = normalizeCatalog(expected);
  const normAct = normalizeCatalog(actual);
  return compareCatalogsKernel(normExp, normAct);
}

export function runPreflightCheck(input: PreflightCheckInput): PreflightCheckReport {
  let migrationReport: MigrationSafetyReport | undefined;
  let driftReport: SchemaDriftReport | undefined;

  let maxSevRank: 0 | 1 | 2 = 0;

  if (input.migrations) {
    migrationReport = analyzeMigrationSafety(input.migrations, {
      engine: input.engine,
      engineVersion: input.engineVersion,
      catalog: input.actualSchema || input.expectedSchema
    });
    if (migrationReport.exitCode > maxSevRank) {
      maxSevRank = migrationReport.exitCode;
    }
  }

  if (input.expectedSchema && input.actualSchema) {
    driftReport = compareSchemaCatalogs(input.expectedSchema, input.actualSchema);
    if (driftReport.exitCode > maxSevRank) {
      maxSevRank = driftReport.exitCode;
    }
  }

  const severity: Severity = maxSevRank === 2 ? 'BLOCKING' : maxSevRank === 1 ? 'CAUTION' : 'SAFE';

  return {
    severity,
    exitCode: maxSevRank,
    migrationReport,
    driftReport
  };
}
