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
    <header className={`relative z-10 mt-14 mb-10 ${className}`}>
      <p className="mb-2 text-sm font-semibold text-blue-600">{category}</p>
      <h1 className="font-black block text-4xl md:text-6xl">{title}</h1>
      {description && (
        <p className="mt-2 text-lg dark:text-gray-400 font-light">
          {description}
        </p>
      )}
    </header>
  );
};

export default GenericHeader;
