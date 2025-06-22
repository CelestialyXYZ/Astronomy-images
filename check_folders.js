const { readdir, rm, writeFile, unlink, stat, readFile } = require("fs/promises");
const { join, resolve } = require("path");
const progress = require("progress");
const { magenta, green, yellow, cyan } = require("colorette");

module.exports = async (folderDir) => {
    const dir = resolve(folderDir);
    const folders = await readdir(dir);
    
    const totalFolders = folders.length;
    const progressBar = new progress(magenta("[:bar] :percent :etas"), {
        complete: "=",
        incomplete: " ",
        width: 100,
        total: totalFolders,
    });

    // Detect and delete unregistered files in the root dir
    const files = await readdir(dir);
    for (const file of files) {
        const filePath = join(dir, file);
        const fileStat = await stat(filePath);
        if (!fileStat.isDirectory()) {
            console.log(yellow(`\nUnregistered file detected and deleted: ${filePath}`));
            await unlink(filePath);
        }
    }

    for (const folder of folders) {
        const folderPath = join(dir, folder);
        const jsonPath = join(folderPath, "images.json");

        try {
            // Check for images.json file
            await stat(jsonPath);
            const json = JSON.parse(await readFile(jsonPath, "utf-8"));
            
            if (json.images.length === 0) {
                console.log(yellow(`\nNo images in ${folderPath}, deleting folder.`));
                await rm(folderPath, { recursive: true, force: true });
            } else {
                const registeredImages = json.images.map(image => image.filename);
                const folderImages = await readdir(folderPath);
                
                // Detect and delete images not registered in images.json
                for (const imageFile of folderImages) {
                    if (/\.(jpe?g|png|tiff?)$/i.test(imageFile) && !registeredImages.includes(imageFile)) {
                        const filePath = join(folderPath, imageFile);
                        console.log(yellow(`\nUnregistered file detected and deleted: ${filePath}`));
                        await unlink(filePath);
                    }
                }

                const newImages = json.images.filter(image => {
                    const filePath = join(folderPath, image.filename);
                    return stat(filePath).catch(() => {
                        console.log(yellow(`\nMissing file: ${filePath}`));
                        return false;
                    });
                });

                if (newImages.length < json.images.length) {
                    console.log(cyan(`\nUpdating ${jsonPath}`));
                    json.images = newImages;
                    await writeFile(jsonPath, JSON.stringify(json, null, 2), "utf-8");
                }
            }
        } catch (error) {
            // Handle the case where the json file doesn't exist
            if (error.code === 'ENOENT') {
                console.log(yellow(`\nNo images.json in ${folderPath}, deleting folder.`));
                await rm(folderPath, { recursive: true, force: true });
            } else {
                console.error(`Error processing ${folderPath}:`, error);
            }
        }
        progressBar.tick();
    }

    console.log(green("\nDone."));
};
