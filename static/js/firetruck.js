//@ts-check

import { TileMap } from "./tileset.js";

/**
 * @typedef {Object} FiretruckConfig
 * @property {number} [x=0] - Initial x position
 * @property {number} [y=0] - Initial y position
 * @property {number} [width=32] - Sprite width
 * @property {number} [height=32] - Sprite height
 * @property {string} spritePath - Path to sprite image
 * @property {number} [speed=5] - Movement speed
 * @property {number} [totalFrames=1] - Number of animation frames
 * @property {number} [animationSpeed=0.1] - Speed of animation
 * @property {number} canvasWidth - Number of tiles in the map
 * @property {number} canvasHeight - Number of tiles in the map
 * @property {boolean} [debug=false] - Enable debug mode
 * @property {TileMap} tilemap - Tilemap instance
 */


export class Firetruck {
	/**
     * Create a new Firetruck instance
     * @param {FiretruckConfig} config - Configuration object for the Firetruck
     */
	constructor(config) {
		/** @type {TileMap} Tilemap */
		this.tilemap = config.tilemap;

		/** @type {number} Current x position */
		this.x = config.x || 0;

		/** @type {number} Current y position */
		this.y = config.y || 0;

		/** @type {number} Width of the sprite in pixels */
		this.width = config.width || 32;

		/** @type {number} Height of the sprite in pixels */
		this.height = config.height || 32;

		/** @type {number} Movement speed in pixels per frame */
		this.speed = config.speed || 5;

		// Animation properties
		/** @type {number} Current frame x-coordinate in spritesheet */
		this.frameX = 0;

		/** @type {number} Current frame y-coordinate in spritesheet */
		this.frameY = 0;

		/** @type {number} Total number of animation frames */
		this.totalFrames = config.totalFrames || 1;

		/** @type {number} Speed of animation transitions */
		this.animationSpeed = config.animationSpeed || 0.1;

		/** @type {number} Timer for frame animation */
		this.frameTimer = 0;

		// Movement flags
		/** @type {boolean} Whether the firetruck is currently moving */
		this.moving = false;

		/** @type {'left'|'right'} Current facing direction */
		this.direction = 'right';

		// Sprite setup
		/** @type {HTMLImageElement} Sprite image element */
		this.image = new Image();
		this.image.src = config.spritePath;

		// Canvas
		/** @type {number} Width of the game canvas in tiles */
		this.canvasWidth = config.canvasWidth;

		/** @type {number} Height of the game canvas in tiles */
		this.canvasHeight = config.canvasHeight;

		// Debug
		/** @type {boolean} Whether debug mode is enabled */
		this.debug = config.debug || false;

		/** @type {HTMLElement | null} Debug text element */
		this.debugTextEl = null;
		if (this.debug) {
			this.debugTextEl = document.createElement('div');
			this.debugTextEl.id = 'debugText';
			document.body.appendChild(this.debugTextEl);
		}
	}
	renderDebug() {
		if (!this.debug) return;
		if (!this.debugTextEl) return;
		this.debugTextEl.innerHTML = `
			<div>Pos: ${Math.round(this.x)},${Math.round(this.y)}</div>
			<div>Sprite loaded: ${this.image.complete}</div>
			<div>Image size: ${this.image.width}x${this.image.height}</div>
		`;

	}
	/**
	 * Loads the sprite image
	 * @returns {Promise<void>}
	 */
	async load() {
		return new Promise((resolve) => {
			this.image.onload = () => resolve();
		});
	}

	/**
	 * Updates animation frames
	 */
	updateAnimation() {
		if (this.moving) {
			this.frameTimer += this.animationSpeed;
			if (this.frameTimer >= 1) {
				this.frameTimer = 0;
				this.frameX = (this.frameX + 1) % this.totalFrames;
			}
		}
	}

	/**
	 * Updates position based on input
	 * @param {Object.<string, boolean>} keys - Current state of keyboard inputs
	 */

	update(keys) {
		this.moving = false;
		let newX = this.x;
		let newY = this.y;

		// Calculate new position based on keys
		if (keys.ArrowRight || keys['d'] || keys['D']) {
			newX += this.speed;
			this.direction = 'right';
			this.moving = true;
		}
		if (keys.ArrowLeft || keys.a) {
			newX -= this.speed;
			this.direction = 'left';
			this.moving = true;
		}
		if (keys.ArrowUp || keys.w) {
			newY -= this.speed;
			this.moving = true;
		}
		if (keys.ArrowDown || keys.s) {
			newY += this.speed;
			this.moving = true;
		}

		// Check collision at corners of the sprite
		const margin = 4;
		const points = [
			{ x: newX + margin, y: newY + margin },
			{ x: newX + this.width - margin, y: newY + margin },
			{ x: newX + margin, y: newY + this.height - margin },
			{ x: newX + this.width - margin, y: newY + this.height - margin }
		];

		// Only move if no collision
		const wouldCollide = points.some(point => this.tilemap.isSolid(point.x, point.y));
		if (!wouldCollide) {
			// Apply bounds checking
			this.x = Math.max(0, Math.min(newX, this.canvasWidth - this.width));
			this.y = Math.max(0, Math.min(newY, this.canvasHeight - this.height));
		}

		this.updateAnimation();
	}


	/**
	 * Renders the firetruck
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
	 */
	render(ctx) {
		// Debug rectangle - add this first to verify position
		// ctx.fillStyle = 'red';
		ctx.fillRect(this.x, this.y, this.width, this.height);

		// Debug text
		this.renderDebug()
		// Draw sprite
		try {
			ctx.drawImage(
				this.image,
				0, // sourceX
				0, // sourceY
				690, // Use full sprite width
				362, // Use full sprite height
				this.x,
				this.y,
				this.width, // Scale down to desired size
				this.height
			);
		} catch (e) {
			console.error('Error drawing sprite:', e);
		}
	}
}
