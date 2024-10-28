import React from "react";
import { Container } from "@/components/layout/Container";
import DashboardNavigation from "@/components/DashboardNavigation";
import DashboardHeader from "@/components/DashboardHeader";
import { HorizontalNav } from "@/components/Dashboard";

interface SectionLayoutProps {
  children: React.ReactNode;
  category?: string;
  title: string;
  description?: string;
  keyModalText?: string;
  buttonUrl?: string;
  buttonText?: string;
}

export function SectionLayout({
  children,
  category = "Sections",
  title,
  description = "",
  keyModalText = "",
  buttonUrl = "",
  buttonText = "",
}: SectionLayoutProps) {
  return (
    <>
      <DashboardNavigation />
      <Container isDashboard maxWidth="7xl">
        <DashboardHeader
          category={category}
          title={title}
          description={description}
          keyModalText={keyModalText}
          buttonUrl={buttonUrl}
          buttonText={buttonText}
          backText=""
        />

        <HorizontalNav />

        <div className="mt-8">{children}</div>
      </Container>
    </>
  );
}
