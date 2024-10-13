import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import Container from "../components/layout/Container";
import HeroSection from "../components/HeroSection";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user, isLoaded } = useUser();

  return (
    <Container maxWidth="full">
      <HeroSection />
    </Container>
  );
}
