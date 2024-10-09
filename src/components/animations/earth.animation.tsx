"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import assets from "~/assets";
import getStarfield from "~/components/animations/starfield";
import getFresnelMat from "~/components/animations/fresnelMat";

export default function EarthAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _init = useRef(false);

  //THREE
  useEffect(() => {
    if (!canvasRef.current || _init.current) return;
    _init.current = true;

    //init
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
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    const fov = 75;
    const aspect = w / h;
    const near = 0.1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;

    const scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();

    //controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    //earth
    //group
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
    scene.add(earthGroup);

    const detail = 12;

    //earth
    const geo = new THREE.IcosahedronGeometry(1, detail);
    const mat = new THREE.MeshPhongMaterial({
      map: loader.load(assets.textureMap.earth.color.src),
      specularMap: loader.load(assets.textureMap.earth.specular.src),
      bumpMap: loader.load(assets.textureMap.earth.bump.src),
      bumpScale: 0.04,
    });
    const earthMesh = new THREE.Mesh(geo, mat);
    earthGroup.add(earthMesh);

    //city lights
    const cLightsMat = new THREE.MeshBasicMaterial({
      map: loader.load(assets.textureMap.earth.cityLights.src),
      blending: THREE.AdditiveBlending,
    });
    const cLightsMesh = new THREE.Mesh(geo, cLightsMat);
    earthGroup.add(cLightsMesh);

    //clouds
    const cloudsMat = new THREE.MeshBasicMaterial({
      map: loader.load(assets.textureMap.earth.cloud.src),
      alphaMap: loader.load(assets.textureMap.earth.cloudTransparency.src),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(geo, cloudsMat);
    cloudsMesh.scale.setScalar(1.003);
    earthGroup.add(cloudsMesh);

    //fresnel
    const fresnelMat = getFresnelMat();
    const glowMesh = new THREE.Mesh(geo, fresnelMat);
    glowMesh.scale.setScalar(1.01);
    earthGroup.add(glowMesh);

    //starfield
    const stars = getStarfield({ numStars: 2000 });
    scene.add(stars);

    //light
    const sunLight = new THREE.DirectionalLight("#fff", 2.0);
    sunLight.position.set(-2, 0.5, 1.5);
    scene.add(sunLight);

    //animate
    const rotationSpeed = 0.001;
    function animate() {
      requestAnimationFrame(animate);

      // earthMesh.rotation.x += 0.001;
      earthGroup.rotation.y += rotationSpeed;
      cloudsMesh.rotation.y += rotationSpeed * 0.1;
      stars.rotation.y -= rotationSpeed * 0.1;

      //render
      renderer.render(scene, camera);

      //controls
      controls.update();
    }
    animate();

    //resize
    function handleWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleWindowResize, false);

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [canvasRef]);

  return (
    <div className={"size-fit"}>
      <canvas ref={canvasRef} />
    </div>
  );
}
