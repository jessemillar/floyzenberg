var originalCanvas = document.getElementById("original");
var originalCtx = originalCanvas.getContext("2d");
var canvas = document.getElementById("manipulated");
var ctx = canvas.getContext("2d");
var database = new Array();

function load() {
	database = new Array(); // Start fresh so we can load another image without refreshing the page

	var image = new Image(); // This is what we"ll pass along to other functions

	var file = document.getElementById("load").files[0];
	var reader = new FileReader();

	reader.onloadend = function() {
		image.src = reader.result;

		loaded(image);
	}

	if (file) {
		// Reads the data as a URL
		reader.readAsDataURL(file);
	}
}

function loaded(image) {
	image.onload = function() {
		// Resize the canvases to reflect the size of the source image
		originalCanvas.width = image.width;
		originalCanvas.height = image.height;
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.style.top = image.height;

		if (image.width > window.innerWidth) {
			originalCanvas.style.left = 0;
			canvas.style.left = 0;
		}


		// Display the original image in the left canvas
		originalCtx.drawImage(image, 0, 0);
		// Display the original image in the right canvas for manipulation and display
		ctx.drawImage(image, 0, 0);

		// Get pixel data for the whole canvas
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		floydSteinberg(database, imageData);
		drawImageData(database, imageData);
	}
}

function floydSteinberg(data, container) {
	makeGrayscale(container);

	for (var y = 0; y < canvas.height; y++) {
		for (var x = 0; x < canvas.width; x++) {
			// We don"t need to modify by 4 in our own database
			var position = y * canvas.width + x;

			var cutoff = 255 / 2;

			// Make black
			if (data[position] < cutoff) {
				var error = data[position] / 16;

				data[position + 1] += error * 7;
				data[position + canvas.width - 1] += error * 3;
				data[position + canvas.width] += error * 5;
				data[position + canvas.width + 1] += error;

				data[position] = 0;
			} else {
				// Make white
				// The error is negative here because we"re shifting the value up
				var error = (data[position] - 255) / 16;

				data[position + 1] += error * 7;
				data[position + canvas.width - 1] += error * 3;
				data[position + canvas.width] += error * 5;
				data[position + canvas.width + 1] += error;

				data[position] = 255;
			}
		}
	}
}

// Moves to an "easier" array and makes everything grayscale
function makeGrayscale(container) {
	for (y = 0; y < canvas.height; y++) {
		for (x = 0; x < canvas.width; x++) {
			var row = y * canvas.width * 4;
			var column = x * 4;

			var position = row + column;

			var r = container.data[position + 0];
			var g = container.data[position + 1];
			var b = container.data[position + 2];
			var a = container.data[position + 3];

			// Take the average of the r, g, and b values to get grayscale
			var value = (r + g + b) / 3;
			// Save everything to a grayscale array
			database.push(value);
		}
	}
}

// Run after convert
function drawImageData(data, container) {
	convert(data, container);
	// Put pixel data on canvas
	ctx.putImageData(container, 0, 0);
}

function convert(data, container) {
	// Convert back from a simpler array to the more complex array required by imageData
	for (var i = 0; i < data.length; i++) {
		// Converts our database array back to rgb form in only grayscale
		container.data[i * 4 + 0] = data[i];
		container.data[i * 4 + 1] = data[i];
		container.data[i * 4 + 2] = data[i];
		// No transparency
		container.data[i * 4 + 3] = 255;
	}
}

function exportImage() {
	var download = document.createElement("a");
	download.href = canvas.toDataURL("images/png");
	download.download = "dither.png";
	download.click();
}
