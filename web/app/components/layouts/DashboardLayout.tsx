import React, { useState } from "react";
import { Container } from "@/components/layout/Container";
import DashboardNavigation from "@/components/DashboardNavigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { HorizontalNav } from "../navigation/HorizontalNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DashboardNavigation
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className="flex-1 relative mx-8 md:ml-8 xl:mr-0">
        <Container maxWidth="full" padded={false}>
          <PageBreadcrumb
            isCollapsed={isCollapsed}
            onToggleNav={() => setIsCollapsed(!isCollapsed)}
          />
          {/* <HorizontalNav /> */}
          {children}
        </Container>
      </main>
    </div>
  );
}
