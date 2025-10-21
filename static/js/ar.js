import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // 💎 Центральный вращающийся куб
  const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    metalness: 0.5,
    roughness: 0.2,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  anchor.group.add(cube);

  // 🟢 Функция создания панели с текстом
  const createOval = (text, xOffset) => {
    const group = new THREE.Group();

    // Эллипс-фон
    const ovalGeometry = new THREE.PlaneGeometry(0.9, 0.3, 32);
    const ovalMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const oval = new THREE.Mesh(ovalGeometry, ovalMaterial);
    group.add(oval);

    // Создаём текстуру один раз
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    // Автоматически уменьшаем шрифт, если текст длинный
    let fontSize = 42;
    if (text.length > 16) fontSize = 32;
    if (text.length > 24) fontSize = 28;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.3),
      textMaterial
    );

    group.add(textPlane);
    group.position.set(xOffset, 0, 0.01); // чуть вперёд, чтобы не мерцало с oval
    return group;
  };

  const leftOval1 = createOval("Номер телефона", -1.0);
  const leftOval2 = createOval("+7 (916) 930-32-75", -2.0);
  const rightOval1 = createOval("Почта", 1.0);
  const rightOval2 = createOval("Timsursur@gmail.com", 2.0);
  anchor.group.add(leftOval1);
  anchor.group.add(leftOval2);
  anchor.group.add(rightOval1);
  anchor.group.add(rightOval2);

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
