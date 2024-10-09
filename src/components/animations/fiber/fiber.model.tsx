"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import assets from "~/assets";
import { useEffect, useRef, useState } from "react";
import { type Group } from "three";
import { useFrame } from "@react-three/fiber";

export default function FiberModel() {
  const groupRef = useRef<Group>(null);
  const { nodes, materials, animations, scene } = useGLTF(
    assets.models.smolAme,
  );
  const { actions, clips } = useAnimations(animations, scene);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (actions) {
      actions.Animation!.play();
    }
  }, [actions]);

  useEffect(() => {
    if (!actions) return;
    actions.Animation!.play().paused = !isPlaying;
  }, [actions, isPlaying]);

  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
      // groupRef.current.rotation.y += delta;
    }
  });

  const handlePointerDown = () => {
    setIsPlaying(false);
  };

  const handlePointerUp = () => {
    setIsPlaying(true);
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <primitive object={scene} />
    </group>
  );
}
