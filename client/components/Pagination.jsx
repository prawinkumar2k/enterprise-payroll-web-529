import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable pagination component.
 * Props:
 *   page        – current 1-based page number
 *   totalPages  – total number of pages
 *   total       – total record count
 *   pageSize    – records per page (default 100)
 *   onPageChange– callback(newPage)
 */
export default function Pagination({ page, totalPages, total, pageSize = 100, onPageChange }) {
  if (!total || totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Build page window: up to 5 buttons around current page
  const buildPages = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-3 border-t border-gray-200 bg-white text-sm">
      <span className="text-gray-500 text-xs whitespace-nowrap">
        Showing <span className="font-bold text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-bold text-gray-700">{total.toLocaleString()}</span> records
      </span>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium text-xs"
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {/* Page numbers */}
        {buildPages().map((p, idx) =>
          p === "..." ? (
            <span key={`dot-${idx}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded border text-xs font-bold transition ${
                p === page
                  ? "bg-blue-700 text-white border-blue-700 shadow"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium text-xs"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
