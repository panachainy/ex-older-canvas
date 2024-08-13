"use strict";

const { createCoreController } = require("@strapi/strapi").factories;
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

const apiConfig = "api::certificate.certificate";

const { Buffer } = require("buffer");
const fs = require("fs");
const mime = require("mime");
const { getFullName } = require("../utils/cert-attribute");

function base64toFile(base64String, oldFileName) {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const buffer = Buffer.from(arr[1], "base64");

  const fileName = `${makeId(10)}_${oldFileName}`;

  const folderName = "tmp";
  const filePath = `${folderName}/${fileName}`;
  fs.writeFileSync(filePath, buffer);
  const stats = fs.statSync(filePath);

  return { filePath, stats, fileName };
}

function removeFile(filePath) {
  fs.unlinkSync(filePath);
}

function makeId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function cleanResponse(response) {
  delete response?.data?.attributes?.order;
  delete response?.data?.attributes?.trainingState;
  delete response?.data?.attributes?.owner;

  return response;
}

// check cert base64 https://codebeautify.org/base64-to-image-converter
// flow after change status to `done` at `training-state` create new certificate data (not include cert base64)
module.exports = createCoreController(apiConfig, ({ strapi }) => ({
  async findOne(ctx) {
    const response = await super.findOne(ctx);
    if (response == null) {
      return response;
    }

    const certificatePopulate = await strapi
      .service("api::certificate.certificate")
      .findOne(response.data.id, {
        populate: ["trainingState", "order", "cert", "owner"],
      });

    // Note: trainingState status not approve yet
    if (certificatePopulate.trainingState?.status != "done") {
      throw new ApplicationError("Your trainingState status not approve yet");
    }

    // if already generate cert should be return
    if (certificatePopulate?.cert != null) {
      return await cleanResponse(response);
    }

    const order = await strapi
      .service("api::order.order")
      .findOne(certificatePopulate.order.id, {
        populate: ["trainingCourse"],
      });

    const certConfig = await strapi
      .service("api::certificate-config.certificate-config")
      .find();

    const { generateCertificate } = strapi.service(apiConfig);

    const fullName = getFullName(certificatePopulate);
    const topic = order.trainingCourse.topic;
    const dateNow = Date.now();
    const dean = certConfig?.dean ?? "masked maskedmaskedmasked maskedmaskedmasked";

    const base64 = await generateCertificate(
      fullName,
      topic,
      dateNow,
      `(${dean})`,
      response?.data?.id
    );

    const { filePath, stats, fileName } = base64toFile(base64, "cert.png");
    const uploadedFile = await strapi.plugins.upload.services.upload.upload({
      data: {},
      files: {
        path: filePath,
        name: fileName,
        type: mime.getType(filePath), // mime type of the file
        size: stats.size,
      },
    });

    const { update } = strapi.query(apiConfig);
    await update({
      data: { cert: uploadedFile[0], fullName, topic, dean },
      where: { id: response.data.id },
      populate: ["cert"],
    });

    removeFile(filePath);

    const newResponse = await super.findOne(ctx);

    return await cleanResponse(newResponse);
  },
}));
