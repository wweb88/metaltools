"use client";
import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./Hero3D").then((mod) => mod.Hero3D), { ssr: false });

export function Hero3DWrapper() {
  return <Hero3D />;
}
