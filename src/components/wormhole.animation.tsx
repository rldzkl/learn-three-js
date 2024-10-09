"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import wormholeSpline from "~/components/wormhole.spline";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

export default function WormholeAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _init = useRef(false);

  //THREE
  useEffect(() => {
    if (!canvasRef.current || _init.current) return;
    _init.current = true;

    //renderer
    const canvas = canvasRef.current;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      // alpha: true,
    });
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    //scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#000", 0.3);

    //camera
    const fov = 75;
    const aspect = w / h;
    const near = 0.1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;

    //controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    //post processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      1.5,
      0.4,
      100,
    );
    bloomPass.threshold = 0.002;
    bloomPass.strength = 3.5;
    bloomPass.radius = 0;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    //CONTENT
    //tube
    const tubeGeo = new THREE.TubeGeometry(wormholeSpline, 222, 0.65, 16, true);

    //tube edges
    const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: "#75c0ff" }),
    );
    scene.add(line);

    //boxes inside tube with random offset and rotation
    const numBoxes = 50;
    const size = 0.075;
    const offsetMultiplier = 5; // Define an offset multiplier
    const boxGeo = new THREE.BoxGeometry(size, size, size);
    const boxMat = new THREE.MeshBasicMaterial({
      wireframe: true,
    });

    for (let i = 0; i < numBoxes; i++) {
      const box = new THREE.Mesh(boxGeo, boxMat);
      const t = Math.random();
      const pos = tubeGeo.parameters.path.getPointAt(t);

      // Generate random offsets using the offset multiplier
      const offsetX = (Math.random() - 0.5) * offsetMultiplier * size;
      const offsetY = (Math.random() - 0.5) * offsetMultiplier * size;
      const offsetZ = (Math.random() - 0.5) * offsetMultiplier * size;

      // Apply offsets
      box.position.set(pos.x + offsetX, pos.y + offsetY, pos.z + offsetZ);

      // Generate random rotations
      const rotationX = Math.random() * 2 * Math.PI;
      const rotationY = Math.random() * 2 * Math.PI;
      const rotationZ = Math.random() * 2 * Math.PI;

      // Apply rotations
      box.rotation.set(rotationX, rotationY, rotationZ);

      // Create edges for the box
      const boxEdges = new THREE.EdgesGeometry(boxGeo);
      const boxEdge = new THREE.LineSegments(
        boxEdges,
        new THREE.LineBasicMaterial({ color: "#e884ff" }),
      );

      // Apply the same position and rotation to the edges
      boxEdge.position.copy(box.position);
      boxEdge.rotation.copy(box.rotation);

      scene.add(boxEdge);
    }

    //fly through wormhole
    function updateCamera(time: number) {
      const loopTime = 10 * 10000;
      const t = (time % loopTime) / loopTime;

      const pos = tubeGeo.parameters.path.getPointAt(t);
      camera.position.copy(pos);

      const lookAt = tubeGeo.parameters.path.getPointAt((t + 0.01) % 1);
      camera.lookAt(lookAt);
    }

    //animate
    function animate() {
      requestAnimationFrame(animate);

      //update
      updateCamera(performance.now());

      //render
      composer.render();

      //controls
      controls.update();
    }

    //start
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
      composer.dispose();
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} />;
}
