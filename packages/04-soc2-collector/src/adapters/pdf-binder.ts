import type { CompliancePostureReport, VaultManifestEntry } from '../types.ts';

function escapePdfText(input: string): string {
  let ascii = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    ascii += code >= 0x20 && code <= 0x7e ? input[i] : '?';
  }
  return ascii
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function padCol(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : text.padEnd(width, ' ');
}

interface PdfPageBuilder {
  ops: string[];
  cursorY: number;
}

function createPage(): PdfPageBuilder {
  return { ops: [], cursorY: 742 };
}

function drawRect(page: PdfPageBuilder, x: number, y: number, w: number, h: number, grayFill?: number): void {
  if (typeof grayFill === 'number') {
    page.ops.push(`q ${grayFill.toFixed(2)} g ${x} ${y} ${w} ${h} re f Q`);
  } else {
    page.ops.push(`q 0.75 G 0.6 w ${x} ${y} ${w} ${h} re S Q`);
  }
}

function drawRule(page: PdfPageBuilder, x1: number, x2: number, y: number): void {
  page.ops.push(`q 0.70 G 0.5 w ${x1} ${y} m ${x2} ${y} l S Q`);
}

function drawText(
  page: PdfPageBuilder,
  font: 'F1' | 'F2' | 'F3',
  size: number,
  x: number,
  y: number,
  text: string,
  gray = 0
): void {
  page.ops.push(
    `BT /${font} ${size} Tf ${gray.toFixed(2)} g 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`
  );
}

