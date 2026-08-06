/** Static ROC-curve motif — the actual metric behind the 84.51% ROC-AUC hero stat. */
export function RocCurveMotif() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 220"
      className="pointer-events-none absolute -right-6 -top-10 h-52 w-72 opacity-[0.09]"
    >
      <line x1="20" y1="200" x2="280" y2="20" stroke="#241f18" strokeWidth="1" strokeDasharray="4 4" />
      <path
        d="M20 200 C 40 100, 70 40, 130 25 S 240 20 280 20"
        stroke="#a8441c"
        strokeWidth="2"
        fill="none"
      />
      <line x1="20" y1="20" x2="20" y2="200" stroke="#241f18" strokeWidth="1" />
      <line x1="20" y1="200" x2="280" y2="200" stroke="#241f18" strokeWidth="1" />
    </svg>
  );
}
