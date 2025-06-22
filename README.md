
# 🌌 Astronomy Images Repository

This repository contains a structured collection of astronomical images used for education, visualization, and research purposes. Images are organized by object type, resolution, and catalog.

## 📁 Folder Structure

```
images/
├── constellations/
│   ├── jpg/
│   └── pdf/
├── dso/                    # Deep Sky Objects
│   ├── ic/
│   │   ├── 1280x900/
│   │   ├── 1920x1280/
│   │   └── 500x300/
│   ├── messier/
│   │   ├── 1280x900/
│   │   ├── 1920x1280/
│   │   └── 500x300/
│   └── ngc/
│       ├── 1280x900/
│       ├── 1920x1280/
│       └── 500x300/
├── moon/
├── not_available/
│   ├── fallback_1280x900.jpg
│   ├── fallback_1920x1280.jpg
│   ├── fallback_500x300.jpg
│   └── fallback_900x900_inverted.jpg
```

## 🖼️ Image Categories

- **Constellations**: Diagrams and sky charts.
- **DSO (Deep Sky Objects)**: IC, Messier, and NGC catalog images in multiple resolutions.
  - Each DSO folder contains a lots of images. But there's group of images, to identify the groups, simply read the json file associated with the DSO object like for example :
  NGC : dso/messier/<"1280x900" or "1920x1280" or "500x300">/messier_42_images.json
  ```json
  {"name":"NGC1976","id":1976,"images":[{"filename":"ngc_1976_default.jpg","description":"HST image of NGC 1976, also known as M42, the Orion Nebula","origin_url":"https://cseligman.com/text/atlas/ngc19a.htm#1976","is_default":true}]}
  ```
- **Moon**: Lunar visualizations including NASA-generated moon phase loops.
- **Not Available**: Fallback placeholders.

## 🎓 Credits & Sources

- **Courtney Seligman** – Deep sky object illustrations and catalog descriptions:  
  https://cseligman.com/text/atlas.htm  
  *Courtney Seligman is an American professor of physics and astronomy. For over 20 years, he has collaborated with others to read, comment on, and illustrate objects from various celestial catalogs. Celestialy uses images from his website.*

- **NASA's Scientific Visualization Studio** – Moon images and animations:  
  Moon Phase Loop: https://svs.gsfc.nasa.gov/4310  
  *Credit: NASA's Scientific Visualization Studio*

- **Wikipedia – Messier Catalog**:  
  https://en.wikipedia.org/wiki/Messier_object

- **IAU/ESO Archive – Constellation Charts**:  
  https://iauarchive.eso.org/public/themes/constellations/

- **CelestialyXYZ/Astronomy-images Repository** – Directory organization and formatting by https://github.com/CelestialyXYZ/Astronomy-images

## 🔄 Usage

These assets are intended for:
- Educational materials  
- Astronomy software  
- Outreach presentations  
- Research visual aids
- Celestialy website

## 📜 License

This repository is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** License.

You are free to:
- **Share** — copy and redistribute the material in any medium or format  
- **Adapt** — remix, transform, and build upon the material  

**Under the following terms:**
- **Attribution** — You must give appropriate credit to the original sources listed above.
- **NonCommercial** — You may not use the material for commercial purposes.

📄 Full license: https://creativecommons.org/licenses/by-nc/4.0/
