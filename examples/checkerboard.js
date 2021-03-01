const Inky = require('../src');

async function main() {
  console.log('Begin example.');
  const inky = await Inky.auto();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 25; j++) {
      let col = i % 2 ? Inky.BLACK : Inky.WHITE;
      if (j % 2) col = i % 2 ? Inky.WHITE : Inky.BLACK;

      inky.setRect(i * 17, j * 10, 17, 10, col);
    }
  }

  inky.show();
  console.log('End example.');
}

main();
