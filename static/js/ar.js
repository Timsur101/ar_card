import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.domElement.style.touchAction = "none";
  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  loader.load("/static/models/logo.glb", (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); 
    model.position.set(0, 0, 0);
    anchor.group.add(model);
  });

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

  const makeBtn = (label, color) => {
    const el = document.createElement("button");
    el.textContent = label;
    Object.assign(el.style, {
      position: "fixed",
      padding: "10px 16px",
      background: color,
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontWeight: "bold",
      transform: "translate(-50%, -50%)",
      display: "none",
      zIndex: 20,
    });
    document.body.appendChild(el);
    return el;
  };

  const btnGit = makeBtn("GitHub", "#515b67");
  const btnSite = makeBtn("Сайт", "#ff0000");

  btnGit.addEventListener("click", () =>
    window.open("https://github.com/Timsur101", "_blank")
  );
  btnSite.addEventListener("click", () =>
    window.open("https://youtube.com", "_blank")
  );

  const gitAnchor = new THREE.Object3D();
  gitAnchor.position.set(-0.7, -0.8, 0.2);

  const siteAnchor = new THREE.Object3D();
  siteAnchor.position.set(0.7, -0.8, 0.2);

  anchor.group.add(gitAnchor);
  anchor.group.add(siteAnchor);

  const toScreen = (obj, camera, renderer) => {
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    v.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: (v.x + 1) / 2 * rect.width + rect.left,
      y: (-v.y + 1) / 2 * rect.height + rect.top,
      visible: v.z < 1,
    };
  };

  await mindarThree.start();
  document.getElementById("hint").style.display = "none";

  const updateBtn = () => {
    const g = toScreen(gitAnchor, camera, renderer);
    const s = toScreen(siteAnchor, camera, renderer);

    if (g.visible) {
      btnGit.style.display = "block";
      btnGit.style.left = `${g.x}px`;
      btnGit.style.top = `${g.y}px`;
    } else btnGit.style.display = "none";

    if (s.visible) {
      btnSite.style.display = "block";
      btnSite.style.left = `${s.x}px`;
      btnSite.style.top = `${s.y}px`;
    } else btnSite.style.display = "none";
  };

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    updateBtn();
  });

  window.addEventListener("resize", updateBtn);
  window.addEventListener("orientationchange", () =>
    setTimeout(updateBtn, 500)
  );
});
