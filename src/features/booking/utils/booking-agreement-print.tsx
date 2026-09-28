import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { toast } from 'sonner';

import BookingAgreementPdf from '@/components/pdfs/BookingAgreementPdf';
import type { Booking } from '@/features/booking/api/types';

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

export async function openBookingAgreementPrint(booking: Booking): Promise<void> {
  try {
    await openPdfDocument(<BookingAgreementPdf booking={booking} />);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to open PDF.', {
      position: 'bottom-right',
    });
  }
}
