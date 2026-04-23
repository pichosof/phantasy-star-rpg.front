import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import * as S from './PdfDocumentViewer.styles';

export const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PdfDocumentViewerProps {
  url: string;
}

export const PdfDocumentViewer: React.FC<PdfDocumentViewerProps> = ({ url }) => {
  const layoutPlugin = defaultLayoutPlugin();

  return (
    <Worker workerUrl={PDF_WORKER_URL}>
      <S.Root>
        <Viewer fileUrl={url} plugins={[layoutPlugin]} />
      </S.Root>
    </Worker>
  );
};
