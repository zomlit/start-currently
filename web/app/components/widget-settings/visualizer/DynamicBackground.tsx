import React from "react";

const DynamicBackground = ({ videoLink, opacity }) => {
  if (!videoLink) return null;

  return (
    <video
      key={videoLink}
      autoPlay
      loop
      muted
      className="absolute left-0 top-0 h-full w-full object-cover blur-sm"
      style={{ opacity }}
    >
      <source src={videoLink} type="video/mp4" />
    </video>
  );
};

export default DynamicBackground;
