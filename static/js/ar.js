import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);
  renderer.domElement.style.touchAction = "none";

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
    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height),
      new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.8,
      })
    );
    group.add(background);
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

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  scene.add(light);

  // HTML-кнопки
  const btnGit = document.createElement("button");
  btnGit.textContent = "GitHub";
  Object.assign(btnGit.style, {
    position: "fixed",
    padding: "10px 16px",
    background: "#515b67",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    transform: "translate(-50%, -50%)",
    display: "none",
    zIndex: 20,
  });
  document.body.appendChild(btnGit);

  const btnSite = document.createElement("button");
  btnSite.textContent = "Сайт";
  Object.assign(btnSite.style, {
    position: "fixed",
    padding: "10px 16px",
    background: "#ff0000",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    transform: "translate(-50%, -50%)",
    display: "none",
    zIndex: 20,
  });
  document.body.appendChild(btnSite);

  btnGit.addEventListener("click", () => {
    window.open("https://github.com/Timsur101", "_blank");
  });
  btnSite.addEventListener("click", () => {
    window.open("https://youtube.com", "_blank");
  });

  const btnGitAnchor = new THREE.Object3D();
  btnGitAnchor.position.set(-0.7, -0.8, 0.2);
  anchor.group.add(btnGitAnchor);

  const btnSiteAnchor = new THREE.Object3D();
  btnSiteAnchor.position.set(0.7, -0.8, 0.2);
  anchor.group.add(btnSiteAnchor);

  const toScreenPosition = (obj, camera, renderer) => {
    const vector = new THREE.Vector3();
    obj.getWorldPosition(vector);
    vector.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: (vector.x + 1) / 2 * rect.width + rect.left,
      y: (-vector.y + 1) / 2 * rect.height + rect.top,
      visible: vector.z < 1,
    };
  };

  await mindarThree.start();
  document.getElementById("hint").style.display = "none";

  const updateButtonPositions = () => {
    const pos1 = toScreenPosition(btnGitAnchor, camera, renderer);
    const pos2 = toScreenPosition(btnSiteAnchor, camera, renderer);

    if (pos1.visible) {
      btnGit.style.display = "block";
      btnGit.style.left = `${pos1.x}px`;
      btnGit.style.top = `${pos1.y}px`;
    } else btnGit.style.display = "none";

    if (pos2.visible) {
      btnSite.style.display = "block";
      btnSite.style.left = `${pos2.x}px`;
      btnSite.style.top = `${pos2.y}px`;
    } else btnSite.style.display = "none";
  };

  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;
    renderer.render(scene, camera);
    updateButtonPositions();
  });

  window.addEventListener("resize", updateButtonPositions);
  window.addEventListener("orientationchange", () => {
    setTimeout(updateButtonPositions, 500);
  });
});
