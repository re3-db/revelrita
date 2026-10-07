"use client";

/** The preview bar's "Save as PDF": the browser's print dialog, using the print styles. */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()}>
      Save as PDF
    </button>
  );
}
