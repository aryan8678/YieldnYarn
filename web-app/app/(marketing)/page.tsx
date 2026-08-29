import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { FeaturesBento } from "@/components/marketing/features-bento";
import { ProjectShowcase } from "@/components/marketing/project-showcase";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { Testimonials } from "@/components/marketing/testimonials";
import { StatsSection } from "@/components/marketing/stats-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function Home() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <FeaturesBento />
      <ProjectShowcase />
      <ComparisonTable />
      <Testimonials />
      <StatsSection />
      <CtaSection />
    </>
  );
}
