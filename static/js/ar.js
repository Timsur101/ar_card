import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

document.addEventListener("DOMContentLoaded", async () => {

  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });
  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.5, roughness: 0.2 })
  );
  anchor.group.add(cube);

  const createTextPanel = (lines, xOffset) => {
    const group = new THREE.Group();
    const height = 0.25 + 0.15 * lines.length;

    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height),
      new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8 })
    );
    group.add(bg);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 42px sans-serif";
    let y = 120;
    for (const line of lines) {
      ctx.fillText(line, 256, y);
      y += 62;
    }

    const texture = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    textPlane.position.z = 0.01;
    group.add(textPlane);
    group.position.set(xOffset, 0, 0);

    return group;
  };

  const leftPanel = createTextPanel(
    ["КОНТАКТЫ", "+7 (916) 930-32-75", "timsursur@gmail.com"],
    -1.2
  );
  const rightPanel = createTextPanel(["ДОЛЖНОСТЬ", "СТУДЕНТ"], 1.2);
  anchor.group.add(leftPanel);
  anchor.group.add(rightPanel);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;
    renderer.render(scene, camera);
  });
});
