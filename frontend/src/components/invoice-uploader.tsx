"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { processInvoice } from "@/lib/api";
import { ProcessInvoiceResponse } from "@/types/invoice";

interface InvoiceUploaderProps {
  onSuccess: (data: ProcessInvoiceResponse) => void;
}

export function InvoiceUploader({ onSuccess }: InvoiceUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) {
      return "No file selected";
    }

    return `${selectedFile.name} • ${(selectedFile.size / 1024).toFixed(1)} KB`;
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a PDF invoice to upload.");
      return;
    }

    if (selectedFile.type && selectedFile.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const result = await processInvoice(selectedFile);

    if (!result || !result.summary) {
  throw new Error("Invalid response from server");
   }

onSuccess(result);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Upload Invoice</h2>
        <p className="mt-1 text-sm text-slate-300">
          Submit a PDF invoice to run the AI validation workflow and review the generated decision.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-400/40 bg-slate-950/40 px-4 py-8 text-center transition hover:border-cyan-300 hover:bg-slate-950/60">
          <span className="text-sm font-medium text-cyan-200">Click to choose a PDF file</span>
          <span className="mt-2 text-xs text-slate-400">Maximum quality results with clear invoice scans</span>
          <input accept="application/pdf" className="hidden" type="file" onChange={handleFileChange} />
        </label>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          {selectedFileLabel}
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isUploading}
          type="submit"
        >
          {isUploading ? "Processing invoice..." : "Process Invoice"}
        </button>
      </form>
    </div>
  );
}