/**
 * One-shot generator for the demo Library files.
 *
 * Run with:  node scripts/generate-demo-files.mjs
 *
 * Outputs to public/demo-files/. The CSV is hand-authored and not regenerated
 * here (lives next to the produced files). Re-run after editing the content
 * blocks below to refresh the bundled demo documents.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/demo-files');

// ── PDF ────────────────────────────────────────────────────────────────────────

await new Promise((finish, fail) => {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 56, bottom: 56, left: 56, right: 56 } });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  doc.on('end', () => {
    writeFileSync(resolve(OUT_DIR, 'picho-quick-reference.pdf'), Buffer.concat(chunks));
    finish();
  });
  doc.on('error', fail);

  doc.font('Helvetica-Bold').fontSize(22).text('Picho-RPG — Player Quick Reference');
  doc.moveDown(0.4);
  doc
    .font('Helvetica-Oblique')
    .fontSize(11)
    .fillColor('#555')
    .text('A pocket sheet for new players sitting down at the Algol table.');
  doc.moveDown(1);

  doc.fillColor('#000').font('Helvetica-Bold').fontSize(14).text('1. The dice');
  doc
    .font('Helvetica')
    .fontSize(11)
    .moveDown(0.3)
    .text(
      'Picho-RPG runs on a simplified GURPS variant. Roll 3d6 under your skill or attribute. Margin of success matters: each point under your target adds 1 to damage or effect.',
    );
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fontSize(14).text('2. Combat order');
  doc
    .font('Helvetica')
    .fontSize(11)
    .moveDown(0.3)
    .text(
      'Initiative = Basic Speed. Tied? Higher Dexterity goes first. On your turn you can move OR attack OR cast OR ready, then take a free maneuver.',
    );
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fontSize(14).text('3. Magic schools');
  doc
    .font('Helvetica')
    .fontSize(11)
    .moveDown(0.3)
    .list([
      'Esper: innate, costs FP per spell.',
      'Tek: gear-based, costs mesetas per shot.',
      'Faith: free but slow; takes a full turn to cast.',
    ]);
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fontSize(14).text('4. Travel between worlds');
  doc
    .font('Helvetica')
    .fontSize(11)
    .moveDown(0.3)
    .text(
      'You need a Roadpass to ride between Palma, Motavia and Dezolis. The campaign opens with the Roadpass missing — recovering it is your first arc.',
    );
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fontSize(14).text('5. Key NPCs');
  doc
    .font('Helvetica')
    .fontSize(11)
    .moveDown(0.3)
    .list([
      'Alis Landale — your protagonist; vows revenge on Lassic.',
      'Lutz — Esper sage; joins after the Mansion arc.',
      'Odin — frozen warrior; thaws in Medusa’s Tower.',
      'Hapsby — engineer-priest of Paseo; trades favours for parts.',
    ]);

  doc.moveDown(2);
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#888').text('Picho-RPG demo · picho.org', { align: 'center' });

  doc.end();
});

// ── DOCX ───────────────────────────────────────────────────────────────────────

const docx = new Document({
  creator: 'Picho-RPG demo',
  title: 'Algol Gazetteer',
  description: 'A short setting bible for the Picho-RPG demo campaign.',
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('Algol Gazetteer')] }),
        new Paragraph({
          children: [
            new TextRun({
              italics: true,
              text: 'A short setting bible for the Picho-RPG demo campaign — Palma, Motavia, Dezolis.',
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun('')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Palma')] }),
        new Paragraph({
          children: [
            new TextRun(
              'The garden world. Once a paradise of forests and inland seas, now corseted by Lassic’s edicts. Camineet, the capital, is where the campaign opens.',
            ),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ bold: true, text: 'Cities of note: ' }), new TextRun('Camineet, Eppi, Scion.')],
        }),
        new Paragraph({
          children: [
            new TextRun({ bold: true, text: 'Hazards: ' }),
            new TextRun('Owl Bears in the western forest; Lassic’s patrols in every market.'),
          ],
        }),
        new Paragraph({ children: [new TextRun('')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Motavia')] }),
        new Paragraph({
          children: [
            new TextRun(
              'A desert planet older than memory. Dotted with oases and the workshops of the Hapsby engineers, who repair anything mechanical for the right price.',
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ bold: true, text: 'Cities of note: ' }),
            new TextRun('Paseo, Sopia, Aiedo (off-screen).'),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ bold: true, text: 'Hazards: ' }),
            new TextRun('Sand Worms by night; mirage cults at the Three Wells.'),
          ],
        }),
        new Paragraph({ children: [new TextRun('')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Dezolis')] }),
        new Paragraph({
          children: [
            new TextRun(
              'Frozen most of the year. Skure is the only town that lets outsiders in, and only after they’ve survived the trek through the high pass.',
            ),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ bold: true, text: 'Cities of note: ' }), new TextRun('Skure, Tyler (ruins).')],
        }),
        new Paragraph({
          children: [
            new TextRun({ bold: true, text: 'Hazards: ' }),
            new TextRun('Frost Wyverns above the treeline; ice fields that crack underfoot.'),
          ],
        }),
        new Paragraph({ children: [new TextRun('')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('The Esper Mansion')] }),
        new Paragraph({
          children: [
            new TextRun(
              'A sanctum hidden between dimensions. Reaching it requires the Roadpass and a guide. The campaign’s second-act fulcrum.',
            ),
          ],
        }),
        new Paragraph({ children: [new TextRun('')] }),

        new Paragraph({
          children: [
            new TextRun({
              italics: true,
              color: '888888',
              text: 'Picho-RPG demo · picho.org',
            }),
          ],
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(docx);
writeFileSync(resolve(OUT_DIR, 'algol-gazetteer.docx'), buffer);

console.log('[demo] Generated picho-quick-reference.pdf and algol-gazetteer.docx');
