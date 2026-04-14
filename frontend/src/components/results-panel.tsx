import { ProcessInvoiceResponse } from "@/types/invoice";

interface ResultsPanelProps {
  result: ProcessInvoiceResponse | null;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
        <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
        <p className="mt-2 text-sm text-slate-300">
          Upload an invoice to view the extracted preview, agent decisions, and similar invoice matches.
        </p>
      </div>
    );
  }

  
  const issues = result?.validation?.filter((r) => r.status === "fail") || [];


  const similarInvoices = result?.similar_invoices ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
          <p className="mt-1 text-sm text-slate-300">
            Review the AI-generated invoice summary, validation feedback, and decision signals.
          </p>
        </div>

        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
          {result.summary?.decision || "UNKNOWN"}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Text Preview
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {result.text_preview || "No text preview returned from the backend."}
          </p>
        </section>


        <section className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Final Decision
          </h3>

          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm font-medium text-emerald-200">
              {result.summary?.decision || "UNKNOWN"}
            </p>
          </div>

          {/* ISSUES */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Issues
            </h4>

            {issues.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">
                No issues reported by the decision stage.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {issues.map((issue, index) => (
                  <li
                    className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3"
                    key={`${issue.agent}-${index}`}
                  >
                    <p className="text-sm font-medium text-amber-200">
                      {issue.agent}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-amber-100/80">
                      {issue.status}
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {issue.reason}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

  
      <section className="mt-6 rounded-xl border border-white/10 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Agent Results
        </h3>

        <div className="mt-4 space-y-3">
          {result.validation.map((agentResult, index) => (
            <div
              className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3"
              key={`${agentResult.agent}-${index}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {agentResult.agent}
                </p>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-300">
                  {agentResult.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {agentResult.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SIMILAR INVOICES */}
      <section className="mt-6 rounded-xl border border-white/10 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Similar Invoices
          </h3>
          <span className="text-xs text-slate-400">
            {similarInvoices.length} matches
          </span>
        </div>

        {similarInvoices.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No similar invoices were returned.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {similarInvoices.map((invoice, index) => (
              <div
                className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3"
                key={index}
              >
                {/* ✅ FIX: simple text display (no score/payload) */}
                <p className="text-sm text-slate-300">
                  {invoice}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}