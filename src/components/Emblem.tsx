export function Emblem({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor">
      {/* outer shield */}
      <path
        d="M24 3 L41 9 V23 C41 33 33 41 24 44 C15 41 7 33 7 23 V9 Z"
        fill="#151a23"
        stroke="#c9a961"
        strokeWidth="1.5"
      />
      {/* inner star */}
      <path
        d="M24 14 L26.2 20.6 L33.2 20.6 L27.5 24.8 L29.7 31.4 L24 27.3 L18.3 31.4 L20.5 24.8 L14.8 20.6 L21.8 20.6 Z"
        fill="#c9a961"
        stroke="none"
      />
    </svg>
  );
}
