import React, { Fragment, useState, useEffect } from "react";
// import { toast } from '@/utils/toast'

interface DashboardHeaderProps {
  category: string;
  title: string;
  description: string;
  keyModalText: string;
  buttonUrl: string;
  buttonText: string;
  backText: string;
}
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  category,
  title,
  description,
}) => {
  return (
    <>
      <header className="relative z-10 mt-20 mb-10">
        <p className="mb-2 text-sm font-semibold text-blue-600">{category}</p>
        <h1 className="block text-4xl font-black capitalize dark:text-white md:text-6xl">
          {title}
        </h1>
        <p className="mt-2 text-lg dark:text-gray-400">{description}</p>
      </header>
    </>
  );
};

export default DashboardHeader;
