import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import HeroSection from "@/components/HeroSection";

export const Route = createFileRoute("/_app/")({
  component: Home,
});

function Home() {
  return (
    <Container isDashboard={false} maxWidth="full" padded={false}>
      <HeroSection />
      <div className="relative w-72 h-[600px] rounded-[45px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1)] border-8 border-zinc-900 ml-1">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[90px] h-[22px] bg-zinc-900 rounded-full z-20"></div>

        <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none"></div>

        <div className="relative w-full h-full rounded-[37px] overflow-hidden flex items-center justify-center bg-zinc-900/10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-12 bg-zinc-600 blur-[60px]"></div>
          <img
            src="/images/mobile-dashboard.png"
            alt="Phone screen content"
            className="w-full h-full object-cover rounded-[30px]"
            loading="lazy"
          />
        </div>

        <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md"></div>

        <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>

        <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>

        <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md"></div>
      </div>
    </Container>
  );
}
