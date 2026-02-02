const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
const outputCsv = document.getElementById('outputCsv');
const preview = document.getElementById('preview');

const copyButton = document.getElementById('copy-button');
const thresholdInput = document.getElementById('threshold-input');

let threshold = thresholdInput.value
let updateConversionFn = null

thresholdInput.addEventListener('change', (e) => {
	threshold = e.target.value
	if (updateConversionFn != null) {
		updateConversionFn()
	}
});

upload.addEventListener('change', (e) => {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (event) => {
		const img = new Image();
		img.onload = () => {
			// Show preview
			preview.src = event.target.result;
			preview.style.display = 'block';

			// Draw image to 10x10 canvas (browser handles downscaling)
			ctx.clearRect(0, 0, 10, 10);
			ctx.drawImage(img, 0, 0, 10, 10);

			updateConversionFn = function() {
				// Analyze pixels
				const imageData = ctx.getImageData(0, 0, 10, 10).data;

				let binaryArray = []

				let binaryTable = Array(10)
				let binaryRow = []

				for (let i = 0; i < imageData.length; i += 4) {
					const cellIndex = (i / 4);

					const r = imageData[i];
					const g = imageData[i + 1];
					const b = imageData[i + 2];

					// Simple grayscale conversion (Brightness)
					const brightness = (r + g + b) / 3;

					// 200 is the middle of 0-255. 
					// Below threshold is "dark" (1), above is "light" (0)
					const binValue = brightness < threshold ? "1" : "0";
					binaryArray.push(binValue)
					binaryRow.push(binValue)

					if (cellIndex % 10 === 9) {
						let rowIndex = (cellIndex / 10) | 0
						binaryTable[rowIndex] = binaryRow.join(" ")
						binaryRow.length = 0
					}
				}

				output.textContent = binaryTable.join("\n");
				outputCsv.textContent = binaryArray.join(", ");
			};

			updateConversionFn()
		};
		img.src = event.target.result;
	};
	reader.readAsDataURL(file);
});

copyButton.addEventListener('click', (e) => {
	navigator.clipboard.writeText(outputCsv.textContent)
})
