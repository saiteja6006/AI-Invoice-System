"use client";

import { useEffect, useMemo, useState } from "react";

type InvoiceHistoryItem = {
  id?: string;
  created_at?: string;
  text_preview?: string;

  final_decision?: {
    decision?: string;
  };

  extracted_data?: {
    invoice_number?: string;
    amount?: number;
    vendor?: string;
  };
};

// const API_URL = "http://:8000/invoices";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/invoices`;

function formatDate(value?: string) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPreviewText(item: InvoiceHistoryItem) {
  const preview = item.text_preview?.trim();

  if (!preview) {
    return "No preview text available for this invoice.";
  }

  return preview.length > 180 ? `${preview.slice(0, 180)}...` : preview;
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadInvoices() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch invoice history.");
        }

        const data = await response.json();

        if (isActive) {
          setInvoices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Unable to load invoice history.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const first = a.created_at ? new Date(a.created_at).getTime() : 0;
      const second = b.created_at ? new Date(b.created_at).getTime() : 0;
      return second - first;
    });
  }, [invoices]);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Recent invoice history</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Saved invoices from the backend with decision summaries and preview text.
          </p>
        </div>
        <span className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300">
          {sortedInvoices.length} records
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/60 p-6 text-sm text-neutral-400">
          Loading invoice history...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : sortedInvoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/60 p-6 text-sm text-neutral-400">
          No saved invoices found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedInvoices.map((invoice, index) => (
            <article
              key={invoice.id ?? `${invoice.created_at ?? "invoice"}-${index}`}
              className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 transition-colors hover:border-neutral-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    {invoice.final_decision?.decision ?? "Decision unavailable"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{formatDate(invoice.created_at)}</p>
                </div>
                <span className="w-fit rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300">
                  Recent record
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-300">{getPreviewText(invoice)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}