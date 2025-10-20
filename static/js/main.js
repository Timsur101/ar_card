let currentFacingMode = "environment"; // основная камера
let stream;
const video = document.getElementById("camera");
const startBtn = document.getElementById("start-camera");
const switchBtn = document.getElementById("switch-camera");

async function startCamera() {
  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode },
      audio: false
    });

    video.srcObject = stream;
  } catch (err) {
    alert("Не удалось получить доступ к камере");
    console.error(err);
  }
}

startBtn.addEventListener("click", () => {
  startCamera();
  startBtn.style.display = "none";
  switchBtn.style.display = "inline-block";
});

switchBtn.addEventListener("click", () => {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";
  startCamera();
});
