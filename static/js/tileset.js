//@ts-check
/**
 * @typedef {Object} Tile
 * @property {number} id
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Layer
 * @property {string} name
 * @property {Tile[]} tiles
 * @property {boolean} collider
 */

/**
 * @typedef {Object} MapData
 * @property {number} mapWidth
 * @property {number} mapHeight
 * @property {number} tileSize
 * @property {Layer[]} layers
 */

/**
 * @typedef {Object} TileMapConfig
 * @property {MapData} mapData
 * @property {string} tileset
 */

export class TileMap {
	/**
	 * @param {TileMapConfig} config
	 */
	constructor(config) {
		const { mapData, tileset } = config;
		this.tileSize = mapData.tileSize;
		this.mapWidth = mapData.mapWidth;
		this.mapHeight = mapData.mapHeight;
		this.layers = mapData.layers;
		this.tilesetImage = new Image();
		this.tilesetImage.src = tileset;
	}
	/**
	 * @param {number} x - X position in pixels
	 * @param {number} y - Y position in pixels
	 * @returns {boolean}
	 */
	isSolid(x, y) {
		// Convert pixel position to tile coordinates
		const tileX = Math.floor(x / this.tileSize);
		const tileY = Math.floor(y / this.tileSize);

		// Check all layers that have collider set to true
		return this.layers
			.filter(layer => layer.collider)
			.some(layer =>
				layer.tiles.some(tile =>
					tile.x === tileX &&
					tile.y === tileY
				)
			);
	}
	/**
	 * @returns {Promise<void>}
	 */
	async load() {
		return new Promise((resolve) => {
			this.tilesetImage.onload = () => resolve();
		});
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {{startCol: number, endCol: number, startRow: number, endRow: number}} visibleArea
	 */
	render(ctx, visibleArea) {
		const { startCol, endCol, startRow, endRow } = visibleArea;

		this.layers.forEach(layer => {
			layer.tiles.forEach(tile => {
				// Only render tiles within the visible area
				if (tile.x >= startCol && tile.x <= endCol &&
					tile.y >= startRow && tile.y <= endRow) {

					const sourceX = (tile.id * this.tileSize) % this.tilesetImage.width;
					const sourceY = Math.floor((tile.id * this.tileSize) / this.tilesetImage.width) * this.tileSize;

					ctx.drawImage(
						this.tilesetImage,
						sourceX, sourceY,
						this.tileSize, this.tileSize,
						tile.x * this.tileSize, tile.y * this.tileSize,
						this.tileSize, this.tileSize
					);
				}
			});
		});
	}


}
