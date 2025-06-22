const axios = require("axios");
const { mkdirSync, writeFileSync } = require("fs");
const { resolve, join, basename } = require("path");
const progress = require("progress");
const json = require("./ic_images.json");
const json2 = require("./ic_links.json");

const randomDelay = (min, max) => 
  new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

const downloadImage = async (url, filepath, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
      });
      writeFileSync(filepath, response.data);
      return true;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Attempt ${attempt} failed for ${url}. Retrying...`);
        await randomDelay(100, 150); // Delay before retry
      } else if (error.response && error.response.status === 404) {
        console.warn(`Image not found: ${url}`);
        return false;
      } else {
        throw error;
      }
    }
  }
};

const totalImages = Object.values(json).reduce((total, images) => total + images.length, 0);
const progressBar = new progress("[:bar] :percent :etas", {
  complete: "=",
  incomplete: " ",
  width: 100,
  total: totalImages,
});

const processNGCKey = async (ngcKey) => {
  const ngc = ngcKey.replace(" ", "");
  const ngcnumber = parseFloat(ngcKey.split(" ")[1]);
  const saveFolder = resolve(join("./assets/ic/", ngcnumber.toString()));

  mkdirSync(saveFolder, { recursive: true });
  const images = [];

  const link = json2.find((elmt) => elmt.ic === ngcnumber).link;

  for (const image of json[ngcKey]) {
    const imageName = basename(image.src);
    const imagePath = join(saveFolder, imageName);

    await randomDelay(15, 30);

    const downloaded = await downloadImage(image.src, imagePath);
    if (downloaded) {
      images.push({
        filename: imageName,
        description: image.alt,
        origin_url: link,
      });

      progressBar.tick(); // Update the progress bar
    }
  }

  writeFileSync(
    join(saveFolder, "images.json"),
    JSON.stringify({ name: ngc, id: ngcnumber, images }),
    "utf-8"
  );
};

const main = async () => {
  for (const ngcKey of Object.keys(json)) {
    await processNGCKey(ngcKey);
  }
};

main().catch(error => console.error("Error processing images:", error));
