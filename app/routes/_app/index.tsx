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
    </Container>
  );
}
