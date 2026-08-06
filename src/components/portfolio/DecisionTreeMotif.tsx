/** Static decision-tree motif — one of the actual models compared in the churn project. */
export function DecisionTreeMotif() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 300"
      className="pointer-events-none absolute -right-10 -top-10 h-72 w-96 opacity-[0.07]"
    >
      <g stroke="#241f18" strokeWidth="1.5" fill="none">
        <line x1="200" y1="20" x2="100" y2="90" />
        <line x1="200" y1="20" x2="300" y2="90" />
        <line x1="100" y1="90" x2="40" y2="160" />
        <line x1="100" y1="90" x2="150" y2="160" />
        <line x1="300" y1="90" x2="250" y2="160" />
        <line x1="300" y1="90" x2="360" y2="160" />
        <line x1="40" y1="160" x2="20" y2="230" />
        <line x1="40" y1="160" x2="70" y2="230" />
        <line x1="150" y1="160" x2="130" y2="230" />
        <line x1="150" y1="160" x2="180" y2="230" />
      </g>
      <g fill="#a8441c">
        <circle cx="200" cy="20" r="5" />
        <circle cx="100" cy="90" r="4" />
        <circle cx="300" cy="90" r="4" />
        <circle cx="40" cy="160" r="3.5" />
        <circle cx="150" cy="160" r="3.5" />
        <circle cx="250" cy="160" r="3.5" />
        <circle cx="360" cy="160" r="3.5" />
      </g>
    </svg>
  );
}
