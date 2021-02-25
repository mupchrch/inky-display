const eeprom = require('./eeprom');

const SPI_BUS = '/dev/spidev0.0';
const SUPPORTED_DISPLAYS = [10, 11, 12];
const WIDTH = 250;
const HEIGHT = 122;

const WHITE = 0;
const BLACK = 1;
const YELLOW = 2;

async function main() {
  console.log('starting');
  const { displayVariant } = await eeprom.read();

  if (!SUPPORTED_DISPLAYS.includes(displayVariant)) {
    throw new Error(`Display variant ${displayVariant} is unsupported.`);
  }

  console.log('ending');
}

main();
