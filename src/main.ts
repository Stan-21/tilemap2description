import './style.css'

export interface Tile {
  id: number;
  image?: string; // Not currently used, but feel free to store a base64 image string here if needed
  description?: string; // Same as above, not currently used
  
  //neighboring tiles in each direction
  up?: Tile[];
  down?: Tile[];
  left?: Tile[];
  right?: Tile[];

  colors?: Color[];
  top_border?: Color[];
  bottom_border?: Color[];
  left_border?: Color[];
  right_border?: Color[];
}

export class Color { // Color of a single Pixel
  red: number;
  green: number;
  blue: number;
  alpha: number;

  constructor(red: number, green: number, blue: number, alpha: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
}

////////**** EDIT THIS STUFF ****////////

/**
 * Given an array of tiles, update each tile's direction properties to indicate which tiles it can tile with in each direction.
 * @param tiles Array of Tile objects to update
 */
export function updateTileNeighbors(tiles: Tile[], pixelColor: Uint8ClampedArray[]): void {
  // Tiles are arranged in a grid, but represented as a 1D array. Starting at index 0, the first tile is in the top-left corner 
  // and the last tile is in the bottom-right corner. A neighboring tile can be added like so:
  //
  //  tiles[0].right = [tiles[1], tiles[2]];
  //
  // This means that tile 0 can tile with tiles 1 and 2 to its right. It's probably best to also put the reciprocal relationship 
  // in place so you can skip some calculations, but the implementation is entirely up to you. I'm just guessing here.
  
  // TODO: implement neighbor assignment logic here
  filterBorder(tiles, pixelColor);
  for (let j = 0; j < tiles.length; j++) {
    let up = [];
    let down = [];
    let right = [];
    let left = [];
    for (let i = 0; i < tiles.length; i++) {
      if (compareBorder(tiles[j].bottom_border!, tiles[i].top_border!, 0.8)) {
        up.push(tiles[i]);
      }
      if (compareBorder(tiles[j].top_border!, tiles[i].bottom_border!, 0.8)) {
        down.push(tiles[i]);
      }
      if (compareBorder(tiles[j].left_border!, tiles[i].right_border!, 0.8)) {
        right.push(tiles[i]);
      }
      if (compareBorder(tiles[j].right_border!, tiles[i].left_border!, 0.8)) {
        left.push(tiles[i]);
      }
    }
    tiles[j].up = up;
    tiles[j].down = down;
    tiles[j].right = right;
    tiles[j].left = left;
  }
}

// IDEAS: SOME SORT OF PERCENT ERROR TO DETERMINE WHETHER IT CONNECTS
// AVERAGING COLORS OUT AND THEN USING CERTAIN ERROR AMOUNT?

// RULES:
// IF MATCHES PIXEL FOR PIXEL IT MUST BE A MATCH
// IF NEIGHBORING PIXEL IS THE SAME MAYBE A MATCH?
// IF EVERY PIXEL IS THE SAME, BUT DIFFERENT ORDER POSSIBLY A MATCH? (CHECK DISTANCES BETWEEN PIXELS?) (IF PIXELS IS EXACTLY THE SAME IN REVERSE, PROLLY NOT A MATCH?)
// 


export function filterBorder(tiles: Tile[], pixelColor: Uint8ClampedArray[]): Color[] {
  let filteredArray: Color[] = [];

  var tileNum = 0;
  let tileSize = parseInt(tileSizeInput.value, 10);
  for (let i = 0; i < pixelColor.length; i++) {
    for (let j = 4; j <= pixelColor[i].length; j+= 4) {
      var color = new Color(pixelColor[i][j-4], pixelColor[i][j-3], pixelColor[i][j-2], pixelColor[i][j-1]);
      filteredArray.push(color);
      if (filteredArray.length == tileSize * tileSize) {
        tiles[tileNum].colors = filteredArray;
        tiles[tileNum].top_border = filteredArray.slice(0, tileSize);
        tiles[tileNum].bottom_border = filteredArray.slice(-tileSize);
        tiles[tileNum].left_border = getLeft(filteredArray);
        tiles[tileNum].right_border = getRight(filteredArray);
        tileNum++;
        filteredArray = [];
      }
    }
  }
  return filteredArray;
}

export function getLeft(array: Color[]): Color[]{
  let filter: Color[] = [];
  let size = parseInt(tileSizeInput.value, 10)
  for (let i = 0; i < size; i++) {
    filter.push(array[i * size]);
  }
  return filter;
}

export function getRight(array: Color[]): Color[]{
  let filter: Color[] = [];
  let size = parseInt(tileSizeInput.value, 10)
  for (let i = 0; i < size; i++) {
    filter.push(array[i * size + (size - 1)]);
  }
  return filter;
}

export function compareBorder(array1: Color[], array2: Color[], minPercent: number): boolean{
  if (isBorderTransparent(array1) || isBorderTransparent(array2)) {
    return false;
  }
  let err = 0;
  for (let i = 0; i < array1.length; i++) {
    if (!(compareColor(array1[i], array2[i]))) {
      //array1.sort((a, b) => a.red - b.red);
      //array2.sort((a, b) => a.red - b.red);
      //return secondCheck(array1, array2, 0.8);
      if ((compareColor(array1[i], array2[i + 1])) || (compareColor(array1[i], array2[i - 1]))) {
        err += 0.5;
      } else {
        err += 1;
      }
    }
  }
  return ((parseInt(tileSizeInput.value, 10) - err )/ parseInt(tileSizeInput.value, 10)) > minPercent;
}

export function isBorderTransparent(array: Color[]): boolean{
  for (let i = 0; i < array.length; i++) {
    if (array[i].alpha != 0) {
      return false;
    }
  }
  return true;
}

export function compareColor(color1: Color, color2: Color): boolean{
  if (color1 == null || color2 == null) {
    return false;
  }
  if ((color1.red == color2.red) && (color1.blue == color2.blue) && (color1.green == color2.green) && (color1.alpha == color2.alpha)) { // EVERYTHING IS THE SAME
    return true;
  }
  return false;
}


////////**** Code to take in a tileset and create array. Only edit if you need to ****////////

const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const tileSizeInput = document.getElementById('tileSizeInput') as HTMLInputElement;
const processBtn = document.getElementById('processBtn') as HTMLButtonElement;

processBtn.onclick = async () => {
  const file = imageInput.files?.[0];
  const tileSize = parseInt(tileSizeInput.value, 10);
  if (!file || isNaN(tileSize) || tileSize <= 0) {
    alert('Please select an image and enter a valid tile size.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const cols = Math.floor(img.width / tileSize);
      const rows = Math.floor(img.height / tileSize);
      const tiles: Tile[] = [];
      const pixelColor: Uint8ClampedArray[] = []; // EDIT HERE (STAN)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tileSize;
      tempCanvas.height = tileSize;
      const tempCtx = tempCanvas.getContext('2d');
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          tempCtx?.clearRect(0, 0, tileSize, tileSize);
          tempCtx?.drawImage(
            img,
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize,
            0,
            0,
            tileSize,
            tileSize
          );
          const tilePixels = tempCtx?.getImageData(0, 0, tileSize, tileSize).data; // EDITS HERE (STAN)  
          pixelColor.push(tilePixels!);
          const image = tempCanvas.toDataURL();
          tiles.push({
            id: y * cols + x,
            image
          });
        }
      }
      updateTileNeighbors(tiles, pixelColor);
// Display all tile images on screen
      const tileGallery = document.getElementById('tileGallery') || document.createElement('div');
      tileGallery.id = 'tileGallery';
      tileGallery.innerHTML = '';
      tileGallery.style.display = 'flex';
      tileGallery.style.flexWrap = 'wrap';
      tileGallery.style.gap = '4px';

      // Create modal container
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      modal.style.display = 'none';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '1000';

      const modalContent = document.createElement('div');
      modalContent.style.background = '#fff';
      modalContent.style.padding = '20px';
      modalContent.style.borderRadius = '8px';
      modalContent.style.display = 'flex';
      modalContent.style.flexDirection = 'column';
      modalContent.style.alignItems = 'center';
      modalContent.style.gap = '10px';

      const modalImg = document.createElement('img');
      modalImg.style.border = '2px solid #000';

      const modalNeighbors = document.createElement('div');
      modalNeighbors.style.display = 'flex';
      modalNeighbors.style.flexWrap = 'wrap';
      modalNeighbors.style.gap = '4px';

      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'Close';
      closeBtn.onclick = () => (modal.style.display = 'none');

      modalContent.appendChild(modalImg);
      modalContent.appendChild(modalNeighbors);
      modalContent.appendChild(closeBtn);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // ---- END MODAL CREATION ----

      tiles.forEach(tile => {
        const imgElem = document.createElement('img');
        imgElem.src = tile.image || '';
        imgElem.width = tileSize;
        imgElem.height = tileSize;
        imgElem.style.border = '1px solid #ccc';

        // Tooltip on hover
        imgElem.title = `Tile ID: ${tile.id}\n` +
                        `Up: ${tile.up?.length || 0}\n` +
                        `Down: ${tile.down?.length || 0}\n` +
                        `Left: ${tile.left?.length || 0}\n` +
                        `Right: ${tile.right?.length || 0}`;

        // Click to open modal and show neighbors
        imgElem.onclick = () => {
          modalImg.src = tile.image || '';
          modalImg.width = tileSize * 2;
          modalImg.height = tileSize * 2;

          // Show neighbor tiles
          modalNeighbors.innerHTML = '';
          const addNeighbor = (label: string, neighbors?: Tile[]) => {
            if (!neighbors || neighbors.length === 0) return;
            neighbors.forEach(n => {
              const neighborImg = document.createElement('img');
              neighborImg.src = n.image || '';
              neighborImg.width = tileSize;
              neighborImg.height = tileSize;
              neighborImg.style.border = '2px solid #007bff';
              neighborImg.title = `${label} Neighbor: Tile ID ${n.id}`;
              modalNeighbors.appendChild(neighborImg);
            });
          };

          addNeighbor('Up', tile.up);
          addNeighbor('Down', tile.down);
          addNeighbor('Left', tile.left);
          addNeighbor('Right', tile.right);

          modal.style.display = 'flex';
        };

        tileGallery.appendChild(imgElem);
      });

      document.body.appendChild(tileGallery);
      console.log('Tiles:', tiles);
      alert(`Created ${tiles.length} tiles. Please check the console for details.`);
      //TODO - Thomas - Add code to validate student results.
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

