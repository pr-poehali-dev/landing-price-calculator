import ServicesGrid from "@/components/ServicesGrid";
import PriceCards from "@/components/PriceCards";
import CalculatorSection from "@/components/CalculatorSection";
import ProcessSection from "@/components/ProcessSection";

interface PriceSectionProps {
  onScrollTo: (id: string) => void;
}

const DIVIDER = (
  <div className="max-w-6xl mx-auto px-6 md:px-10">
    <div
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      }}
    />
  </div>
);

export default function PriceSection({ onScrollTo }: PriceSectionProps) {
  return (
    <>
      <ServicesGrid />
      <PriceCards onScrollTo={onScrollTo} />
      {DIVIDER}
      <CalculatorSection />
      {DIVIDER}
      <ProcessSection />
    </>
  );
}
