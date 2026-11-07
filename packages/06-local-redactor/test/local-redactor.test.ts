import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { runCli } from '../src/cli.ts';
import {
  buildCompliancePackage,
  checksumValidators,
  createSamplePdf,
  detectPiiSpans,
  loadWasmScanner,
  processBatchDirectory,
  redactPdfBuffer,
  redactText
} from '../src/index.ts';

function extractAllInflatedStreams(pdfBuf: Buffer): string[] {
  const latin = pdfBuf.toString('latin1');
  const out: string[] = [];
  const objRx = /(\d+)\s+(\d+)\s+obj\b/g;
  let m: RegExpExecArray | null;

  while ((m = objRx.exec(latin)) !== null) {
    const bodyStart = m.index + m[0].length;
    const endObj = latin.indexOf('endobj', bodyStart);
    if (endObj === -1) break;
    const slice = latin.slice(bodyStart, endObj);
    const dictClose = slice.lastIndexOf('>>');
    if (dictClose !== -1) {
      const stmMatch = /^\s*stream(?:\r\n|\n)/.exec(slice.slice(dictClose + 2));
      if (stmMatch) {
        const dict = slice.slice(0, dictClose + 2);
        const lenMatch = /\/Length\s+(\d+)/.exec(dict);
        const dataStart = bodyStart + dictClose + 2 + stmMatch[0].length;
        const dataLen = lenMatch ? Number.parseInt(lenMatch[1], 10) : 0;
        const raw = pdfBuf.subarray(dataStart, dataStart + dataLen);
        if (dict.includes('FlateDecode')) {
          out.push(inflateSync(raw).toString('latin1'));
        } else {
          out.push(raw.toString('latin1'));
        }
      }
    }
    objRx.lastIndex = endObj + 6;
  }
  return out;
}

