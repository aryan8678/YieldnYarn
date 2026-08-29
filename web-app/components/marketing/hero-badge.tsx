export function HeroBadge() {
  return (
    <a
      href="#features"
      className="flex w-fit rounded-full bg-neutral-900 p-1 shadow-lg shadow-black"
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="rounded-full bg-neutral-950 px-2 py-1 text-[10px] font-medium text-brand-primary-glow sm:text-xs">
          MSME Marketplace
        </div>
        <div className="text-natural-white/80 rounded-full pr-2 text-[10px] sm:text-xs">
          Empowering Indian producers
        </div>
      </div>
    </a>
  );
}
