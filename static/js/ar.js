import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const PHONE_E164 = "+79169303275";
  const PHONE_DISPLAY = "+7 (916) 930-32-75";

  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.domElement.style.touchAction = "none";
  const anchor = mindarThree.addAnchor(0);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(0, 1, 1);
  scene.add(dirLight);

  const loader = new GLTFLoader();
  loader.load(
    "/static/models/base_colored.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.42, 0.42, 0.42);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      anchor.group.add(model);
    },
    undefined,
    (err) => {
      console.error("Ошибка загрузки модели:", err);
    }
  );

  const createTextPanel = (lines, xOffset) => {
    const group = new THREE.Group();
    const height = 0.18 + 0.10 * lines.length;

    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, height),
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
    ctx.font = "bold 40px sans-serif";

    let y = 150;
    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, y);
      y += 70;
    }

    const texture = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, height),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    textPlane.position.z = 0.01;
    group.add(textPlane);

    group.position.set(xOffset, 0, 0);
    return group;
  };

  const leftPanel = createTextPanel(
    ["КОНТАКТЫ", PHONE_DISPLAY, "timsursur@gmail.com"],
    -0.9
  );
  const rightPanel = createTextPanel(["ДОЛЖНОСТЬ", "СТУДЕНТ"], 0.9);

  anchor.group.add(leftPanel);
  anchor.group.add(rightPanel);

  const makeBtn = (label, color) => {
    const el = document.createElement("button");
    el.textContent = label;

    Object.assign(el.style, {
      position: "fixed",
      padding: "9px 14px",
      background: color,
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontWeight: "bold",
      transform: "translate(-50%, -50%)",
      display: "none",
      zIndex: 20,
      cursor: "pointer",
    });

    document.body.appendChild(el);
    return el;
  };

  const btnGit = makeBtn("GitHub", "#515b67");
  const btnCall = makeBtn("Позвонить", "#28a745");

  btnGit.addEventListener("click", () =>
    window.open("https://github.com/Timsur101", "_blank")
  );

  btnCall.addEventListener("click", () => {
    window.location.href = `tel:${PHONE_E164}`;
  });

  const gitAnchor = new THREE.Object3D();
  gitAnchor.position.set(-0.38, -0.65, 0.2);

  const callAnchor = new THREE.Object3D();
  callAnchor.position.set(0.38, -0.65, 0.2);

  anchor.group.add(gitAnchor);
  anchor.group.add(callAnchor);

  const toScreen = (obj, camera, renderer) => {
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    v.project(camera);

    const rect = renderer.domElement.getBoundingClientRect();

    return {
      x: ((v.x + 1) / 2) * rect.width + rect.left,
      y: ((-v.y + 1) / 2) * rect.height + rect.top,
      visible: v.z < 1,
    };
  };

  await mindarThree.start();
  const hint = document.getElementById("hint");
  if (hint) hint.style.display = "none";

  const updateBtn = () => {
    const g = toScreen(gitAnchor, camera, renderer);
    const c = toScreen(callAnchor, camera, renderer);

    if (g.visible) {
      btnGit.style.display = "block";
      btnGit.style.left = `${g.x}px`;
      btnGit.style.top = `${g.y}px`;
    } else btnGit.style.display = "none";

    if (c.visible) {
      btnCall.style.display = "block";
      btnCall.style.left = `${c.x}px`;
      btnCall.style.top = `${c.y}px`;
    } else btnCall.style.display = "none";
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
