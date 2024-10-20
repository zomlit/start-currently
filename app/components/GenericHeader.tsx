// components/Header.tsx
import React from "react";

interface HeaderProps {
  category: string;
  title: string;
  description: string;
  className?: string;
}

const GenericHeader: React.FC<HeaderProps> = ({
  category,
  title,
  description,
  className = "",
}) => {
  return (
    <header className={`relative z-10 mt-34 mb-10 ${className}`}>
      <p className="mb-2 text-sm font-semibold text-blue-600">{category}</p>
      <h1 className="font-boldtext-3xl block text-4xl md:text-6xl">{title}</h1>
      <p className="mt-2 text-lg dark:text-gray-400 font-light">
        {description}
      </p>
    </header>
  );
};

export default GenericHeader;
