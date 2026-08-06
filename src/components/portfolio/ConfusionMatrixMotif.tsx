/** Static confusion-matrix motif — one of the actual evaluation methods used in the churn project. */
export function ConfusionMatrixMotif() {
  const size = 4;
  const cell = 34;
  const gap = 4;
  const step = cell + gap;
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isDiag = r === c;
      const opacity = isDiag ? 0.5 : Math.max(0.06, 0.28 - Math.abs(r - c) * 0.08);
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * step}
          y={r * step}
          width={cell}
          height={cell}
          rx={4}
          fill="#a8441c"
          opacity={opacity}
        />,
      );
    }
  }
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${size * step} ${size * step}`}
      className="pointer-events-none absolute -bottom-8 -left-8 h-56 w-56 opacity-[0.14]"
    >
      {cells}
    </svg>
  );
}
