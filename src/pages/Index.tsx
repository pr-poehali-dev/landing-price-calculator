import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import PriceSection from "@/components/PriceSection";
import FaqSection from "@/components/FaqSection";
import DocumentModal from "@/components/DocumentModal";

const REF_TRACK_URL = "https://functions.poehali.dev/2375bdea-fb06-45b1-9363-4231afc5750d";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("ref_code", ref.toUpperCase());
      fetch(REF_TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref_code: ref }),
      }).catch(() => {});
    }
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <HeroSection onScrollTo={scrollTo} onOpenModal={() => setModalOpen(true)} />
      <PriceSection onScrollTo={scrollTo} onOpenModal={() => setModalOpen(true)} />
      <FaqSection onOpenModal={() => setModalOpen(true)} />
      <DocumentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Index;