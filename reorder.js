import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'src', 'galleryData.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Find the index of the image with id "11"
const targetId = "11";
const index = data.findIndex(item => item.id === targetId);

if (index !== -1) {
  const item = data.splice(index, 1)[0];
  data.splice(data.length - 1, 0, item);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Moved item 11 to second-to-last position.");
} else {
  console.log("Image 11 not found.");
}
