import * as THREE from "three";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#container");

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "/static/ar/visiting-card.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.style.touchAction = "none";

  // Свет
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(0, 1, 1);
  scene.add(dirLight);

  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  let model = null;

  loader.load(
    "/static/models/base.glb",
    (gltf) => {
      model = gltf.scene;
      model.scale.set(0.4, 0.4, 0.4);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      anchor.group.add(model);
    },
    undefined,
    (error) => {
      console.log("Ошибка загрузки модели:", error);
    }
  );

  const btnSite = document.getElementById("btn-site");
  const hint = document.getElementById("hint");

  anchor.onTargetFound = () => {
    if (btnSite) btnSite.style.display = "block";
    if (hint) hint.style.display = "none";
  };

  anchor.onTargetLost = () => {
    if (btnSite) btnSite.style.display = "none";
    if (hint) hint.style.display = "block";
  };

  if (btnSite) {
    btnSite.addEventListener("click", () => {
      window.open("https://example.com", "_blank");
    });
  }

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  const handleResize = () => {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight);
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", () =>
    setTimeout(handleResize, 500)
  );
});
