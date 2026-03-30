import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import ProblemSolution from "@/components/ProblemSolution";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import Courses from "@/components/Courses";
import FounderSection from "@/components/FounderSection";


import CallToAction from "@/components/CallToAction";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <StatsBar />
      <ProblemSolution />
      <Benefits />
      <HowItWorks />
      <Courses />
      <FounderSection />
      <CallToAction />
      <FAQ />
      
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
