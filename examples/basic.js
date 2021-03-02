const Inky = require('../src');

async function main() {
  console.log('Begin example.');
  const inky = await Inky.auto();

  inky.setRect(10, 10, 10, 10, Inky.BLACK);
  inky.setRect(30, 10, 15, 15, Inky.BLACK);

  inky.show();
  console.log('End example.');
}

main();
