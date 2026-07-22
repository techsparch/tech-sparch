"use client";
import React, { useState } from "react";

const Hero = () => {
  // State to track mouse coordinates
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Update coordinates when mouse moves over the main container
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-32 pb-16"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 1. Base Grid (Thin & Light) */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,rgba(9,60,93,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(9,60,93,0.08)_1px,transparent_1px)] bg-[size:48px_48px]">
        {/* Radial fade mask for base grid (softens the edges) */}
        <div className="absolute inset-0 bg-light [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_30%,black_100%)]"></div>
      </div>

      {/* 2. Interactive Hover Grid (Bold & Dark) */}
      <div
        className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,rgba(9,60,93,0.6)_2px,transparent_2px),linear-gradient(to_bottom,rgba(9,60,93,0.6)_2px,transparent_2px)] bg-[size:48px_48px] transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.3 : 0,
          // Creates a 150px "flashlight" reveal effect tied to the mouse coordinates
          WebkitMaskImage: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          maskImage: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
        }}
      ></div>

      {/* Optional: Subtle background blob/gradient for depth */}
      <div className="absolute top-1/4 left-1/4 z-0 h-96 w-96 rounded-full bg-dark/5 blur-[128px]"></div>

      {/* Main Content */}
      <div className="relative z-10 px-4 text-center pointer-events-none">
        {/* Customized Heading */}
        <h1 className="mb-6 text-5xl font-black tracking-tighter text-dark md:text-7xl lg:text-8xl">
          A Better Way to Work <br className="hidden md:block" />
          with <span className="text-taupe-900/50 underline">Your</span> CA.
        </h1>

        {/* Matching Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-dark/70 md:text-xl">
          Experience a frictionless, modern portal designed to keep your
          financial documents, invoices, and compliance securely on track.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pointer-events-auto">
          <button className="w-full rounded-full bg-dark px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-light transition-all duration-300 hover:-translate-y-1 hover:bg-dark/90 hover:shadow-[0_10px_30px_rgba(15,23,42,0.2)] sm:w-auto">
            Client Login
          </button>
          <button className="w-full rounded-full border-2 border-dark/20 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-dark transition-all duration-300 hover:-translate-y-1 hover:border-dark sm:w-auto">
            View Features
          </button>
        </div>
      </div>
    </main>
  );
};

export default Hero;
