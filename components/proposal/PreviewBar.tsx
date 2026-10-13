import type { ReactNode } from "react";
import PrintButton from "@/components/proposal/PrintButton";

/**
 * The bar pinned over Helen's views of a proposal (the builder's Preview, and /proposal/<id>
 * while logged in): what she's looking at, "Save as PDF" and her way back to the editor.
 * Clients never see it, and it doesn't print.
 */
export default function PreviewBar({ tag, note, back }: { tag: string; note: string; back: ReactNode }) {
  return (
    <div id="editbar" className="pbar noprint">
      <div className="pbar-inner">
        <p className="pbar-note">
          <span className="pbar-tag">{tag}</span>
          {note}
        </p>
        <div className="pbar-actions">
          <PrintButton />
          {back}
        </div>
      </div>
    </div>
  );
}
