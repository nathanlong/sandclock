function grain(canvas, ctx, size, name, color) {
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = color;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      if (Math.random() > 0.5) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    document.documentElement.style.setProperty(name, `url(${url})`);
  });
}

export default grain
