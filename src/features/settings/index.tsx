import { Link } from '@tanstack/react-router';
import { ArrowRight, BookCopy } from 'lucide-react';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsPage() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Settings
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/settings/bill-books"
          aria-label="Manage bill books"
          className="group min-w-0 rounded-4xl focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          <Card className="h-full transition-colors group-hover:bg-muted/50">
            <CardHeader>
              <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookCopy className="size-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                Manage Bill Books
              </CardTitle>
              <CardDescription>Create and manage bill books used on gate passes.</CardDescription>
              <CardAction>
                <ArrowRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </CardAction>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </main>
  );
}
