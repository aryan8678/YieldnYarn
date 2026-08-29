export function HeroDots() {
  // Deterministic pseudo-random scattered dot field (avoids SSR/CSR mismatch).
  const dots = Array.from({ length: 40 }).map((_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    return {
      cx: (i * 37) % 822,
      cy: Math.floor(rand * 158),
      r: i % 5 === 0 ? 1.5 : 1,
      o: 0.15 + (rand % 0.2),
    };
  });

  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-[158px] w-full max-w-4xl opacity-70"
      viewBox="0 0 822 158"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {dots.map((dot, idx) => (
        <circle
          key={idx}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="white"
          opacity={dot.o}
        />
      ))}
    </svg>
  );
}
