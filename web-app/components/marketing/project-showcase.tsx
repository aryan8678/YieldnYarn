import { cn } from "@/lib/utils";

const SHOWCASE_ITEMS = [
  {
    title: "Agriculture Vertical",
    description: "Wheat grading view — AI attribute scores and confidence.",
    tags: ["Agriculture", "AI Grading"],
    gradient: "from-emerald-200 via-lime-100 to-amber-100",
    light: true,
    span: "lg:col-span-3",
  },
  {
    title: "Textile Quality Analysis",
    description: "Cotton fabric defect detection with per-batch reports.",
    tags: ["Textiles", "AI Grading"],
    gradient: "from-neutral-900 via-neutral-800 to-emerald-950",
    light: false,
    span: "lg:col-span-2",
  },
  {
    title: "Seller Mobile App",
    description: "Listing creation screen from the Android seller app.",
    tags: ["Seller App"],
    gradient: "from-emerald-950 via-neutral-900 to-neutral-950",
    light: false,
    span: "lg:col-span-2",
  },
  {
    title: "Price Intelligence Dashboard",
    description: "Live Agmarknet charts, trends, and grade-adjusted pricing.",
    tags: ["Price Intelligence"],
    gradient: "from-amber-100 via-emerald-50 to-emerald-100",
    light: true,
    span: "lg:col-span-3",
  },
  {
    title: "Admin Console",
    description: "Vertical configuration — grading attributes and pricing rules.",
    tags: ["Admin Console"],
    gradient: "from-neutral-950 via-neutral-900 to-neutral-800",
    light: false,
    span: "lg:col-span-3",
  },
  {
    title: "Multi-Seller Order Allocation",
    description: "A single requirement fulfilled by three matched sellers.",
    tags: ["Order Matching"],
    gradient: "from-emerald-100 via-white to-neutral-100",
    light: true,
    span: "lg:col-span-2",
  },
];

export function ProjectShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <h2 className="text-center text-4xl font-semibold tracking-tight text-heading md:text-5xl">
        See the Platform in Action
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-body">
        A look at the experiences we&apos;re building for sellers, buyers,
        verifiers, and admins.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.title}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border-muted p-6",
              item.span
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-linear-to-br transition-transform duration-500 group-hover:scale-105",
                item.gradient
              )}
              role="img"
              aria-label={`${item.title} interface preview placeholder`}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
            <div className="relative z-10 flex h-56 flex-col justify-end sm:h-64">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm",
                      item.light
                        ? "bg-black/10 text-black"
                        : "bg-white/10 text-white"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3
                className={cn(
                  "mt-3 text-lg font-semibold",
                  item.light ? "text-neutral-900" : "text-white"
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  item.light ? "text-neutral-800/80" : "text-white/70"
                )}
              >
                {item.description}
              </p>
              <span
                className={cn(
                  "mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1",
                  item.light ? "text-emerald-800" : "text-emerald-300"
                )}
              >
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
