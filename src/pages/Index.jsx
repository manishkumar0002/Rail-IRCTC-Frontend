import { useRef } from "react";
import HomeNavbar from "../components/home/HomeNavbar";
import HeroSection from "../components/home/HeroSection";
import TrainStatusSearch from "../components/home/TrainStatusSearch";
import FeaturesSection from "../components/home/FeaturesSection";
import PopularRoutes from "../components/home/PopularRoutes";
import CTASection from "../components/home/CTASection";
import StatsSection from "../components/home/StatsSection";
import HomeFooter from "../components/home/HomeFooter";

const Index = () => {
  const searchSectionRef = useRef(null);

  return (
    <div className="min-h-screen bg-white">
      <HomeNavbar />
      <HeroSection ref={searchSectionRef} />
      <TrainStatusSearch />
      <FeaturesSection searchSectionRef={searchSectionRef} />
      <PopularRoutes />
      <CTASection />
      <StatsSection />
      <HomeFooter />
    </div>
  );
};

export default Index;
