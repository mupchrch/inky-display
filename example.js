const Inky = require('./src');

function setRect(inky, topLeftX, topLeftY, width, height, color) {
  for (let x = topLeftX; x < topLeftX + width; x++) {
    for (let y = topLeftY; y < topLeftY + height; y++) {
      inky.setPixel(x, y, color);
    }
  }
}

async function main() {
  console.log('starting');
  const inky = await Inky.auto();
  setRect(inky, 10, 10, 10, 10, Inky.BLACK);
  setRect(inky, 30, 10, 15, 15, Inky.YELLOW);
  inky.show();
  console.log('ending');
}

main();
