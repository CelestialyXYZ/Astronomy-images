const processImage = require("./image_process");
const checkFolders = require("./check_folders");
const { resolve } = require("path");
const { readdirSync, writeFileSync, readFileSync, rmSync } = require("fs");
const { cyan, green, yellow, bold, red } = require("colorette");
const ProgressBar = require("progress");
const uuid = require("uuid");
const prompts = require("prompts");

const predefinedDimensions = [
    { width: 1920, height: 1280 },
    { width: 1280, height: 900 },
    { width: 500, height: 300 }
];

async function main() {
    const startTime = Date.now();  // Start total program execution time

    try {
        // Prompt user for settings
        const response = await prompts([
            {
                type: "text",
                name: "inputDir",
                message: "Enter the input directory path:",
                initial: "assets/"
            },
            {
                type: "text",
                name: "outputDir",
                message: "Enter the output directory path:",
                initial: "images/dso/"
            },
            {
                type: "confirm",
                name: "emptyOutputDir",
                message: "Do you want to empty the output directory before processing?",
                initial: true
            },
            {
                type: "multiselect",
                name: "dimensions",
                message: "Select dimensions to generate (space to select, enter to confirm):",
                choices: predefinedDimensions.map(dim => ({
                    title: `${dim.width}x${dim.height}`,
                    value: dim
                })),
                hint: "Use space to select dimensions, or leave blank to process all."
            }
        ]);

        const { inputDir, outputDir, emptyOutputDir, dimensions } = response;

        // Use all predefined dimensions if none selected
        const selectedDimensions = dimensions.length ? dimensions : predefinedDimensions;

        // Empty output directory if requested
        if (emptyOutputDir) {
            try {
                rmSync(resolve(outputDir), { recursive: true, force: true });
                console.log(green(`Output directory "${outputDir}" cleared.`));
            } catch (err) {
                console.error(red(`Error clearing output directory: ${err.message}`));
            }
        }

        const catalogDirs = readdirSync(resolve(inputDir));

        for (const dimension of selectedDimensions) {
            const dimensionStartTime = Date.now();  // Track time for each resolution
            console.log(cyan(`Generating ${dimension.width}x${dimension.height} images...`));

            for (const catalog of catalogDirs) {
                const catalogStartTime = Date.now();  // Track time for each catalog
                try {
                    console.log(cyan(`Generating images for catalog "${catalog}"...`));
                    
                    // Check folder integrity
                    await checkFolders(resolve(inputDir, catalog));

                    // Count total files for progress
                    let fileCount = 0;
                    const catalogPath = resolve(inputDir, catalog);

                    for (const folder of readdirSync(catalogPath)) {
                        const folderPath = resolve(catalogPath, folder);
                        const files = readdirSync(folderPath).filter(file => file !== "images.json");
                        fileCount += files.length;
                    }

                    // Initialize progress bar
                    const progressBar = new ProgressBar(
                        `[:bar] ${yellow(catalog)} | ${red(dimension.width + "x" + dimension.height)} :percent :etas (:current/:total)`,
                        {
                            total: fileCount,
                            width: 40,
                            complete: green("="),
                            incomplete: cyan("-"),
                            clear: true
                        }
                    );

                    for (const obj of readdirSync(catalogPath)) {
                        const objPath = resolve(catalogPath, obj);
                        const files = readdirSync(objPath);
                        const imageFiles = files.filter(file => file !== "images.json");

                        let imagesJson = {};
                        try {
                            imagesJson = JSON.parse(
                                readFileSync(resolve(objPath, "images.json"), "utf-8")
                            );
                        } catch (err) {
                            console.error(yellow(`Warning: Could not read or parse images.json for "${obj}". Skipping.`));
                            continue;
                        }

                        for (let i = 0; i < imageFiles.length; i++) {
                            try {
                                const image = imageFiles[i];
                                const imgPath = resolve(objPath, image);
                                const imgName =
                                    i === 0
                                        ? `${catalog}_${obj}_default.jpg`
                                        : `${catalog}_${obj}_${uuid.v4()}.jpg`;
                                const toImgPath = resolve(
                                    outputDir,
                                    catalog,
                                    `${dimension.width}x${dimension.height}`,
                                    imgName
                                );

                                await processImage(imgPath, toImgPath, dimension);

                                if (i === 0) {
                                    imagesJson.images[0].is_default = true;
                                    imagesJson.images[0].filename = `${catalog}_${obj}_default.jpg`;
                                } else {
                                    imagesJson.images[i] = {
                                        filename: imgName,
                                        description: imagesJson.images[i].description,
                                        origin_url: imagesJson.images[i].origin_url,
                                        is_default: false
                                    }
                                }

                                progressBar.tick();
                            } catch (err) {
                                console.error(
                                    yellow(`Error processing image "${image}" in "${catalog}/${obj}": ${err.message}`)
                                );
                            }
                        }

                        // Save updated images.json
                        try {
                            const outputJsonPath = resolve(
                                outputDir,
                                catalog,
                                `${dimension.width}x${dimension.height}`,
                                `${catalog}_${obj}_images.json`
                            );
                            writeFileSync(outputJsonPath, JSON.stringify(imagesJson), "utf-8");
                        } catch (err) {
                            console.error(
                                yellow(`Error writing images.json for "${catalog}/${obj}": ${err.message}`)
                            );
                        }
                    }
                } catch (err) {
                    console.error(
                        yellow(`Error processing catalog "${catalog}": ${err.message}`)
                    );
                }
                const catalogEndTime = Date.now();
                const catalogDuration = (catalogEndTime - catalogStartTime) / 1000;  // Time in seconds
                console.log(green(`Finished processing catalog "${catalog}" in ${catalogDuration} seconds.`));
            }

            const dimensionEndTime = Date.now();
            const dimensionDuration = (dimensionEndTime - dimensionStartTime) / 1000;  // Time in seconds
            console.log(green(`Finished processing ${dimension.width}x${dimension.height} images in ${dimensionDuration} seconds.`));
        }
    } catch (err) {
        console.error(bold(red(`Unexpected error: ${err.message}`)));
    }

    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000;  // Total time in seconds
    console.log(green(`Total program runtime: ${totalDuration} seconds.`));
}

main();
