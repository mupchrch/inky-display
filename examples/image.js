const path = require('path');
const Inky = require('../src');

async function main() {
  console.log('Begin example.');
  const inky = await Inky.auto();

  await inky.setImage(path.join(__dirname, 'image.png'));

  inky.show();
  console.log('End example.');
}

main();
