import { PDFViewer } from '@react-pdf/renderer';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import BiltiDocumentPdf from '@/components/pdfs/BiltiDocumentPdf';
import InvoiceDocumentPdf from '@/components/pdfs/InvoiceDocumentPdf';
import { type PdfIssuer, pdfIssuerFromUser, withEmbeddedLogo } from '@/components/pdfs/pdf-issuer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

export const Route = createFileRoute('/_authenticated/pdf-report')({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuthStore((state) => state.user);
  const [issuer, setIssuer] = useState<PdfIssuer>(() => pdfIssuerFromUser(user));

  useEffect(() => {
    const nextIssuer = pdfIssuerFromUser(user);
    setIssuer(nextIssuer);

    let cancelled = false;
    void withEmbeddedLogo(nextIssuer).then((embedded) => {
      if (!cancelled) setIssuer(embedded);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <h1 className="font-heading truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        PDF Report
      </h1>

      <Tabs defaultValue="bilti" className="w-full gap-4">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="bilti">Bilti</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="bilti" className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <PDFViewer width="100%" height={720} showToolbar className="block w-full">
              <BiltiDocumentPdf issuer={issuer} />
            </PDFViewer>
          </div>
        </TabsContent>

        <TabsContent value="invoice" className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <PDFViewer width="100%" height={720} showToolbar className="block w-full">
              <InvoiceDocumentPdf issuer={issuer} />
            </PDFViewer>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
