import * as THREE from "three";

export function getBackground() {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv - 0.5;
      float len = length(uv);
      vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), smoothstep(0.0, 0.2, len));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const gradientMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });

  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const plane = new THREE.Mesh(planeGeometry, gradientMaterial);
  plane.position.z = -50;

  return { mesh: plane };
}
