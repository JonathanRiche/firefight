//@ts-check
import { TileMap } from './tileset.js';
import { Firetruck } from './firetruck.js';
import { Camera } from './camera.js';

/**
 * Loads map data from JSON file
 * @returns {Promise<any>}
 */
async function loadMapData() {
	const response = await fetch('/static/tiles/map.json');
	return response.json();
}

/**
 * Initialize game components
 */
async function init() {
	// Input handling
	const keys = {
		ArrowLeft: false,
		ArrowRight: false,
		ArrowUp: false,
		ArrowDown: false,
		KeyD: false,  // Changed from 'd' to 'KeyD'
		KeyA: false,  // Changed from 'a' to 'KeyA'
		KeyW: false,  // Changed from 'w' to 'KeyW'
		KeyS: false,   // Changed from 's' to 'KeyS'
		d: false,    // Add lowercase versions
		a: false,
		w: false,
		s: false
	};

	window.addEventListener('keydown', (e) => {
		if (keys.hasOwnProperty(e.key)) {
			keys[e.key] = true;
		}
	});

	window.addEventListener('keyup', (e) => {
		if (keys.hasOwnProperty(e.key)) {
			keys[e.key] = false;
		}
	});

	const canvasWidth = 29 * 4;
	const canvasHeight = 6 * 4;

	// const canvasWidth = 29 * 8;
	// const canvasHeight = 6 * 8;

	// Canvas setup
	/** @type {HTMLCanvasElement | null | HTMLElement} */
	const canvas = document.getElementById('gameCanvas');
	if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Canvas not found');
	// Set canvas size - Add these lines
	canvas.width = canvasWidth;  // or whatever size you want
	canvas.height = canvasHeight; // or whatever size you want


	canvas.style.border = '1px solid red'; // Debug border to see canvas bounds
	console.log('Canvas size:', canvas.width, canvas.height);
	const ctx = canvas.getContext('2d');
	const mapData = await loadMapData();

	// Initialize game objects
	const tileMap = new TileMap({
		mapData,
		tileset: '/static/tiles/spritesheet.png'
	});
	const TILE_SIZE = 8;
	const camera = new Camera({
		width: canvas.width,
		height: canvas.height,
		mapDimensions: {
			width: tileMap.mapWidth * TILE_SIZE,
			height: tileMap.mapHeight * TILE_SIZE
		}
	});
	const firetruck = new Firetruck({
		x: 8 * 4,
		y: 8 * 8,
		width: 8 * 1,  // Adjust based on your sprite size
		height: 8 * 1, // Adjust based on your sprite size
		spritePath: '/static/character/firetruckright.png',
		canvasWidth: tileMap.mapWidth * TILE_SIZE,  // Use full map width
		canvasHeight: tileMap.mapHeight * TILE_SIZE,
		// canvasWidth: canvasWidth, // Adjust based on your map size
		// canvasHeight: canvasHeight, // Adjust based on your map size
		speed: 1,
		debug: true,
		tilemap: tileMap,
		totalFrames: 1 // Adjust based on your sprite sheet
	});

	// Load all assets
	await Promise.all([
		tileMap.load(),
		firetruck.load()
	]);

	// Set initial canvas size
	canvas.width = canvasWidth;  // Your viewport width (29 * 8)
	canvas.height = canvasHeight; // Your viewport height (6 * 8)
	// canvas.width = tileMap.mapWidth * tileMap.tileSize;
	// canvas.height = tileMap.mapHeight * tileMap.tileSize;

	/**
	 * Main game loop
	 * @param {number} timestamp
	 */
	function gameLoop(timestamp) {
		if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Canvas not found');
		if (!(ctx instanceof CanvasRenderingContext2D)) throw new Error('Canvas context not found');
		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Update game objects
		firetruck.update(keys);

		// Update camera to follow firetruck
		camera.follow(firetruck);

		// Start camera transform
		camera.begin(ctx);

		// Get visible area for tilemap
		const visibleArea = camera.getVisibleArea(TILE_SIZE);

		// Render game objects within camera view
		tileMap.render(ctx, visibleArea); // We'll need to modify TileMap.render()
		firetruck.render(ctx);

		// End camera transform
		camera.end(ctx);

		// Continue the game loop
		requestAnimationFrame(gameLoop);
	}


	// Start the game loop
	gameLoop(0);
}

export async function main() {
	await init();
}
