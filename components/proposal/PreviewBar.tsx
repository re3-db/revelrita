import type { ReactNode } from "react";
import PrintButton from "@/components/proposal/PrintButton";

/**
 * The bar pinned over Helen's views of a proposal (the builder's Preview, and /proposal/<id>
 * while logged in): what she's looking at, "Share link", "Save as PDF" and her way back to the
 * editor. Clients never see it, and it doesn't print.
 */
export default function PreviewBar({
  tag,
  note,
  share,
  back,
}: {
  tag: string;
  note: string;
  share: ReactNode;
  back: ReactNode;
}) {
  return (
    <div id="editbar" className="pbar noprint">
      <div className="pbar-inner">
        <div className="pbar-note">
          <span className="pbar-tag">{tag}</span>
          {note}
        </div>
        <div className="pbar-actions">
          {share}
          <PrintButton />
          {back}
        </div>
      </div>
    </div>
  );
}
