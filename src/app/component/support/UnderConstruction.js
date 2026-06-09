import Image from "next/image";
import React from "react";

const UnderConstruction = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center min-h-screen px-6">
      {/* Left: Image */}
      <div className="flex justify-center">
        <Image
          src="/istockphoto-931042070-612x612.jpg"
          height={500}
          width={500}
          alt="Under Construction"
          className="rounded-xl shadow-lg"
        />
      </div>

      {/* Right: Text */}
      <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          🚧 We are in Testing Mode
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Our website is currently under construction. Stay tuned for updates as
          we build something amazing for you!
        </p>
      </div>
    </div>
  );
};

export default UnderConstruction;
