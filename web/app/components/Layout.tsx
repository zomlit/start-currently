import React from "react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-background">{children}</main>
    </div>
  );
};
