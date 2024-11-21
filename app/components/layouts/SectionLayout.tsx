import React from "react";
import { Container } from "@/components/layout/Container";
import DashboardHeader from "@/components/DashboardHeader";

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
        <div className="mt-8">{children}</div>
      </Container>
    </>
  );
}
