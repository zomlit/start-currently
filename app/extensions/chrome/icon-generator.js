// Function to create disabled version of an icon
function createDisabledIcon(size) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;

  // Load original icon
  const img = new Image();
  img.src = `icons/icon${size}.png`;

  return new Promise((resolve) => {
    img.onload = () => {
      // Draw original icon
      ctx.drawImage(img, 0, 0);

      // Apply grayscale and opacity
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
        data[i + 3] *= 0.5; // A (50% opacity)
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      });
    };
  });
}
