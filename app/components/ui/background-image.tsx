import React from "react";

interface BackgroundImageProps {
  src: string;
  alt: string;
  opacity?: number;
  zIndex?: number;
  className?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt,
  opacity = 1,
  zIndex = -10,
  className = "",
}) => {
  return (
    <div
      className={`fixed left-0 top-0 h-full w-full ${className}`}
      style={{ zIndex, opacity }}
    >
      {/* Use next/image or a similar optimized image component if available */}
      <img src={src} alt={alt} className="object-cover w-full h-full" />
    </div>
  );
};

export default BackgroundImage;
