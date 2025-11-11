import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.domElement.style.touchAction = "none";
  const anchor = mindarThree.addAnchor(0);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      metalness: 0.5,
      roughness: 0.2,
    })
  );
  anchor.group.add(cube);

  const createTextPanel = (lines, xOffset) => {
    const group = new THREE.Group();
    const height = 0.25 + 0.15 * lines.length;
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height),
      new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.8,
      })
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
      ctx.fillText(line, canvas.width / 2, y);
      y += 62;
    }
    const tex = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
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

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  scene.add(light);

  const createButton = (label, color, x, onClick) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 128, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const button = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.3),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    button.position.set(x, -0.8, 0.2);
    button.userData.onClick = onClick;
    return button;
  };

  const btnSite1 = createButton("GitHub", "#515b67", -0.7, () => {
    window.open("https://github.com/Timsur101", "_blank");
  });
  const btnSite2 = createButton("Сайт", "#ff0000", 0.7, () => {
    window.open("https://youtube.com", "_blank");
  });
  anchor.group.add(btnSite1);
  anchor.group.add(btnSite2);

  await mindarThree.start();
  document.getElementById("hint").style.display = "none";

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const handleClick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const clickable = [];
    anchor.group.traverse((obj) => {
      if (obj.isMesh && obj.userData.onClick) clickable.push(obj);
    });
    const hits = raycaster.intersectObjects(clickable, true);
    if (hits.length > 0) {
      const obj = hits[0].object;
      if (obj.userData.onClick) obj.userData.onClick();
    }
  };

  renderer.domElement.addEventListener("touchend", handleClick);
  renderer.domElement.addEventListener("mousedown", handleClick);

  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;
    renderer.render(scene, camera);
  });
});
