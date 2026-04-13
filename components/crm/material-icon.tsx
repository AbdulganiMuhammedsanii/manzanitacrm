export function MaterialIcon({
  name,
  className = "",
  filled = false,
  "aria-hidden": ariaHidden = true,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  "aria-hidden"?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      aria-hidden={ariaHidden}
      style={{
        fontFamily: '"Material Symbols Outlined"',
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
    >
      {name}
    </span>
  );
}
