const InkyPhat = require('./InkyPhat');

const DISPLAYS = [
  null,
  'Red pHAT (High-Temp)',
  'Yellow wHAT',
  'Black wHAT',
  'Black pHAT',
  'Yellow pHAT',
  'Red wHAT',
  'Red wHAT (High-Temp)',
  'Red wHAT',
  null,
  'Black pHAT (SSD1608)',
  'Red pHAT (SSD1608)',
  'Yellow pHAT (SSD1608)',
  null,
  '7-Colour (UC8159)'
];
const DISPLAY_COLORS = [null, 'black', 'red', 'yellow', null, '7colour'];

function createInky(displayVariantName, color) {
  switch(displayVariantName) {
    case DISPLAYS[10]:
    case DISPLAYS[11]:
    case DISPLAYS[12]:
      console.log('Initializing Inky pHAT display.');
      return new InkyPhat(color);
    default:
      throw new Error(`Display variant ${displayVariant} is not supported.`);
  }
}

module.exports = { createInky, DISPLAYS, DISPLAY_COLORS };
