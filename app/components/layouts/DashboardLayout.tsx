import React from "react";
import { Container } from "@/components/layout/Container";
import DashboardNavigation from "@/components/DashboardNavigation";
import { HorizontalNav } from "@/components/navigation/HorizontalNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardNavigation />
      <main className="flex-1">
        <Container maxWidth="full">
          <HorizontalNav />
          {children}
        </Container>
      </main>
    </div>
  );
}
