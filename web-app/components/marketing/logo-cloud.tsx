const LOGOS = [
  "MSME Ministry",
  "NSIC",
  "Agmarknet",
  "APEDA",
  "BIS",
  "Textile Commissioner",
  "KVIC",
  "SIDBI",
  "NABARD",
  "NITI Aayog",
];

export function LogoCloud() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <p className="text-center font-mono text-sm tracking-widest text-muted-2 uppercase">
        Backed by India&apos;s MSME ecosystem
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {LOGOS.map((logo) => (
          <span
            key={logo}
            className="text-sm font-semibold whitespace-nowrap text-natural-white/40 grayscale transition-all duration-300 hover:text-natural-white/80"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
