const sharp = require('sharp');
const Inky = require('./Inky');
const { map2d, packBits } = require('./utils');
const { WHITE, BLACK, RED: TERTIARY } = require('./colors');

const DRIVER_CONTROL = 0x01;
const WRITE_DUMMY = 0x3A;
const WRITE_GATELINE = 0x3B;
const DATA_MODE = 0x11;
const SET_RAMXPOS = 0x44;
const SET_RAMYPOS = 0x45;
const WRITE_VCOM = 0x2C;
const WRITE_LUT = 0x32;
const SET_RAMXCOUNT = 0x4E;
const SET_RAMYCOUNT = 0x4F;
const WRITE_RAM = 0x24;
const WRITE_ALTRAM = 0x26;
const MASTER_ACTIVATE = 0x20;

class InkyPhat extends Inky {
  constructor(color) {
    super([136, 250], color);
  }

  async setImage(imagePath) {
    const whiteRgb = { r: 255, g: 255, b: 255 };

    const img = await sharp(imagePath)
      .resize(this.width, this.height, { fit: sharp.fit.contain, background: { ...whiteRgb, alpha: 1 } })
      .flatten({ background: whiteRgb })
      .threshold(128, { greyscale: false })
      .raw()
      .toBuffer();

    for (let i = 0; i < img.length; i += 3) {
      const x = (i / 3) % this.width;
      const y = Math.floor((i / 3) / this.width);

      let color = TERTIARY;
      if (img[i] === 0 && img[i+1] === 0 && img[i+2] === 0) {
        color = BLACK;
      } else if (img[i] === 255 && img[i+1] === 255 && img[i+2] === 255) {
        color = WHITE;
      }

      this.setPixel(x, y, color);
    }
  }

  show() {
    this._sendCommand(DRIVER_CONTROL, [this.height - 1, (this.height - 1) >> 8, 0x00]);
    // Set dummy line period
    this._sendCommand(WRITE_DUMMY, [0x1B]);
    // Set line width
    this._sendCommand(WRITE_GATELINE, [0x0B]);
    // Data entry sequence (scan direction leftward and downward)
    this._sendCommand(DATA_MODE, [0x03]);
    // Set ram X start and end position
    const xPosBuffer = [0x00, Math.floor(this.width / 8) - 1];
    this._sendCommand(SET_RAMXPOS, xPosBuffer);
    // Set ram Y start and end position
    const yPosBuffer = [0x00, 0x00, (this.height - 1) & 0xFF, (this.height - 1) >> 8];
    this._sendCommand(SET_RAMYPOS, yPosBuffer);
    // VCOM voltage
    this._sendCommand(WRITE_VCOM, [0x70]);
    // Write LUT data
    this._sendCommand(WRITE_LUT, this.getLookUpTable(this.color));
    // Set RAM address to 0, 0
    this._sendCommand(SET_RAMXCOUNT, [0x00]);
    this._sendCommand(SET_RAMYCOUNT, [0x00, 0x00]);

    let blackWhiteBuffer = map2d(this.buffer, val => val === BLACK ? 0 : 1);
    blackWhiteBuffer = packBits(blackWhiteBuffer);
    let tertiaryBuffer = map2d(this.buffer, val => val === TERTIARY ? 1 : 0);
    tertiaryBuffer = packBits(tertiaryBuffer);

    this._sendCommand(WRITE_RAM, blackWhiteBuffer);
    this._sendCommand(WRITE_ALTRAM, tertiaryBuffer);

    this._busyWait();
    this._sendCommand(MASTER_ACTIVATE);
  }

  getLookUpTable(color) {
    const sharedLookUpTable = [
      0x02, 0x02, 0x01, 0x11, 0x12, 0x12, 0x22, 0x22, 0x66, 0x69,
      0x69, 0x59, 0x58, 0x99, 0x99, 0x88, 0x00, 0x00, 0x00, 0x00,
      0xF8, 0xB4, 0x13, 0x51, 0x35, 0x51, 0x51, 0x19, 0x01, 0x00
    ];
    const lookUpTables = {
      black: sharedLookUpTable,
      red: sharedLookUpTable,
      yellow: sharedLookUpTable
    };

    if (!(color in lookUpTables)) {
      throw new Error(`Look up table does not contain ${color}`);
    }

    return lookUpTables[color];
  }
}

module.exports = InkyPhat;
