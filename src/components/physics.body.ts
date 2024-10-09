import * as THREE from "three";
import { Rapier } from "~/components/physics/rapier";
import { World } from "@dimforge/rapier3d-compat";

const sceneMiddle = new THREE.Vector3(0, 0, 0);

function getBody(RAPIER: Rapier, world: World) {
  const size = 0.1 + Math.random() * 0.25;
  const range = 6;
  const density = size;
  const x = Math.random() * range - range * 0.5;
  const y = Math.random() * range - range * 0.5 + 3;
  const z = Math.random() * range - range * 0.5;

  // physics
  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
  const rigid = world.createRigidBody(rigidBodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
  world.createCollider(colliderDesc, rigid);

  const geometry = new THREE.IcosahedronGeometry(size, 1);
  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);

  const wireMat = new THREE.MeshBasicMaterial({
    color: "#000",
    wireframe: true,
  });
  const wireMesh = new THREE.Mesh(geometry, wireMat);
  wireMesh.scale.setScalar(1.01);
  mesh.add(wireMesh);

  function update() {
    rigid.resetForces(true);
    const { x, y, z } = rigid.translation();
    const pos = new THREE.Vector3(x, y, z);
    const dir = pos.clone().sub(sceneMiddle).normalize();
    rigid.addForce(dir.multiplyScalar(-0.5), true);
    mesh.position.set(x, y, z);
  }
  return { mesh, rigid, update };
}

function getMouseBall(RAPIER: Rapier, world: World) {
  const mouseSize = 0.25;
  const geometry = new THREE.IcosahedronGeometry(mouseSize, 8);
  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    emissive: "#fff",
  });
  const mouseLight = new THREE.PointLight("#fff", 1);
  const mouseMesh = new THREE.Mesh(geometry, material);
  mouseMesh.add(mouseLight);

  // RIGID BODY
  const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    0,
    0,
    0,
  );
  const mouseRigid = world.createRigidBody(bodyDesc);
  const dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0);
  world.createCollider(dynamicCollider, mouseRigid);

  function update(mousePos: THREE.Vector2) {
    mouseRigid.setTranslation(
      { x: mousePos.x * 5, y: mousePos.y * 5, z: 0.2 },
      true,
    );
    const { x, y, z } = mouseRigid.translation();
    mouseMesh.position.set(x, y, z);
  }

  return { mesh: mouseMesh, update };
}

export { getBody, getMouseBall };
