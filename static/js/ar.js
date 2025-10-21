import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // 💡 Центральный объект — куб
  const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.5, roughness: 0.2 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  anchor.group.add(cube);

  // 💡 Овалы с контактами
  const createOval = (text, xOffset) => {
    const group = new THREE.Group();

    const ovalGeometry = new THREE.PlaneGeometry(0.7, 0.25, 32);
    const ovalMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const oval = new THREE.Mesh(ovalGeometry, ovalMaterial);

    // Текст
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), textMat);

    group.add(oval);
    group.add(textPlane);
    group.position.set(xOffset, 0, 0);

    return group;
  };

  const leftOval = createOval("📞 +7 (999) 123-45-67", -0.8);
  const rightOval = createOval("🌐 yoursite.com", 0.8);

  anchor.group.add(leftOval);
  anchor.group.add(rightOval);

  // 💡 Свет
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  scene.add(light);

  // ▶️ Запуск
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;
    renderer.render(scene, camera);
  });
});
