import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { PageHero } from "@/components/marketing/page-hero";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog — MSME Marketplace",
  description: "Market insights and MSME intelligence from the MSME Marketplace team.",
};

const FEATURED_POST = {
  category: "Industry",
  title: "The Future of MSME Digital Trade in India",
  excerpt:
    "Why the next decade of commodity trade in India runs through digital marketplaces — and what that means for producers who've never sold outside their district.",
  author: "MSME Marketplace Team",
  date: "Aug 2026",
  readTime: "7 min read",
};

const POSTS = [
  {
    category: "Market Data",
    title: "Understanding Agmarknet: India's Agricultural Market Data",
    excerpt:
      "A practical guide to what Agmarknet tracks, how often it updates, and how we turn raw mandi prices into a grade-adjusted estimate.",
    author: "Price Intelligence Team",
    date: "Jul 2026",
    readTime: "5 min read",
  },
  {
    category: "AI & Grading",
    title: "How AI Grading is Transforming Commodity Quality Assurance",
    excerpt:
      "From manual inspection to confidence-scored computer vision — and why a human verifier is still in the loop for the calls a model shouldn't make alone.",
    author: "Grading Engineering",
    date: "Jun 2026",
    readTime: "6 min read",
  },
  {
    category: "Price Trends",
    title: "Cotton Price Trends: What Sellers Need to Know",
    excerpt:
      "A look at recent cotton price movement across major mandis, and how grade-adjusted pricing changes what 'the market rate' actually means for you.",
    author: "Price Intelligence Team",
    date: "May 2026",
    readTime: "4 min read",
  },
  {
    category: "Industry",
    title: "Multi-Seller Allocation, Explained",
    excerpt:
      "One buyer requirement can be filled by five different sellers. Here's the greedy allocation algorithm that makes that happen without anyone overselling.",
    author: "MSME Marketplace Team",
    date: "Apr 2026",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Market Insights & MSME Intelligence"
        description="Notes on pricing, grading, and what we're learning from running a multi-vertical marketplace."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <Link
          href="#"
          className="group grid grid-cols-1 gap-8 rounded-3xl border border-border-muted bg-surface p-8 transition-colors hover:border-brand-primary/40 md:grid-cols-2 md:p-10"
        >
          <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-900/40 via-neutral-900 to-neutral-950 md:aspect-auto">
            <span className="text-6xl font-bold text-white/5">MSME</span>
          </div>
          <div className="flex flex-col justify-center">
            <Badge className="w-fit bg-brand-primary/15 text-brand-primary-glow">
              {FEATURED_POST.category}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold text-heading transition-colors group-hover:text-brand-primary-glow sm:text-3xl">
              {FEATURED_POST.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-body">
              {FEATURED_POST.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-muted-2">
              <span>{FEATURED_POST.author}</span>
              <span>·</span>
              <span>{FEATURED_POST.date}</span>
              <span>·</span>
              <span>{FEATURED_POST.readTime}</span>
            </div>
          </div>
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {POSTS.map((post) => (
            <Link
              key={post.title}
              href="#"
              className="group flex flex-col rounded-2xl border border-border-muted bg-surface p-6 transition-colors hover:border-brand-primary/40"
            >
              <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950">
                <span className="text-3xl font-bold text-white/5">MSME</span>
              </div>
              <Badge variant="outline" className="mt-4 w-fit text-muted-2">
                {post.category}
              </Badge>
              <h3 className="mt-3 text-base font-semibold text-heading transition-colors group-hover:text-brand-primary-glow">
                {post.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-body">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-2">
                <span>
                  {post.author} · {post.date}
                </span>
                <span className="flex items-center gap-1 text-natural-white/70 transition-colors group-hover:text-brand-primary-glow">
                  Read
                  <IconArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <div className="rounded-3xl border border-border-muted bg-neutral-950 px-6 py-16 text-center sm:px-16">
          <h2 className="text-2xl font-semibold tracking-tight text-natural-white sm:text-3xl">
            Get market updates in your inbox
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-body">
            Price trends, grading changes, and new vertical launches — no spam.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
