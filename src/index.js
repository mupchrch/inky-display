const eeprom = require('./eeprom');
const { createInky, DISPLAYS, DISPLAY_COLORS } = require('./inky-factory');
const COLORS = require('./colors');

async function auto() {
  const { displayVariant, width, height, color } = await eeprom.read();
  const displayName = DISPLAYS[displayVariant];
  const displayColorName = DISPLAY_COLORS[color];
  console.log(`Display variant reported as ${displayName}.`);
  console.log(`Display color reported as ${displayColorName}.`);

  return createInky(displayName, displayColorName);
}

module.exports = { auto, ...COLORS };
