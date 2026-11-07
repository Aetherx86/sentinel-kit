export type Severity = 'SAFE' | 'CAUTION' | 'BLOCKING';

export type DatabaseEngine = 'postgres';

export type PostgresLockMode =
  | 'NONE'
  | 'ACCESS SHARE'
  | 'ROW SHARE'
  | 'ROW EXCLUSIVE'
  | 'SHARE UPDATE EXCLUSIVE'
  | 'SHARE'
  | 'SHARE ROW EXCLUSIVE'
  | 'EXCLUSIVE'
  | 'ACCESS EXCLUSIVE';

export type MigrationFramework = 'raw' | 'prisma' | 'flyway' | 'alembic';

export type HazardRuleCode =
  | 'INDEX_NON_CONCURRENT'
  | 'CONCURRENT_IN_TX'
  | 'ADD_COL_NOT_NULL_NO_DEFAULT'
  | 'ADD_COL_VOLATILE_DEFAULT'
  | 'ADD_COL_PRE_PG11_DEFAULT_REWRITE'
  | 'ALTER_COL_TYPE_NARROWING'
  | 'ALTER_COL_TYPE_REWRITE'
  | 'DROP_DESTRUCTIVE'
  | 'FK_WITHOUT_NOT_VALID'
  | 'MISSING_LOCK_TIMEOUT';

export type SchemaDriftKind =
  | 'MISSING_TABLE'
  | 'UNRECORDED_TABLE'
  | 'MISSING_COLUMN'
  | 'EXTRA_COLUMN'
  | 'COLUMN_TYPE_DRIFT'
  | 'COLUMN_NULLABILITY_DRIFT'
  | 'COLUMN_DEFAULT_DRIFT'
  | 'MISSING_INDEX'
  | 'UNRECORDED_INDEX'
  | 'FOREIGN_KEY_DRIFT'
  | 'CHECK_CONSTRAINT_DRIFT';

export interface ParsedSqlStatement {
  index: number;
  sql: string;
  maskedSql: string;
  line: number;
  inExplicitTransaction: boolean;
  activeLockTimeoutMs: number | null;
  sourceFile?: string;
  migrationId?: string;
}

export interface MigrationFile {
  id: string;
  version: string;
  description: string;
  framework: MigrationFramework;
  filePath: string;
  sql: string;
}

export interface DdlHazardFinding {
  code: HazardRuleCode;
  severity: Severity;
  lockMode: PostgresLockMode;
  tableName?: string;
  columnName?: string;
  statementIndex: number;
  line: number;
  sourceFile?: string;
  sql: string;
  message: string;
  remediation: string;
}

export interface StatementEvaluation {
  statement: ParsedSqlStatement;
  lockMode: PostgresLockMode;
  severity: Severity;
  targetTable?: string;
  findings: DdlHazardFinding[];
}

export interface ColumnSnapshot {
  name: string;
  dataType: string;
  nullable?: boolean;
  defaultExpression?: string | null;
}

export interface IndexSnapshot {
  name: string;
  columns: string[];
  unique?: boolean;
  predicate?: string | null;
  method?: string;
}

export interface ForeignKeySnapshot {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: string;
  onUpdate?: string;
  validated?: boolean;
}

export interface CheckConstraintSnapshot {
  name: string;
  expression: string;
  validated?: boolean;
}

export interface TableSnapshot {
  name: string;
  schema?: string;
  columns: ColumnSnapshot[];
  indexes?: IndexSnapshot[];
  foreignKeys?: ForeignKeySnapshot[];
  checkConstraints?: CheckConstraintSnapshot[];
}

export interface SchemaCatalogSnapshot {
  environment?: string;
  tables: TableSnapshot[];
}

export interface NormalizedColumn {
  name: string;
  canonicalType: string;
  nullable: boolean;
  defaultExpression: string | null;
}

export interface NormalizedIndex {
  name: string;
  columns: string[];
  unique: boolean;
  predicate: string | null;
  method: string;
}

export interface NormalizedForeignKey {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete: string;
  onUpdate: string;
  validated: boolean;
}

export interface NormalizedCheckConstraint {
  name: string;
  expression: string;
  validated: boolean;
}

export interface NormalizedTable {
  qualifiedName: string;
  schema: string;
  name: string;
  columns: NormalizedColumn[];
  indexes: NormalizedIndex[];
  foreignKeys: NormalizedForeignKey[];
  checkConstraints: NormalizedCheckConstraint[];
}

export interface NormalizedSchemaCatalog {
  environment: string;
  tables: NormalizedTable[];
}

export type SchemaCatalogInput = SchemaCatalogSnapshot | NormalizedSchemaCatalog | string;

export interface MigrationAnalysisOptions {
  engine?: DatabaseEngine;
  engineVersion?: number;
  catalog?: SchemaCatalogInput;
  existingTables?: string[];
}

export interface MigrationSafetyReport {
  engine: DatabaseEngine;
  engineVersion: number;
  severity: Severity;
  exitCode: 0 | 1 | 2;
  statementCount: number;
  statements: StatementEvaluation[];
  hazards: DdlHazardFinding[];
  newlyCreatedTables: string[];
}

export interface SchemaDriftItem {
  kind: SchemaDriftKind;
  severity: Severity;
  tableName: string;
  objectName?: string;
  expected?: string;
  actual?: string;
  description: string;
}

export interface SchemaDriftReport {
  hasDrift: boolean;
  severity: Severity;
  exitCode: 0 | 1 | 2;
  expectedFingerprint: string;
  actualFingerprint: string;
  items: SchemaDriftItem[];
}

export interface PreflightCheckInput {
  migrations?: string | MigrationFile[];
  expectedSchema?: SchemaCatalogInput;
  actualSchema?: SchemaCatalogInput;
  engine?: DatabaseEngine;
  engineVersion?: number;
}

export interface PreflightCheckReport {
  severity: Severity;
  exitCode: 0 | 1 | 2;
  migrationReport?: MigrationSafetyReport;
  driftReport?: SchemaDriftReport;
}

export interface CliIO {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  cwd?: string;
}
