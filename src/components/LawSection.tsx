import LawyersHero from "@/components/law/LawyersHero";
import LawPrices from "@/components/law/LawPrices";
import { LawComparison, LawCases } from "@/components/law/LawComparisonCases";
import LawCTA from "@/components/law/LawCTA";

interface LawSectionProps {
  onOpenModal: () => void;
  onScrollTo: (id: string) => void;
}

const DIVIDER = (
  <div className="max-w-6xl mx-auto px-6 md:px-10">
    <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
  </div>
);

export default function LawSection({ onOpenModal, onScrollTo }: LawSectionProps) {
  return (
    <>
      {DIVIDER}
      <LawyersHero onOpenModal={onOpenModal} />
      {DIVIDER}
      <LawPrices onOpenModal={onOpenModal} onScrollTo={onScrollTo} />
      {DIVIDER}
      <LawComparison onOpenModal={onOpenModal} />
      {DIVIDER}
      <LawCases onOpenModal={onOpenModal} />
      {DIVIDER}
      <LawCTA onOpenModal={onOpenModal} onScrollTo={onScrollTo} />
    </>
  );
}
