"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getRapier } from "~/components/animations/physics/rapier";
import {
  getBody,
  getMouseBall,
} from "~/components/animations/physics/physics.body";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

export default function PhysicsAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _init = useRef(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  //THREE
  useEffect(() => {
    if (!canvasRef.current || _init.current) return;
    _init.current = true;

    void init();

    return () => {
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [canvasRef]);

  async function init() {
    //renderer
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    //scene
    const scene = new THREE.Scene();

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
      new THREE.Vector2(w, h), //resolution
      1.5, //strength
      0, //radius
      0.05, //threshold
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    //rapier
    const RAPIER = await getRapier();
    await RAPIER.init();
    const gravity = new THREE.Vector3(0, 0, 0);
    const world = new RAPIER.World(gravity);

    //bodies
    const numBodies = 100;
    const bodies: ReturnType<typeof getBody>[] = [];
    for (let i = 0; i < numBodies; i++) {
      const body = getBody(RAPIER, world);
      scene.add(body.mesh);
      bodies.push(body);
    }

    //mouse ball
    const mousePos = new THREE.Vector2();
    const mouseBall = getMouseBall(RAPIER, world);
    scene.add(mouseBall.mesh);

    //light
    const hemiLight = new THREE.HemisphereLight("#D17AFF", "#4F9AFF", 1);
    hemiLight.intensity = 0.5;
    scene.add(hemiLight);

    //background
    // const bg = getBackground();
    // scene.add(bg.mesh);

    //animate
    function animate() {
      requestAnimationFrame(animate);

      //mouse
      mouseBall.update(mousePos);

      //bodies
      for (const body of bodies) {
        body.update();
      }

      //render
      // renderer.render(scene, camera);
      composer.render();

      //world
      world.step();

      //controls
      // controls.update();
    }
    animate();

    function handleMouseMove(evt: MouseEvent) {
      mousePos.x = (evt.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    }

    function handleWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", handleWindowResize, false);
    window.addEventListener("mousemove", handleMouseMove, false);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleWindowResize);
    };
  }

  return <canvas ref={canvasRef} />;
}
