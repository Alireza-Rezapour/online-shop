"use client";

import Image from "next/image";
import { useState } from "react";

export default function MyImage({
  src,
  alt = "",
  className = "object-cover",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="bg-gray-200 animate-pulse w-full h-full" />}
      <Image
        src={src}
        alt={alt}
        className={[
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        ].join(" ")}
        fill
        onLoadingComplete={() => setLoaded(true)}
        onError={() => (
          <div className="bg-gray-200 animate-pulse w-full h-full" />
        )}
      />
    </>
  );
}
