import { readFileSync, existsSync } from 'node:fs';
import type {
  NormalizedCheckConstraint,
  NormalizedColumn,
  NormalizedForeignKey,
  NormalizedIndex,
  NormalizedSchemaCatalog,
  NormalizedTable,
  SchemaCatalogInput,
  SchemaCatalogSnapshot,
  TableSnapshot
} from '../types.ts';
import { canonicalizePgTypeKernel } from '../core/kernel.ts';
import type { KernelSeedColumn } from '../core/kernel.ts';

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function resolveJsonInput(input: SchemaCatalogInput): unknown {
  if (typeof input === 'object' && input !== null) {
    return input;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Fall through to file check
      }
    }
    if (existsSync(trimmed)) {
      const raw = readFileSync(trimmed, 'utf8');
      return JSON.parse(raw);
    }
    throw new Error(`Invalid catalog input: not valid JSON and file not found: ${input}`);
  }
  throw new Error(`Unsupported schema catalog input type: ${typeof input}`);
}

function parseQualifiedName(tableInput: string, schemaInput?: string): { schema: string; name: string; qualifiedName: string } {
  let rawName = tableInput.trim().replace(/^["`]|["`]$/g, '');
  let rawSchema = schemaInput ? schemaInput.trim().replace(/^["`]|["`]$/g, '') : '';

  if (!rawSchema && rawName.includes('.')) {
    const parts = rawName.split('.');
    rawSchema = parts[0];
    rawName = parts.slice(1).join('.');
  }
  const finalSchema = (rawSchema || 'public').toLowerCase();
  const finalName = rawName.toLowerCase();
  return {
    schema: finalSchema,
    name: finalName,
    qualifiedName: `${finalSchema}.${finalName}`
  };
}

export function normalizeCatalog(input: SchemaCatalogInput): NormalizedSchemaCatalog {
  const parsed = resolveJsonInput(input);
  if (!isObject(parsed)) {
    throw new Error('Schema catalog must be a JSON object containing a tables array');
  }

  const environment = typeof parsed.environment === 'string' ? parsed.environment : 'unspecified';
  const rawTables = Array.isArray(parsed.tables) ? (parsed.tables as TableSnapshot[]) : [];

  const tableMap = new Map<string, NormalizedTable>();

  for (const rawTable of rawTables) {
    if (!rawTable || typeof rawTable.name !== 'string') {
      continue;
    }
    const { schema, name, qualifiedName } = parseQualifiedName(rawTable.name, rawTable.schema);

    const columns: NormalizedColumn[] = [];
    if (Array.isArray(rawTable.columns)) {
      for (const col of rawTable.columns) {
        if (!col || typeof col.name !== 'string') continue;
        const colName = col.name.trim().toLowerCase();
        const rawType = (col.dataType || (col as any).canonicalType || '').toString();
        const canonicalType = canonicalizePgTypeKernel(rawType);
        columns.push({
          name: colName,
          canonicalType,
          nullable: col.nullable !== false,
          defaultExpression: col.defaultExpression != null ? String(col.defaultExpression).trim() : null
        });
      }
    }
    columns.sort((a, b) => a.name.localeCompare(b.name));

    const indexes: NormalizedIndex[] = [];
    if (Array.isArray(rawTable.indexes)) {
      for (const idx of rawTable.indexes) {
        if (!idx || typeof idx.name !== 'string') continue;
        indexes.push({
          name: idx.name.trim().toLowerCase(),
          columns: Array.isArray(idx.columns) ? idx.columns.map(c => String(c).trim().toLowerCase()) : [],
          unique: Boolean(idx.unique),
          predicate: idx.predicate != null ? String(idx.predicate).trim().toLowerCase() : null,
          method: (idx.method ? String(idx.method).trim().toLowerCase() : 'btree')
        });
      }
    }
    indexes.sort((a, b) => a.name.localeCompare(b.name));

    const foreignKeys: NormalizedForeignKey[] = [];
    if (Array.isArray(rawTable.foreignKeys)) {
      for (const fk of rawTable.foreignKeys) {
        if (!fk || typeof fk.name !== 'string') continue;
        foreignKeys.push({
          name: fk.name.trim().toLowerCase(),
          columns: Array.isArray(fk.columns) ? fk.columns.map(c => String(c).trim().toLowerCase()) : [],
          referencedTable: String(fk.referencedTable || '').trim().toLowerCase(),
          referencedColumns: Array.isArray(fk.referencedColumns) ? fk.referencedColumns.map(c => String(c).trim().toLowerCase()) : [],
          onDelete: (fk.onDelete ? String(fk.onDelete).trim().toUpperCase() : 'NO ACTION'),
          onUpdate: (fk.onUpdate ? String(fk.onUpdate).trim().toUpperCase() : 'NO ACTION'),
          validated: fk.validated !== false
        });
      }
    }
    foreignKeys.sort((a, b) => a.name.localeCompare(b.name));

    const checkConstraints: NormalizedCheckConstraint[] = [];
    if (Array.isArray(rawTable.checkConstraints)) {
      for (const ck of rawTable.checkConstraints) {
        if (!ck || typeof ck.name !== 'string') continue;
        checkConstraints.push({
          name: ck.name.trim().toLowerCase(),
          expression: String(ck.expression || '').trim(),
          validated: ck.validated !== false
        });
      }
    }
    checkConstraints.sort((a, b) => a.name.localeCompare(b.name));

    tableMap.set(qualifiedName, {
      qualifiedName,
      schema,
      name,
      columns,
      indexes,
      foreignKeys,
      checkConstraints
    });
  }

  const tables = Array.from(tableMap.values()).sort((a, b) => a.qualifiedName.localeCompare(b.qualifiedName));
  return { environment, tables };
}

export function extractSeedColumns(catalog?: SchemaCatalogInput): KernelSeedColumn[] {
  if (!catalog) return [];
  const normalized = normalizeCatalog(catalog);
  const seeds: KernelSeedColumn[] = [];
  for (const table of normalized.tables) {
    for (const col of table.columns) {
      seeds.push({
        table: table.name,
        column: col.name,
        dataType: col.canonicalType
      });
      seeds.push({
        table: table.qualifiedName,
        column: col.name,
        dataType: col.canonicalType
      });
    }
  }
  return seeds;
}

export function extractExistingTables(catalog?: SchemaCatalogInput): string[] {
  if (!catalog) return [];
  const normalized = normalizeCatalog(catalog);
  const tbls = new Set<string>();
  for (const table of normalized.tables) {
    tbls.add(table.name);
    tbls.add(table.qualifiedName);
  }
  return Array.from(tbls);
}
