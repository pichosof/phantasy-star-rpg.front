/**
 * pdf.js assets (same version as the pdfjs-dist dependency). @react-pdf-viewer needs pdf.js 3.x,
 * so the viewers pass `isEvalSupported: false` (the fix for CVE-2024-4367 on 3.x).
 */
export const PDF_WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
export const PDF_STANDARD_FONTS_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/';