export function generateAuditBinderPdf(
  report: CompliancePostureReport,
  manifestEntries: VaultManifestEntry[] = []
): Buffer {
  const pages: PdfPageBuilder[] = [];

  // Page 1: Executive Readiness Summary & 12-Control Matrix
  const p1 = createPage();
  pages.push(p1);

  drawRect(p1, 42, 716, 528, 42, 0.12);
  drawText(p1, 'F2', 14, 54, 738, 'SOC2 & ISO/IEC 27001:2022 AUDIT EVIDENCE BINDER', 1.0);
  drawText(
    p1,
    'F1',
    9,
    54,
    724,
    `Organization: ${report.organizationName}  |  Evaluated: ${report.evaluatedAt}`,
    0.92
  );

  p1.cursorY = 694;
  drawRect(p1, 42, 616, 528, 72, 0.95);
  drawRect(p1, 42, 616, 528, 72);

  drawText(p1, 'F2', 11, 54, 672, 'EXECUTIVE READINESS SUMMARY');
  drawText(
    p1,
    'F2',
    10,
    54,
    655,
    `Overall Posture: ${report.overallStatus}   |   Readiness Score: ${report.readinessScore}/100   |   SOC2: ${report.soc2Score}/100   |   ISO 27001: ${report.iso27001Score}/100`
  );
  drawText(p1, 'F3', 7.5, 54, 639, `Evidence SHA-256 : ${report.evidenceDigest}`);
  drawText(p1, 'F3', 7.5, 54, 626, `Chain Seal Hash  : ${report.chainSealHash}`);

  p1.cursorY = 592;
  drawText(p1, 'F2', 11, 42, p1.cursorY, 'CONTROL EVALUATION MATRIX (SOC2 TSC + ISO/IEC 27001:2022 ANNEX A)');
  p1.cursorY -= 16;

  drawRect(p1, 42, p1.cursorY - 4, 528, 16, 0.2);
  drawText(
    p1,
    'F3',
    8,
    48,
    p1.cursorY,
    `${padCol('FRAMEWORK', 11)}${padCol('CONTROL', 9)}${padCol('STATUS', 9)}${padCol('SCORE', 7)}${padCol('TITLE / DEFICITS', 46)}`,
    1.0
  );
  p1.cursorY -= 18;

  for (let i = 0; i < report.controls.length; i++) {
    const ctrl = report.controls[i];
    if (i % 2 === 1) {
      drawRect(p1, 42, p1.cursorY - 5, 528, 16, 0.96);
    }
    const detail =
      ctrl.deficitCodes.length > 0
        ? `${ctrl.title} [${ctrl.deficitCodes.join(', ')}]`
        : `${ctrl.title} [OK]`;
    const rowLine = `${padCol(ctrl.framework, 11)}${padCol(ctrl.controlId, 9)}${padCol(ctrl.status, 9)}${padCol(`${ctrl.score}%`, 7)}${padCol(detail, 48)}`;
    drawText(p1, 'F3', 7.8, 48, p1.cursorY, rowLine, 0.05);
    p1.cursorY -= 16;
  }

  drawRule(p1, 42, 570, p1.cursorY + 6);

  // Page 2+: Failing Asset Findings & Vault Hash-Chain Manifest
  let current = createPage();
  pages.push(current);

  const ensureSpace = (neededPt: number): void => {
    if (current.cursorY - neededPt < 60) {
      current = createPage();
      pages.push(current);
      drawText(current, 'F2', 10, 42, current.cursorY, `${report.organizationName} - Audit Binder (Continued)`);
      current.cursorY -= 20;
    }
  };

  drawText(current, 'F2', 12, 42, current.cursorY, 'FAILING ASSET FINDINGS AND REMEDIATION SCHEDULE');
  current.cursorY -= 10;
  drawRule(current, 42, 570, current.cursorY);
  current.cursorY -= 16;

  const nonPassing = report.controls.filter((c) => c.status !== 'PASS');
  if (nonPassing.length === 0) {
    drawText(
      current,
      'F1',
      9.5,
      42,
      current.cursorY,
      'Zero failing or partial controls detected. All 12 SOC2 and ISO 27001 controls satisfied.'
    );
    current.cursorY -= 24;
  } else {
    for (const c of nonPassing) {
      ensureSpace(52);
      drawText(
        current,
        'F2',
        9.5,
        42,
        current.cursorY,
        `[${c.framework} ${c.controlId}] ${c.title} - Status: ${c.status} (Score: ${c.score}/100)`
      );
      current.cursorY -= 13;
      drawText(
        current,
        'F3',
        7.8,
        52,
        current.cursorY,
        `Deficits: ${c.deficitCodes.join(', ') || 'NONE'}`
      );
      current.cursorY -= 12;
      drawText(
        current,
        'F3',
        7.8,
        52,
        current.cursorY,
        `Assets  : ${c.failingAssets.slice(0, 6).join(', ') || 'N/A'}`
      );
      current.cursorY -= 12;
      drawText(current, 'F1', 8.5, 52, current.cursorY, `Action  : ${c.remediationSummary}`);
      current.cursorY -= 18;
    }
  }

  ensureSpace(64);
  current.cursorY -= 8;
  drawText(current, 'F2', 12, 42, current.cursorY, 'CRYPTOGRAPHIC EVIDENCE VAULT MANIFEST LEDGER');
  current.cursorY -= 10;
  drawRule(current, 42, 570, current.cursorY);
  current.cursorY -= 16;

  if (manifestEntries.length === 0) {
    drawText(current, 'F1', 9, 42, current.cursorY, 'No encrypted vault artifacts attached to this binder.');
    current.cursorY -= 16;
  } else {
    for (const entry of manifestEntries) {
      ensureSpace(44);
      drawText(
        current,
        'F2',
        8.5,
        42,
        current.cursorY,
        `#${entry.sequence}  ${entry.artifactId}  (${entry.artifactType})  [${entry.byteLength} bytes]`
      );
      current.cursorY -= 12;
      drawText(current, 'F3', 7.3, 52, current.cursorY, `Object Key     : ${entry.objectKey}`);
      current.cursorY -= 11;
      drawText(current, 'F3', 7.3, 52, current.cursorY, `Cipher SHA-256 : ${entry.ciphertextSha256}`);
      current.cursorY -= 11;
      drawText(current, 'F3', 7.3, 52, current.cursorY, `Chain EntryHash: ${entry.entryHash}`);
      current.cursorY -= 16;
    }
  }

  const totalPages = pages.length;
  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const pg = pages[pIdx];
    drawRule(pg, 42, 570, 44);
    drawText(
      pg,
      'F1',
      8,
      42,
      32,
      `Generated by @sentinel-kit/soc2-collector  |  Page ${pIdx + 1} of ${totalPages}`,
      0.35
    );
  }

  // Object numbering:
  // 1: Catalog, 2: Pages, 3: Helvetica, 4: Helvetica-Bold, 5: Courier
  // For page i (0..totalPages-1): contentObj = 6 + i*2, pageObj = 7 + i*2
  const totalObjects = 5 + totalPages * 2;
  const pageObjectIds: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjectIds.push(7 + i * 2);
  }

  const chunks: Buffer[] = [];
  const offsets = new Array<number>(totalObjects + 1).fill(0);
  let byteCursor = 0;

  const pushRaw = (buf: Buffer): void => {
    chunks.push(buf);
    byteCursor += buf.length;
  };

  const pushAscii = (str: string): void => {
    pushRaw(Buffer.from(str, 'ascii'));
  };

  // Binary PDF 1.4 header with 4 high-bit comment bytes per ISO 32000-1 7.5.2.
  pushRaw(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const writeObject = (id: number, body: string): void => {
    offsets[id] = byteCursor;
    pushAscii(`${id} 0 obj\n${body}\nendobj\n`);
  };

  writeObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  writeObject(
    2,
    `<< /Type /Pages /Kids [ ${pageObjectIds.map((id) => `${id} 0 R`).join(' ')} ] /Count ${totalPages} >>`
  );
  writeObject(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  writeObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  writeObject(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');

  for (let i = 0; i < totalPages; i++) {
    const contentId = 6 + i * 2;
    const pageId = 7 + i * 2;
    const streamText = `${pages[i].ops.join('\n')}\n`;
    const streamLen = Buffer.byteLength(streamText, 'ascii');

    writeObject(contentId, `<< /Length ${streamLen} >>\nstream\n${streamText}endstream`);
    writeObject(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>`
    );
  }

  const xrefOffset = byteCursor;
  pushAscii(`xref\n0 ${totalObjects + 1}\n`);
  // Each xref entry is strictly 20 bytes: 10-digit offset, space, 5-digit gen, space, f/n, space, LF.
  pushAscii('0000000000 65535 f \n');
  for (let id = 1; id <= totalObjects; id++) {
    const offStr = String(offsets[id]).padStart(10, '0');
    pushAscii(`${offStr} 00000 n \n`);
  }

  pushAscii(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return Buffer.concat(chunks);
}
