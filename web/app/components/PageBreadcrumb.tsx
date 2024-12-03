import * as React from "react";
import { Link, useMatches } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageBreadcrumbProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleNav?: () => void;
}

export function PageBreadcrumb({
  className,
  isCollapsed = true,
  onToggleNav,
}: PageBreadcrumbProps) {
  const matches = useMatches();
  const breadcrumbs = matches.filter((match) => match.pathname !== "/");

  return (
    <div className="flex items-center gap-4 pt-16 relative">
      <div className="flex h-12 items-center justify-between absolute top-0 left-0">
        {onToggleNav && (
          <motion.button
            // animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              mass: 0.2,
              bounce: 0.1,
            }}
            className="h-8 w-8 absolute left-0"
            onClick={onToggleNav}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}
      </div>
      <Breadcrumb className={cn("dark:mb-2 font-light", className)}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {breadcrumbs.map((match, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const path = match.pathname;
            const name = path.split("/").pop() || "";

            return (
              <React.Fragment key={path}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize">
                      {name.replace(/-/g, " ")}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={path} className="capitalize">
                        {name.replace(/-/g, " ")}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
