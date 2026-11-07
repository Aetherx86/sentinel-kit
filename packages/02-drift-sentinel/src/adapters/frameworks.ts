import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import type { MigrationFile, MigrationFramework } from '../types.ts';
import { splitSqlKernel } from '../core/kernel.ts';
import type { KernelMigrationUnit } from '../core/kernel.ts';

function collectFiles(dirPath: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.sql')) {
      results.push(fullPath);
    }
  }
  return results;
}

function detectFramework(filePath: string): { framework: MigrationFramework; version: string; description: string } {
  const base = basename(filePath);
  const flywayMatch = base.match(/^([VRvr])(\d+(?:[._]\d+)*)__(.+)\.sql$/);
  if (flywayMatch) {
    return {
      framework: 'flyway',
      version: flywayMatch[2].replace(/_/g, '.'),
      description: flywayMatch[3].replace(/_/g, ' ')
    };
  }

  if (base === 'migration.sql') {
    const parts = filePath.split(/[/\\]/);
    const parentDir = parts[parts.length - 2] || 'unknown';
    const tsMatch = parentDir.match(/^(\d{14})_(.*)$/);
    if (tsMatch) {
      return {
        framework: 'prisma',
        version: tsMatch[1],
        description: tsMatch[2].replace(/_/g, ' ')
      };
    }
    return {
      framework: 'prisma',
      version: parentDir,
      description: parentDir
    };
  }

  const rawMatch = base.match(/^(\d+)[-_](.+)\.sql$/);
  if (rawMatch) {
    return {
      framework: 'raw',
      version: rawMatch[1],
      description: rawMatch[2].replace(/[-_]/g, ' ')
    };
  }

  return {
    framework: 'raw',
    version: '0',
    description: base.replace(/\.sql$/, '')
  };
}

export function loadMigrations(
  input: string | MigrationFile[],
  frameworkHint?: MigrationFramework
): MigrationFile[] {
  if (Array.isArray(input)) {
    return input;
  }

  const trimmed = input.trim();

  // If path exists on disk
  if (existsSync(trimmed)) {
    const stat = statSync(trimmed);
    if (stat.isFile()) {
      const sql = readFileSync(trimmed, 'utf8');
      const meta = detectFramework(trimmed);
      return [
        {
          id: basename(trimmed),
          version: meta.version,
          description: meta.description,
          framework: frameworkHint || meta.framework,
          filePath: trimmed,
          sql
        }
      ];
    }

    if (stat.isDirectory()) {
      const sqlFiles = collectFiles(trimmed);
      const migrations: MigrationFile[] = [];

      for (const file of sqlFiles) {
        const sql = readFileSync(file, 'utf8');
        const meta = detectFramework(file);
        migrations.push({
          id: relative(trimmed, file),
          version: meta.version,
          description: meta.description,
          framework: frameworkHint || meta.framework,
          filePath: file,
          sql
        });
      }

      migrations.sort((a, b) => {
        const vA = Number(a.version.replace(/\D/g, '')) || 0;
        const vB = Number(b.version.replace(/\D/g, '')) || 0;
        if (vA !== vB) return vA - vB;
        return a.id.localeCompare(b.id);
      });

      return migrations;
    }
  }

  // Treat as inline SQL string
  return [
    {
      id: 'inline_migration',
      version: '1',
      description: 'inline migration statement',
      framework: frameworkHint || 'raw',
      filePath: 'inline.sql',
      sql: input
    }
  ];
}

export function toKernelUnits(migrations: MigrationFile[]): KernelMigrationUnit[] {
  const units: KernelMigrationUnit[] = [];
  for (const m of migrations) {
    units.push({
      id: m.id,
      filePath: m.filePath,
      sql: m.sql
    });
  }
  return units;
}
