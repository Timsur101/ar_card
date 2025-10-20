const btn = document.getElementById('start-camera');
const video = document.getElementById('camera');

btn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    btn.style.display = 'none';
  } catch (err) {
    alert('Не удалось получить доступ к камере');
    console.error(err);
  }
});
