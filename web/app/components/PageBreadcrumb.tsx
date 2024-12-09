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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

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
    <div className="flex items-center gap-4 pt-10 relative">
      <div className="flex h-12 items-center justify-between">
        {onToggleNav && (
          <motion.button
            animate={{ scaleX: isCollapsed ? -1 : 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              mass: 0.2,
              bounce: 0.1,
            }}
            className="flex items-center justify-center fill-violet-500 stroke-violet-500 text-violet-500"
            onClick={onToggleNav}
          >
            <IconLayoutSidebarLeftCollapse
              stroke={1.5}
              className="h-6 w-6 text-muted-foreground stroke-violet-600 dark:stroke-violet-200"
            />
          </motion.button>
        )}
      </div>
      <Breadcrumb className={cn("font-light", className)}>
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
