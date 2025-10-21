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

  // 🟢 Функция: создаёт панель с несколькими строками текста
  const createTextPanel = (lines, xOffset) => {
    const group = new THREE.Group();

    // Размер панели адаптивен под количество строк
    const height = 0.25 + 0.15 * lines.length;

    const backgroundGeometry = new THREE.PlaneGeometry(1.2, height);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    group.add(background);

    // Создаём текстуру
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Размер и расположение текста
    let fontSize = 42;
    if (lines.length > 3) fontSize = 36;
    ctx.font = `bold ${fontSize}px sans-serif`;

    const x = canvas.width / 2;
    let y = 120;
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += fontSize + 20;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height),
      textMaterial
    );

    // Чуть спереди, чтобы не конфликтовал с фоном
    textPlane.position.z = 0.01;
    group.add(textPlane);

    group.position.set(xOffset, 0, 0);
    return group;
  };

  // 🧭 Создаём панели
  const leftPanel = createTextPanel(
    ["КОНТАКТЫ", "+7 (999) 123-45-67", "mail@example.com"],
    -1.2
  );
  const rightPanel = createTextPanel(["ДОЛЖНОСТЬ", "МЕНЕДЖЕР"], 1.2);

  anchor.group.add(leftPanel);
  anchor.group.add(rightPanel);

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