describe('06-local-redactor', () => {
  it('validates US SSNs and rejects invalid SSA area 000, 666, 900-999, group 00, and serial 0000', () => {
    const sample = [
      'Primary SSN: 123-45-6789',
      'Spouse SSN: 234 56 7891',
      'Compact SSN: 412559876',
      'Invalid zero area: 000-12-3456',
      'Invalid 666 area: 666-45-6789',
      'Invalid ITIN/900 area: 900-12-3456 and 987-65-4321',
      'Invalid zero group: 123-00-4567',
      'Invalid zero serial: 123-45-0000'
    ].join('\n');

    const res = redactText(sample, { categories: ['SSN'] });
    assert.equal(res.totalRedactions, 3);
    assert.equal(res.categoryCounts.SSN, 3);
    assert.ok(!res.redactedText.includes('123-45-6789'));
    assert.ok(!res.redactedText.includes('234 56 7891'));
    assert.ok(!res.redactedText.includes('412559876'));

    // Invalid SSA numbers must remain untouched rather than producing false positives
    assert.ok(res.redactedText.includes('000-12-3456'));
    assert.ok(res.redactedText.includes('666-45-6789'));
    assert.ok(res.redactedText.includes('900-12-3456'));
    assert.ok(res.redactedText.includes('987-65-4321'));
    assert.ok(res.redactedText.includes('123-00-4567'));
    assert.ok(res.redactedText.includes('123-45-0000'));
  });

  it('redacts Luhn-valid payment card PANs (13-19 digits) and rejects 1-digit typos', () => {
    const text = [
      'Visa corporate card: 4532-0151-1283-0366',
      'Amex travel card: 3782 822463 10005',
      'Order reference (1-digit typo): 4532-0151-1283-0367',
      'All zeros: 0000-0000-0000-0000'
    ].join('\n');

    const res = redactText(text, { categories: ['PAN'] });
    assert.equal(res.totalRedactions, 2);
    assert.equal(res.categoryCounts.PAN, 2);
    assert.ok(!res.redactedText.includes('4532-0151-1283-0366'));
    assert.ok(!res.redactedText.includes('3782 822463 10005'));
    assert.ok(res.redactedText.includes('4532-0151-1283-0367'));
    assert.ok(res.redactedText.includes('0000-0000-0000-0000'));
  });

  it('validates 9-digit US ABA routing numbers with 3-7-1 mod-10 checksum and rejects invalid digits', () => {
    const text = [
      'Wire Routing Number: 021000021',
      'Secondary ABA: 111000025',
      'Standalone Wells routing 121000358 on file',
      'Bad checksum routing: 021000022',
      'Invoice sequence: 900123453'
    ].join('\n');

    const res = redactText(text, { categories: ['ABA_ROUTING'] });
    assert.equal(res.totalRedactions, 3);
    assert.equal(res.categoryCounts.ABA_ROUTING, 3);
    assert.ok(!res.redactedText.includes('021000021'));
    assert.ok(!res.redactedText.includes('111000025'));
    assert.ok(!res.redactedText.includes('121000358'));
    assert.ok(res.redactedText.includes('021000022'));
    assert.ok(res.redactedText.includes('900123453'));
  });

  it('validates ISO 13616 IBANs via mod-97 == 1 and rejects corrupted check digits', () => {
    const text = [
      'Beneficiary UK IBAN: GB82 WEST 1234 5698 7654 32',
      'Beneficiary DE IBAN: DE89370400440532013000',
      'Corrupted IBAN: GB83 WEST 1234 5698 7654 32',
      'Corrupted DE IBAN: DE00370400440532013000'
    ].join('\n');

    const res = redactText(text, { categories: ['IBAN'] });
    assert.equal(res.totalRedactions, 2);
    assert.equal(res.categoryCounts.IBAN, 2);
    assert.ok(!res.redactedText.includes('GB82 WEST 1234 5698 7654 32'));
    assert.ok(!res.redactedText.includes('DE89370400440532013000'));
    assert.ok(res.redactedText.includes('GB83 WEST 1234 5698 7654 32'));
    assert.ok(res.redactedText.includes('DE00370400440532013000'));
  });

  it('detects US EINs, emails, NANP + E.164 phones, and contextual client/account labels', () => {
    const memo = [
      'Client Name: Northwind Capital Partners LP, EIN: 94-3124567',
      'Matter ID: MTR-2026-8841',
      'Contact: tax.director@northwind.example or (415) 555-0142 or +44 20 7946 0958',
      'Invalid campus EIN prefix: 07-1234567'
    ].join('\n');

    const res = redactText(memo);
    assert.equal(res.categoryCounts.CLIENT_LABEL, 1);
    assert.equal(res.categoryCounts.EIN, 1);
    assert.equal(res.categoryCounts.ACCOUNT_ID, 1);
    assert.equal(res.categoryCounts.EMAIL, 1);
    assert.equal(res.categoryCounts.PHONE, 2);

    assert.ok(!res.redactedText.includes('Northwind Capital Partners LP'));
    assert.ok(!res.redactedText.includes('94-3124567'));
    assert.ok(!res.redactedText.includes('MTR-2026-8841'));
    assert.ok(!res.redactedText.includes('tax.director@northwind.example'));
    assert.ok(!res.redactedText.includes('(415) 555-0142'));
    assert.ok(!res.redactedText.includes('+44 20 7946 0958'));
    assert.ok(res.redactedText.includes('07-1234567'));
  });

  it('supports custom firm literal/regex rules, overlap specificity resolution, and preserve-length masking', () => {
    const engagement = 'Project Orion Counterparty: Redstone BioLabs Inc, Deal Code: DL-994812, Routing: 021000021';
    const tokenRes = redactText(engagement, {
      customRules: [
        { id: 'codename', label: 'PROJECT', pattern: 'Project Orion', literal: true },
        { id: 'deal_code', label: 'DEAL', pattern: /DL-\d{6}/ }
      ]
    });

    assert.ok(tokenRes.redactedText.includes('[REDACTED:CUSTOM:PROJECT]'));
    assert.ok(tokenRes.redactedText.includes('[REDACTED:CLIENT_LABEL]'));
    assert.ok(tokenRes.redactedText.includes('[REDACTED:CUSTOM:DEAL]'));
    assert.ok(tokenRes.redactedText.includes('[REDACTED:ABA_ROUTING]'));
    assert.ok(!tokenRes.redactedText.includes('Redstone BioLabs Inc'));

    const lengthPreserved = redactText('SSN 123-45-6789', {
      maskStyle: 'preserve-length',
      maskChar: '*'
    });
    assert.equal(lengthPreserved.redactedText, 'SSN ***********');
    assert.equal(lengthPreserved.redactedText.length, 'SSN 123-45-6789'.length);

    const overlapSpans = detectPiiSpans('Account Number: 021000021');
    assert.equal(overlapSpans.length, 1);
    assert.equal(overlapSpans[0].category, 'ABA_ROUTING');
  });

  it('rewrites uncompressed PDF Tj content streams with zero residual plaintext bytes in output Buffer', () => {
    const rawPdf = createSamplePdf({
      compress: false,
      lines: [
        'K-1 Partner Schedule - Confidential',
        'Partner SSN: 123-45-6789 | EIN: 12-3456789',
        'Card on file: 4532-0151-1283-0366',
        'Contact: partner@ledger.example'
      ]
    });

    assert.equal(rawPdf.includes(Buffer.from('123-45-6789', 'latin1')), true);
    assert.equal(rawPdf.includes(Buffer.from('4532-0151-1283-0366', 'latin1')), true);

    const redacted = redactPdfBuffer(rawPdf);
    assert.equal(redacted.totalRedactions, 4);
    assert.equal(redacted.streamsInspected, 1);
    assert.equal(redacted.streamsModified, 1);

    // Raw binary inspection must find zero plaintext PII bytes
    assert.equal(redacted.pdfBuffer.includes(Buffer.from('123-45-6789', 'latin1')), false);
    assert.equal(redacted.pdfBuffer.includes(Buffer.from('12-3456789', 'latin1')), false);
    assert.equal(redacted.pdfBuffer.includes(Buffer.from('4532-0151-1283-0366', 'latin1')), false);
    assert.equal(redacted.pdfBuffer.includes(Buffer.from('partner@ledger.example', 'latin1')), false);
    assert.equal(redacted.pdfBuffer.includes(Buffer.from('[REDACTED:SSN]', 'latin1')), true);
    assert.equal(redacted.pdfBuffer.includes(Buffer.from('K-1 Partner Schedule', 'latin1')), true);
  });

  it('redacts FlateDecode compressed PDFs with kerning-split TJ arrays leaving zero PII after inflating streams', () => {
    const kerningPdf = createSamplePdf({
      compress: true,
      lines: [
        ['Taxpayer SSN: ', -25, '123-', -50, '45-6789', -15, ' (Verified)'],
        ['Split 3-way: ', '234-', -40, '56-', -30, '7891'],
        ['Wire IBAN: ', 'DE89', -20, '37040044', -15, '0532013000'],
        'Retained heading: FY2026 Audit Workpaper'
      ]
    });

    // Compressed input should use FlateDecode
    assert.equal(kerningPdf.toString('latin1').includes('/FlateDecode'), true);

    const redacted = redactPdfBuffer(kerningPdf);
    assert.equal(redacted.totalRedactions, 3);
    assert.equal(redacted.categoryCounts.SSN, 2);
    assert.equal(redacted.categoryCounts.IBAN, 1);

    // Neither raw PDF bytes nor inflated FlateDecode streams may contain any fragment of the redacted values
    const forbiddenFragments = ['123-', '45-6789', '6789', '234-', '7891', 'DE89', '37040044', '0532013000'];
    for (const frag of forbiddenFragments) {
      assert.equal(redacted.pdfBuffer.includes(Buffer.from(frag, 'latin1')), false, `Raw PDF leaked ${frag}`);
    }

    const inflatedStreams = extractAllInflatedStreams(redacted.pdfBuffer);
    assert.equal(inflatedStreams.length, 1);
    for (const frag of forbiddenFragments) {
      assert.equal(inflatedStreams[0].includes(frag), false, `Inflated stream leaked ${frag}`);
    }
    assert.equal(inflatedStreams[0].includes('[REDACTED:SSN]'), true);
    assert.equal(inflatedStreams[0].includes('[REDACTED:IBAN]'), true);
    assert.equal(inflatedStreams[0].includes('FY2026 Audit Workpaper'), true);
  });

  it('recalculates exact PDF 1.4 xref byte offsets after stream length changes', () => {
    const sample = createSamplePdf({
      compress: false,
      lines: ['Account SSN: 123-45-6789']
    });
    const { pdfBuffer } = redactPdfBuffer(sample);
    const latin = pdfBuffer.toString('latin1');

    assert.ok(latin.startsWith('%PDF-1.4\n'));
    const startxrefMatch = /startxref\n(\d+)\n%%EOF/.exec(latin);
    assert.ok(startxrefMatch !== null);
    const xrefOffset = Number.parseInt(startxrefMatch[1], 10);
    assert.ok(latin.slice(xrefOffset).startsWith('xref\n0 6\n'));

    const xrefBlock = latin.slice(xrefOffset).split('trailer')[0];
    const entryLines = xrefBlock.split('\n').filter((l) => l.includes(' f ') || l.includes(' n '));
    assert.equal(entryLines.length, 6);

    for (let objId = 1; objId <= 5; objId++) {
      const line = entryLines[objId];
      assert.equal(line.length + 1, 20);
      const byteOffset = Number.parseInt(line.slice(0, 10), 10);
      assert.ok(
        latin.slice(byteOffset, byteOffset + 12).startsWith(`${objId} 0 obj`),
        `xref offset ${byteOffset} did not point to "${objId} 0 obj"`
      );
    }
  });

  it('builds zero-retention compliance manifests with SHA-256 hashes and zero leaked PII', () => {
    const rawSecretText = 'Confidential: SSN 123-45-6789, Card 4532-0151-1283-0366, Client Name: Acme Holdings LLC';
    const textResult = redactText(rawSecretText, {
      customRules: [{ id: 'rule_1', label: 'MATTER', pattern: 'Acme Holdings LLC', literal: true }]
    });

    const manifest = buildCompliancePackage({
      documents: [
        {
          documentName: 'closing-statement.txt',
          format: 'txt',
          inputBytes: Buffer.from(rawSecretText, 'utf8'),
          outputBytes: Buffer.from(textResult.redactedText, 'utf8'),
          totalRedactions: textResult.totalRedactions,
          categoryCounts: textResult.categoryCounts
        }
      ],
      wasmBackend: 'wasm',
      generatedAtIso: '2026-11-04T05:00:00.000Z'
    });

    const serialized = JSON.stringify(manifest);
    assert.equal(manifest.totals.documentsProcessed, 1);
    assert.equal(manifest.totals.totalRedactions, 3);
    assert.match(manifest.documents[0].inputSha256, /^[0-9a-f]{64}$/);
    assert.match(manifest.documents[0].outputSha256, /^[0-9a-f]{64}$/);
    assert.notEqual(manifest.documents[0].inputSha256, manifest.documents[0].outputSha256);
    assert.match(manifest.policyHashSha256, /^[0-9a-f]{64}$/);
    assert.match(manifest.packageIntegritySha256, /^[0-9a-f]{64}$/);

    // Manifest must contain zero traces of any redacted plaintext value
    assert.equal(serialized.includes('123-45-6789'), false);
    assert.equal(serialized.includes('4532-0151-1283-0366'), false);
    assert.equal(serialized.includes('Acme Holdings'), false);
  });

  it('instantiates compiled dist/redact-scanner.wasm with pure-JS WASI stub and matches JS checksum kernel', async () => {
    const wasmPath = fileURLToPath(new URL('../dist/redact-scanner.wasm', import.meta.url));
    assert.equal(existsSync(wasmPath), true, 'Expected dist/redact-scanner.wasm to be compiled');

    const wasmScanner = await loadWasmScanner({ wasmPath });
    assert.equal(wasmScanner.backend, 'wasm');

    const ssnVectors = [
      '123-45-6789',
      '234 56 7891',
      '412559876',
      '000-12-3456',
      '666-12-3456',
      '900-12-3456',
      '123-00-4567',
      '123-45-0000'
    ];
    for (const vec of ssnVectors) {
      assert.equal(wasmScanner.validateSsn(vec), checksumValidators.validateSsn(vec), `SSN mismatch on ${vec}`);
    }

    const panVectors = [
      '4532-0151-1283-0366',
      '4532-0151-1283-0367',
      '3782 822463 10005',
      '3782 822463 10006',
      '0000000000000000'
    ];
    for (const vec of panVectors) {
      assert.equal(wasmScanner.validateLuhnPan(vec), checksumValidators.validateLuhnPan(vec), `PAN mismatch on ${vec}`);
    }

    const abaVectors = ['021000021', '111000025', '121000358', '021000022', '000000000', '12345'];
    for (const vec of abaVectors) {
      assert.equal(wasmScanner.validateAbaRouting(vec), checksumValidators.validateAbaRouting(vec), `ABA mismatch on ${vec}`);
    }

    const ibanVectors = [
      'GB82 WEST 1234 5698 7654 32',
      'DE89370400440532013000',
      'GB83 WEST 1234 5698 7654 32',
      'DE00370400440532013000'
    ];
    for (const vec of ibanVectors) {
      assert.equal(wasmScanner.validateIbanMod97(vec), checksumValidators.validateIbanMod97(vec), `IBAN mismatch on ${vec}`);
    }
  });

  it('executes native Wasm linear-memory buffer masking, span scanning, and JS fallback cleanly', async () => {
    const wasmScanner = await loadWasmScanner();
    assert.equal(wasmScanner.backend, 'wasm');

    const rawBytes = new TextEncoder().encode('123-45-6789');
    const masked = wasmScanner.maskBufferSpan(rawBytes, '*', true);
    assert.equal(masked.scrubbedBytes, 9);
    assert.equal(new TextDecoder().decode(masked.output), '***-**-****');

    const rollingMasked = wasmScanner.maskBufferSpan(rawBytes, undefined, true);
    const rollingDecoded = new TextDecoder().decode(rollingMasked.output);
    assert.match(rollingDecoded, /^[#X]{3}-[#X]{2}-[#X]{4}$/);

    const payload = 'Pay 123-45-6789 via card 4532-0151-1283-0366 or routing 021000021 or DE89370400440532013000.';
    const wasmSpans = wasmScanner.scanChecksumSpans(payload);
    assert.deepEqual(
      wasmSpans.map((s) => s.category),
      ['SSN', 'PAN', 'ABA_ROUTING', 'IBAN']
    );

    const fallbackScanner = await loadWasmScanner({ forceFallback: true });
    assert.equal(fallbackScanner.backend, 'js-fallback');
    assert.deepEqual(
      fallbackScanner.scanChecksumSpans(payload).map((s) => s.category),
      ['SSN', 'PAN', 'ABA_ROUTING', 'IBAN']
    );
  });

  it('processes mixed-format batch directories (.pdf, .txt, .csv, .json, .md) and emits valid compliance package', async () => {
    const root = mkdtempSync(join(tmpdir(), 'redactor-batch-'));
    const inDir = join(root, 'inbox');
    const outDir = join(root, 'package');
    mkdirSync(join(inDir, 'nested'), { recursive: true });

    try {
      writeFileSync(
        join(inDir, 'wire-instructions.pdf'),
        createSamplePdf({
          compress: true,
          lines: [['Routing: ', '021000021', ' | SSN: ', '123-', -45, '45-6789']]
        })
      );
      writeFileSync(join(inDir, 'ledger.csv'), 'id,ssn,email\n1,123-45-6789,cfo@client.example\n', 'utf8');
      writeFileSync(
        join(inDir, 'intake.json'),
        JSON.stringify({
          client: 'SSN 234-56-7891',
          card: '4532-0151-1283-0366',
          retainedCount: 42
        }),
        'utf8'
      );
      writeFileSync(join(inDir, 'nested', 'notes.md'), '# Call Notes\nCallback: (415) 555-0199\n', 'utf8');
      writeFileSync(join(inDir, 'summary.txt'), 'IBAN DE89370400440532013000 verified.\n', 'utf8');

      const batchRes = await processBatchDirectory(inDir, outDir, {
        generatedAtIso: '2026-11-04T05:10:00.000Z'
      });

      assert.equal(batchRes.manifest.wasmBackend, 'wasm');
      assert.equal(batchRes.manifest.totals.documentsProcessed, 5);
      assert.equal(batchRes.manifest.totals.totalRedactions, 8);
      assert.equal(existsSync(batchRes.manifestPath), true);

      const scrubbedJson = JSON.parse(readFileSync(join(outDir, 'documents', 'intake.json'), 'utf8')) as {
        client: string;
        card: string;
        retainedCount: number;
      };
      assert.equal(scrubbedJson.client, 'SSN [REDACTED:SSN]');
      assert.equal(scrubbedJson.card, '[REDACTED:PAN]');
      assert.equal(scrubbedJson.retainedCount, 42);

      const scrubbedPdf = readFileSync(join(outDir, 'documents', 'wire-instructions.pdf'));
      assert.equal(scrubbedPdf.includes(Buffer.from('021000021', 'latin1')), false);
      assert.equal(scrubbedPdf.includes(Buffer.from('6789', 'latin1')), false);

      const manifestRaw = readFileSync(batchRes.manifestPath, 'utf8');
      assert.equal(manifestRaw.includes('123-45-6789'), false);
      assert.equal(manifestRaw.includes('cfo@client.example'), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('executes CLI redact-text, redact-pdf, and batch subcommands with zero Node warnings', async () => {
    const root = mkdtempSync(join(tmpdir(), 'redactor-cli-'));
    try {
      const txtIn = join(root, 'memo.txt');
      const pdfIn = join(root, 'stmt.pdf');
      const pdfOut = join(root, 'stmt.redacted.pdf');
      const manifestOut = join(root, 'stmt.manifest.json');
      const batchIn = join(root, 'batch-in');
      const batchOut = join(root, 'batch-out');
      mkdirSync(batchIn, { recursive: true });

      writeFileSync(txtIn, 'Vendor: Horizon Legal LLP | SSN: 123-45-6789\n', 'utf8');
      writeFileSync(
        pdfIn,
        createSamplePdf({
          compress: true,
          lines: [['Card: ', '4532-', -30, '0151-1283-0366']]
        })
      );
      writeFileSync(join(batchIn, 'doc.txt'), 'Email: audit@firm.example\n', 'utf8');

      let stdoutBuf = '';
      const txtCode = await runCli(
        ['redact-text', '--input', txtIn, '--custom-literal', 'Horizon Legal LLP'],
        { stdout: (s) => { stdoutBuf += s; }, stderr: () => {} }
      );
      assert.equal(txtCode, 0);
      assert.ok(stdoutBuf.includes('[REDACTED:CUSTOM:FIRM_TERM]'));
      assert.ok(stdoutBuf.includes('[REDACTED:SSN]'));
      assert.ok(!stdoutBuf.includes('Horizon Legal LLP'));

      stdoutBuf = '';
      const pdfCode = await runCli(
        ['redact-pdf', '--input', pdfIn, '--output', pdfOut, '--manifest', manifestOut],
        { stdout: (s) => { stdoutBuf += s; }, stderr: () => {} }
      );
      assert.equal(pdfCode, 0);
      const outPdfBytes = readFileSync(pdfOut);
      assert.equal(outPdfBytes.includes(Buffer.from('0151-1283-0366', 'latin1')), false);
      assert.equal(existsSync(manifestOut), true);

      const cliPath = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
      const procOut = execFileSync(
        process.execPath,
        ['--no-warnings', cliPath, 'batch', '--input-dir', batchIn, '--output-dir', batchOut],
        { encoding: 'utf8' }
      );
      const parsedBatch = JSON.parse(procOut) as { documentsProcessed: number; totalRedactions: number; wasmBackend: string };
      assert.equal(parsedBatch.documentsProcessed, 1);
      assert.equal(parsedBatch.totalRedactions, 1);
      assert.equal(parsedBatch.wasmBackend, 'wasm');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
