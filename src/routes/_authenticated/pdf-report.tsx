import { createFileRoute } from '@tanstack/react-router';
import { PDFViewer } from '@react-pdf/renderer';

import BiltiDocumentPdf from '@/components/pdfs/BiltiDocumentPdf';
import BookingAgreementPdf from '@/components/pdfs/BookingAgreementPdf';
import InvoiceDocumentPdf from '@/components/pdfs/InvoiceDocumentPdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/_authenticated/pdf-report')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        PDF Report
      </h1>

      <Tabs defaultValue="booking-agreement" className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="booking-agreement">BookingAgreement</TabsTrigger>
          <TabsTrigger value="bilti">Bilti</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="booking-agreement" className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <PDFViewer width="100%" height={720} showToolbar className="block w-full">
              <BookingAgreementPdf />
            </PDFViewer>
          </div>
        </TabsContent>

        <TabsContent value="bilti" className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <PDFViewer width="100%" height={720} showToolbar className="block w-full">
              <BiltiDocumentPdf />
            </PDFViewer>
          </div>
        </TabsContent>

        <TabsContent value="invoice" className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <PDFViewer width="100%" height={720} showToolbar className="block w-full">
              <InvoiceDocumentPdf />
            </PDFViewer>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
