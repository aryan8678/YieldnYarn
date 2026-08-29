export function HeroArc() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[60%] w-full max-w-5xl opacity-90"
      viewBox="0 0 1951 900"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
    >
      <g style={{ filter: "blur(50px)", mixBlendMode: "plus-lighter" }}>
        <path
          d="M100 900C100 500 500 200 975.5 200C1451 200 1851 500 1851 900"
          stroke="url(#arc-gradient-1)"
          strokeWidth="40"
        />
      </g>
      <g style={{ filter: "blur(30px)", mixBlendMode: "plus-lighter" }}>
        <path
          d="M150 900C150 520 520 240 975.5 240C1431 240 1801 520 1801 900"
          stroke="url(#arc-gradient-2)"
          strokeWidth="20"
        />
      </g>
      <g style={{ filter: "blur(12px)", mixBlendMode: "plus-lighter" }}>
        <path
          d="M200 900C200 540 540 280 975.5 280C1411 280 1751 540 1751 900"
          stroke="url(#arc-gradient-3)"
          strokeWidth="4"
        />
      </g>
      <path
        d="M200 900C200 540 540 280 975.5 280C1411 280 1751 540 1751 900"
        stroke="url(#arc-gradient-3)"
        strokeWidth="2"
      />
      <defs>
        <linearGradient id="arc-gradient-1" x1="100" y1="200" x2="1851" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0" />
          <stop offset="0.5" stopColor="#10B981" stopOpacity="0.6" />
          <stop offset="1" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="arc-gradient-2" x1="150" y1="240" x2="1801" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" stopOpacity="0" />
          <stop offset="0.5" stopColor="#34D399" stopOpacity="0.8" />
          <stop offset="1" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="arc-gradient-3" x1="200" y1="280" x2="1751" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A7F3D0" stopOpacity="1" />
          <stop offset="1" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
