//@ts-check
/**
 * @typedef {Object} Target
 * @property {number} x - The x position of the target
 * @property {number} y - The y position of the target
 * @property {number} width - The width of the target
 * @property {number} height - The height of the target
 */

/**
 * @typedef {Object} MapDimensions
 * @property {number} width - The width of the map in pixels
 * @property {number} height - The height of the map in pixels
 */

/**
 * Camera class that follows a target and handles viewport calculations
 */
export class Camera {
	/**
	 * Create a new Camera
	 * @param {Object} config - Camera configuration
	 * @param {number} config.width - Viewport width in pixels
	 * @param {number} config.height - Viewport height in pixels
	 * @param {MapDimensions} config.mapDimensions - The dimensions of the game map
	 */
	constructor({ width, height, mapDimensions }) {
		/** @type {number} */
		this.x = 0;
		/** @type {number} */
		this.y = 0;
		/** @type {number} */
		this.width = width;
		/** @type {number} */
		this.height = height;
		/** @type {MapDimensions} */
		this.mapDimensions = mapDimensions;
	}

	/**
	 * Update the camera position to follow a target
	 * @param {Target} target - The object to follow (usually the player)
	 */
	follow(target) {
		// Center the camera on the target
		this.x = target.x - this.width / 2 + target.width / 2;
		this.y = target.y - this.height / 2 + target.height / 2;

		// Keep camera within map bounds
		this.x = Math.max(0, Math.min(this.x, this.mapDimensions.width - this.width));
		this.y = Math.max(0, Math.min(this.y, this.mapDimensions.height - this.height));
	}

	/**
	 * Get the visible area boundaries
	 * @param {number} tileSize - The size of a single tile
	 * @returns {{startCol: number, endCol: number, startRow: number, endRow: number}}
	 */
	getVisibleArea(tileSize) {
		return {
			startCol: Math.floor(this.x / tileSize),
			endCol: Math.ceil((this.x + this.width) / tileSize),
			startRow: Math.floor(this.y / tileSize),
			endRow: Math.ceil((this.y + this.height) / tileSize)
		};
	}

	/**
	 * Apply camera transform to the rendering context
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
	 */
	begin(ctx) {
		ctx.save();
		ctx.translate(-this.x, -this.y);
	}

	/**
	 * Restore the rendering context to its original state
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
	 */
	end(ctx) {
		ctx.restore();
	}

	/**
	 * Convert screen coordinates to world coordinates
	 * @param {number} screenX - X coordinate on screen
	 * @param {number} screenY - Y coordinate on screen
	 * @returns {{x: number, y: number}} World coordinates
	 */
	screenToWorld(screenX, screenY) {
		return {
			x: screenX + this.x,
			y: screenY + this.y
		};
	}

	/**
	 * Convert world coordinates to screen coordinates
	 * @param {number} worldX - X coordinate in world
	 * @param {number} worldY - Y coordinate in world
	 * @returns {{x: number, y: number}} Screen coordinates
	 */
	worldToScreen(worldX, worldY) {
		return {
			x: worldX - this.x,
			y: worldY - this.y
		};
	}
}
