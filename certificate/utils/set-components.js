const { loadImage } = require("canvas");
var QRCode = require("qrcode");
const { Image } = require("canvas");

/**
 *
 * @param {canvasContext} canvas
 * @param {Image} image
 * @returns
 */
const getImageXOffSet = (canvas, image) => {
  var wrh = image.width / image.height;
  var newWidth = canvas.width;
  var newHeight = newWidth / wrh;
  if (newHeight > canvas.height) {
    newHeight = canvas.height;
    newWidth = newHeight * wrh;
  }
  var xOffset = newWidth < canvas.width ? (canvas.width - newWidth) / 2 : 0;

  return xOffset;
};

/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {string} imgPath
 */
exports.setBackgroundImage = async (context, imgPath, w, h) => {
  const image = await loadImage(imgPath);
  context.drawImage(image, 0, 0, w, h);
};

/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {string} color
 */
exports.setBackgroundColor = (context, width, height, color = "#764abc") => {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
};

exports.setImage = async (
  context,
  // canvas,
  imgPath,
  imagePosition = {
    w: 400,
    h: 88,
    x: 400,
    // Calculate the Y of the image based on the number of
    // lines in the title.
    // y: titleText.length === 2 ? 75 : 100,
    y: 100,
  }
) => {
  const image = await loadImage(imgPath);
  var { w, h, x, y } = imagePosition;

  // TODO: Fix this
  // if (!x) {
  //   x = getImageXOffSet(canvas, image);
  // }

  context.drawImage(image, x, y, w, h);
};

/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {string} messageData
 */
exports.setImageWithQRCode = async (
  context,
  messageData,
  imagePosition = {
    w: 400,
    h: 88,
    x: 400,
    // Calculate the Y of the image based on the number of
    // lines in the title.
    // y: titleText.length === 2 ? 75 : 100,
    y: 100,
  }
) => {
  const qrCodeBase64 = await QRCode.toDataURL(messageData);
  this.setImage(context, qrCodeBase64, imagePosition);
};

/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {string} text
 */
exports.setText = async (
  context,
  text,
  position = {
    x: 400,
    y: 100,
  },
  style = {
    fontWeight: 100,
    font: "Noto Sans Thai",
    fontSize: "40pt",
    textAlign: "center",
    fillStyle: "#fff",
  }
) => {
  context.font = `${style.fontWeight} ${style.fontSize} ${style.font}`;
  context.textAlign = style.textAlign;
  context.fillStyle = style.fillStyle;
  // for easy to adjust y positions
  context.textBaseline = "top";

  context.fillText(text, position.x, position.y);
};

// context.fillStyle = "#000"; // color
// context.fillText(`xxxxxdddddddddddddxxxxxxx`, 0, 30);

// function exampleWriteImageCenterOfCanvas() {
//   var canvasContext = canvas.getContext("2d");
//   var wrh = image.width / image.height;
//   var newWidth = canvas.width;
//   var newHeight = newWidth / wrh;
//   if (newHeight > canvas.height) {
//     newHeight = canvas.height;
//     newWidth = newHeight * wrh;
//   }
//   var xOffset = newWidth < canvas.width ? (canvas.width - newWidth) / 2 : 0;
//   var yOffset = newHeight < canvas.height ? (canvas.height - newHeight) / 2 : 0;

//   canvasContext.drawImage(image, xOffset, yOffset, newWidth, newHeight);
// }
