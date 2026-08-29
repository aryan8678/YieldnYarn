import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const TESTIMONIALS_ROW_1 = [
  {
    quote:
      "Finally, a platform that lets me prove the quality of my produce to buyers I'll never meet in person.",
    name: "Rajesh K.",
    title: "Wheat Farmer, Uttar Pradesh",
  },
  {
    quote:
      "The multi-seller allocation saved me weeks of individual sourcing for my textile order.",
    name: "Priya M.",
    title: "Buyer, Gujarat",
  },
  {
    quote:
      "I can set my prices based on real market data instead of guessing.",
    name: "Mohan S.",
    title: "Cotton Seller, Maharashtra",
  },
  {
    quote:
      "The AI grading report gave my buyers confidence in a product they'd never seen in person.",
    name: "Lakshmi N.",
    title: "Handloom Seller, Tamil Nadu",
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    quote:
      "Real-time price alerts changed how I plan my harvest sales — no more guesswork.",
    name: "Suresh P.",
    title: "Wheat Seller, Punjab",
  },
  {
    quote:
      "Dispute resolution actually worked when a shipment didn't match its grade report.",
    name: "Fatima A.",
    title: "Buyer, Delhi NCR",
  },
  {
    quote:
      "Onboarding took an afternoon and I had my first listing live the same day.",
    name: "Devendra R.",
    title: "Cotton Seller, Madhya Pradesh",
  },
  {
    quote:
      "The verification queue keeps quality high without slowing down my sales.",
    name: "Anjali T.",
    title: "Textile Seller, Rajasthan",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl overflow-hidden px-6 py-24 sm:px-10">
      <h2 className="text-center text-4xl font-semibold tracking-tight text-heading md:text-5xl">
        Trusted by MSMEs Across India
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-body">
        Early feedback from the sellers and buyers piloting the platform.
      </p>

      <div className="mt-12 flex flex-col gap-4">
        <InfiniteMovingCards items={TESTIMONIALS_ROW_1} direction="left" speed="slow" />
        <InfiniteMovingCards items={TESTIMONIALS_ROW_2} direction="right" speed="slow" />
      </div>
    </section>
  );
}
