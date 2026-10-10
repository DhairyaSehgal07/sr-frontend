import { type DocumentProps, pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { toast } from 'sonner';

import BiltiDocumentPdf from '@/components/pdfs/BiltiDocumentPdf';
import InvoiceDocumentPdf, {
  type InvoiceDocumentLayout,
} from '@/components/pdfs/InvoiceDocumentPdf';
import { pdfIssuerFromUser, withEmbeddedLogo } from '@/components/pdfs/pdf-issuer';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';

async function openPdfDocument(document: ReactElement<DocumentProps>): Promise<void> {
  // Open during the click gesture. Do not use `noopener` here — it makes
  // window.open() return null even when the tab opens successfully.
  const previewWindow = window.open('about:blank', '_blank');

  if (!previewWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups for this site to open the PDF.');
  }

  previewWindow.opener = null;
  previewWindow.document.title = 'Generating PDF…';

  try {
    const blob = await pdf(document).toBlob();
    const url = URL.createObjectURL(blob);
    previewWindow.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    previewWindow.close();
    throw error;
  }
}

export async function openNikasiGatePassPrint(
  doc: 'invoice' | 'bilti',
  gatePass: NikasiGatePass,
  options?: { invoiceLayout?: InvoiceDocumentLayout },
): Promise<void> {
  try {
    const issuer = await withEmbeddedLogo(pdfIssuerFromUser(useAuthStore.getState().user));

    if (doc === 'invoice') {
      await openPdfDocument(
        <InvoiceDocumentPdf data={gatePass} layout={options?.invoiceLayout} issuer={issuer} />,
      );
      return;
    }

    await openPdfDocument(<BiltiDocumentPdf data={gatePass} issuer={issuer} />);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to open PDF.', {
      position: 'bottom-right',
    });
  }
}
