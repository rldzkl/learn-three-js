"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function PrimitiveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _init = useRef(false);

  //THREE
  useEffect(() => {
    if (!canvasRef.current || _init.current) return;
    _init.current = true;

    const canvas = canvasRef.current;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const fov = 75;
    const aspect = w / h;
    const near = 0.1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;

    const scene = new THREE.Scene();

    //controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    //sphere
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: "#fff",
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    //wireframe
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#fff",
      wireframe: true,
    });
    const wireMash = new THREE.Mesh(geo, wireMat);
    wireMash.scale.setScalar(1.001);
    scene.add(wireMash);

    //light
    const hemiLight = new THREE.HemisphereLight("#D17AFF", "#4F9AFF", 1);
    scene.add(hemiLight);

    //animate
    function animate() {
      requestAnimationFrame(animate);

      mesh.rotation.x += 0.001;
      mesh.rotation.y += 0.002;

      wireMash.rotation.x += 0.001;
      wireMash.rotation.y += 0.002;

      //render
      renderer.render(scene, camera);

      //controls
      controls.update();
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update camera aspect ratio
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      renderer.dispose();
    };
  }, [canvasRef]);

  return (
    <div className={"size-fit"}>
      <canvas ref={canvasRef} className={"size-fit"} />
    </div>
  );
}
