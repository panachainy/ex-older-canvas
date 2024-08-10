"use strict";

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const moment = require("moment-timezone");

const {
  setBackgroundImage,
  setImage,
  setBackgroundColor,
  setText,
  setImageWithQRCode,
} = require("../../certificate/utils/set-components");

const { createCoreService } = require("@strapi/strapi").factories;
const apiConfig = "api::certificate.certificate";

const toBuddhistYear = (moment, format) => {
  var christianYear = moment.format("YYYY");
  var buddhishYear = (parseInt(christianYear) + 543).toString();
  return moment
    .format(
      format
        .replace("YYYY", buddhishYear)
        .replace("YY", buddhishYear.substring(2, 4))
    )
    .replace(christianYear, buddhishYear);
};

/**
 *
 * @param {*} fullName - ชื่อผู้อบรม
 * @param {*} courseName - ชื่อหลักสูตร/โครงการ
 * @param {*} date - วันที่อบรม
 * @param {*} awardGiver - ชื่อผู้มอบ
 * @param {*} certId - id of ประกาศนียบัตร
 * @returns
 */
async function renderCertificate(
  fullName,
  courseName,
  date,
  awardGiver,
  certId
) {
  moment.locale("th");
  const certificatedAt = toBuddhistYear(moment(date).tz("Asia/Bangkok"), "LL");

  const content = {
    logoPath: "./src/api/masked.png",
    faculty: "maskedmasked",
    university: "maskedmasked",
    sendCertificate: "maskedmasked",
    fullName: fullName,
    joined: "masked",
    courseName: courseName,
    certedAt: `masked ${certificatedAt}`,
    signaturePath: "./src/api/masked.png",
    awardGiver: awardGiver,
    deanPosition: "masked",
    qrData: `https://masked/${certId}`,
  };

  const black = "#121212";
  const green = "#185D53";

  const textOption = {
    fontWeight: 500,
    font: "Noto Sans Thai",
    fontSize: "40px",
    textAlign: "center",
    fillStyle: black,
  };

  const width = 1754;
  const height = 1240;

  const middleVertical = width / 2;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Note: set color because background is svg it transparent.
  setBackgroundColor(context, width, height, "#fff");
  await setBackgroundImage(
    context,
    "./src/api/certificate/assets/certs/background.png",
    "1754",
    "1240"
  );

  await setImage(context, content.logoPath, {
    w: 273.57,
    h: 171.43,
    x: 740,
    y: 101,
  });

  setText(
    context,
    content.faculty,
    {
      x: middleVertical,
      y: 282,
    },
    {
      ...textOption,
      fontSize: "48px",
    }
  );

  setText(
    context,
    content.university,
    {
      x: middleVertical,
      y: 350,
    },
    {
      ...textOption,
      fontSize: "48px",
    }
  );

  setText(
    context,
    content.sendCertificate,
    {
      x: middleVertical,
      y: 437,
    },
    {
      ...textOption,
      fontSize: "24px",
      fontWeight: 300,
    }
  );

  setText(
    context,
    content.fullName,
    {
      x: middleVertical,
      y: 513,
    },
    {
      ...textOption,
      fillStyle: green,
      fontSize: "60px",
    }
  );

  setText(
    context,
    content.joined,
    {
      x: middleVertical,
      y: 642,
    },
    {
      ...textOption,
      fontSize: "24px",
      fontWeight: 300,
    }
  );

  setText(
    context,
    content.courseName,
    {
      x: middleVertical,
      y: 690,
    },
    {
      ...textOption,
      fontSize: "48px",
    }
  );

  setText(
    context,
    content.certedAt,
    {
      x: middleVertical,
      y: 773,
    },
    {
      ...textOption,
      fontSize: "32px",
    }
  );

  await setImage(context, content.signaturePath, {
    w: 354,
    h: 220,
    x: 700,
    y: 822,
  });

  setText(
    context,
    content.awardGiver,
    {
      x: middleVertical,
      y: 1031,
    },
    {
      ...textOption,
      fontSize: "28px",
    }
  );

  setText(
    context,
    content.deanPosition,
    {
      x: middleVertical,
      y: 1077,
    },
    {
      ...textOption,
      fontSize: "28px",
      fontWeight: 300,
    }
  );

  await setImageWithQRCode(context, content.qrData, {
    w: 90,
    h: 90,
    x: 1546,
    y: 1042,
  });

  return canvas.toDataURL();
}

module.exports = createCoreService(apiConfig, ({ strapi }) => ({
  // TODO: doing x
  generateCertificate: async (
    fullName,
    courseName,
    date,
    awardGiver,
    certId
  ) => {
    try {
      console.time("renderImage");

      const certBase64 = await renderCertificate(
        fullName,
        courseName,
        date,
        awardGiver,
        certId

        // font, // will remove `Noto Sans Thai`
        // withWatermark
      );
      console.timeEnd("renderImage");

      return certBase64;
    } catch (err) {
      const { logErr } = strapi.service("api::generic.generic");

      logErr("[afterCreate] can't render certificate", { err: err });

      // FIXME: xthrow error
      // throw new ApplicationError("can't render certificate");
    }
  },
}));
