"use client";

import { Canvas } from "@react-three/fiber";
import FiberModel from "~/components/animations/fiber/fiber.model";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function FiberAnimation() {
  return (
    <div className={"h-screen"}>
      <Canvas>
        {/*Lighting*/}
        <directionalLight
          position={[-5, -5, -5]}
          intensity={4}
          color={"#fff"}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />

        {/*Controls*/}
        <OrbitControls />

        {/*Post Processing*/}
        <EffectComposer>
          <Bloom />
        </EffectComposer>

        {/*Model*/}
        <Suspense fallback={null}>
          <FiberModel />
        </Suspense>
      </Canvas>
      {/*<div className={"absolute inset-x-0 top-0 mx-auto size-fit"}>*/}
      {/*  <p>Overlay</p>*/}
      {/*</div>*/}
    </div>
  );
}
