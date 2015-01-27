var originalCanvas = document.getElementById('original')
var originalCtx = originalCanvas.getContext('2d')

var canvas = document.getElementById('manipulated')
var ctx = canvas.getContext('2d')

var database = new Array()

function load()
{
	database = new Array() // Start fresh so we can load another image without refreshing the page

	var image = new Image() // This is what we'll pass along to other functions

	var file = document.getElementById('load').files[0]
	var reader = new FileReader()

	reader.onloadend = function()
	{
		image.src = reader.result
		
		loaded(image)
	}

	if (file)
	{
		reader.readAsDataURL(file) // Reads the data as a URL
	}
}

function loaded(image)
{
	// Resize the canvases to reflect the size of the source image
	originalCanvas.width = image.width
	originalCanvas.height = image.height
	canvas.width = image.width
	canvas.height = image.height
	canvas.style.top = image.height;

	originalCtx.drawImage(image, 0, 0) // Display the original image in the left canvas
	ctx.drawImage(image, 0, 0) // Display the original image in the right canvas for manipulation and display

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height) // Get pixel data for the whole canvas

	floydSteinberg(database, imageData)
	drawImageData(database, imageData)
}

function floydSteinberg(data, container)
{
	makeGrayscale(container)

	for (var y = 0; y < canvas.height; y++)
	{
		for (var x = 0; x < canvas.width; x++)
		{
			var position = y * canvas.width + x // We don't need to modify by 4 in our own database

			var cutoff = 255 / 2

			if (data[position] < cutoff) // Make black
			{
				var error = data[position] / 16

				data[position + 1] += error * 7
				data[position + canvas.width - 1] += error * 3
				data[position + canvas.width] += error * 5
				data[position + canvas.width + 1] += error

				data[position] = 0
			}
			else // Make white
			{
				var error = (data[position] - 255) / 16 // The error is negative here because we're shifting the value up

				data[position + 1] += error * 7
				data[position + canvas.width - 1] += error * 3
				data[position + canvas.width] += error * 5
				data[position + canvas.width + 1] += error

				data[position] = 255
			}
		}
	}
}

	function makeGrayscale(container) // Moves to an "easier" array and makes everything grayscale
	{
		for (y = 0; y < canvas.height; y++)
		{
			for (x = 0; x < canvas.width; x++)
			{
				var row = y * canvas.width * 4
				var column = x * 4

				var position = row + column

				var r = container.data[position + 0]
				var g = container.data[position + 1]
				var b = container.data[position + 2]
				var a = container.data[position + 3]

				var value = (r + g + b) / 3 // Take the average of the r, g, and b values to get grayscale
				database.push(value) // Save everything to a grayscale array
			}
		}
	}

function drawImageData(data, container) // Run after convert
{
	convert(data, container)

	ctx.putImageData(container, 0, 0) // Put pixel data on canvas
}

	function convert(data, container)
	{
		for (var i = 0; i < data.length; i++) // Convert back from a simpler array to the more complex array required by imageData
		{
			// Converts our database array back to rgb form in only grayscale
			container.data[i * 4 + 0] = data[i]
			container.data[i * 4 + 1] = data[i]
			container.data[i * 4 + 2] = data[i]
			container.data[i * 4 + 3] = 255 // No transparency
		}
	}

function exportImage()
{
	var download = document.createElement('a')
		download.href = canvas.toDataURL('images/png')
		download.download = 'dither.png'
		download.click()
}