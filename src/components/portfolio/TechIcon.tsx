import { getTechIcon } from "@/lib/techIcons";

export function TechIcon({ name, className = "h-3.5 w-3.5" }: { name: string; className?: string }) {
  const icon = getTechIcon(name);
  if (!icon) return null;
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill={`#${icon.hex}`} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
