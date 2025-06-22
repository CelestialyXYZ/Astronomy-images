const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

// Function to ensure directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Function to process a single image with specified output file path and dimensions
module.exports = async (inputFilePath, outputFilePath, dimensions) => {
  // Ensure the output directory exists
  ensureDirExists(path.dirname(outputFilePath));

  try {
    /* console.log(`Processing ${inputFilePath}`); */

    const image = await Jimp.read(inputFilePath);
    const { bitmap } = image;

    // Extract the desired width and height
    const { width, height } = dimensions;

    // Determine if the image needs rotation
    let shouldRotate =
      (bitmap.width / bitmap.height > 1 && width / height < 1) ||
      (bitmap.width / bitmap.height < 1 && width / height > 1);

    const processedImage = shouldRotate ? image.clone().rotate(90) : image.clone();

    // Resize and save the image
    await processedImage
      .cover(width, height)
      .quality(80)
      .writeAsync(outputFilePath);

    /* console.log(`Processed ${inputFilePath} -> ${outputFilePath} with ${shouldRotate ? "rotation" : "out rotation"}`); */
  } catch (error) {
    console.error(`Error processing ${inputFilePath}:`, error);
  }
};