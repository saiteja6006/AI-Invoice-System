export interface AgentResult {
  agent: string;
  status: "pass" | "fail";
  reason: string;
}

export interface ProcessInvoiceResponse {
  summary: {
    decision: string;
    duplicate_detected: boolean;
  };

  invoice: {
    invoice_number?: string;
    amount?: number;
    vendor?: string;
    po_number?: string;
  };

  validation: AgentResult[];

  similar_invoices: string[];

  text_preview?: string;
}