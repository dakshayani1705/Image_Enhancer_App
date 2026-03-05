/**
 * Image Enhancer App - Image Processing Script
 * Beginner-friendly JavaScript using FileReader, Canvas, and Cropper.js
 */

// --- Global Variables ---
let cropper = null; // Instance of Cropper.js
let isGrayscale = false; // Flag for grayscale filter
let currentScale = 1.0; // Scale factor (1.0 = 100%)
let brightness = 100; // 100% is normal
let contrast = 100; // 100% is normal
let originalDataUrl = ""; // To store the very first upload for reset

// --- DOM Elements ---
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const imagePreview = document.getElementById('imagePreview');
const editorContainer = document.getElementById('editorContainer');
const cropBtn = document.getElementById('cropBtn');
const rotateBtn = document.getElementById('rotateBtn');
const resetBtn = document.getElementById('resetBtn');

const resizeSlider = document.getElementById('resizeSlider');
const resizeValue = document.getElementById('resizeValue');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
const contrastSlider = document.getElementById('contrastSlider');
const contrastValue = document.getElementById('contrastValue');

const grayscaleBtn = document.getElementById('grayscaleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const processCanvas = document.getElementById('processCanvas');

// --- 1. Image Upload Logic ---

uploadBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalDataUrl = e.target.result;
            imagePreview.src = originalDataUrl;
            resetState();
            editorContainer.classList.remove('hidden');
            initCropper();
        };
        reader.readAsDataURL(file);
    }
});

// --- 2. Cropper.js Initialization ---

function initCropper() {
    if (cropper) {
        cropper.destroy();
    }
    cropper = new Cropper(imagePreview, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 0.8,
        responsive: true,
        background: false,
    });
}

// --- 3. Crop & Rotate Features ---

cropBtn.addEventListener('click', () => {
    if (!cropper) return;
    const croppedCanvas = cropper.getCroppedCanvas();
    imagePreview.src = croppedCanvas.toDataURL();
    setTimeout(() => initCropper(), 50);
});

rotateBtn.addEventListener('click', () => {
    if (cropper) {
        cropper.rotate(90);
    }
});

// --- 4. Sliders (Resize, Brightness, Contrast) ---

function updateVisualFilters() {
    const imageBox = document.querySelector('.image-box');
    const grayFilter = isGrayscale ? 'grayscale(100%)' : 'grayscale(0%)';
    const brightFilter = `brightness(${brightness}%)`;
    const contrastFilter = `contrast(${contrast}%)`;
    
    // Apply visual filters to the container
    imageBox.style.filter = `${grayFilter} ${brightFilter} ${contrastFilter}`;
    imageBox.style.transform = `scale(${currentScale})`;
}

resizeSlider.addEventListener('input', (e) => {
    currentScale = e.target.value / 100;
    resizeValue.innerText = `${e.target.value}%`;
    updateVisualFilters();
});

brightnessSlider.addEventListener('input', (e) => {
    brightness = e.target.value;
    brightnessValue.innerText = `${brightness}%`;
    updateVisualFilters();
});

contrastSlider.addEventListener('input', (e) => {
    contrast = e.target.value;
    contrastValue.innerText = `${contrast}%`;
    updateVisualFilters();
});

// --- 5. Grayscale & Reset ---

grayscaleBtn.addEventListener('click', () => {
    isGrayscale = !isGrayscale;
    grayscaleBtn.classList.toggle('primary', isGrayscale);
    grayscaleBtn.innerText = isGrayscale ? "Grayscale: ON" : "Toggle Grayscale";
    updateVisualFilters();
});

function resetState() {
    isGrayscale = false;
    currentScale = 1.0;
    brightness = 100;
    contrast = 100;
    
    resizeSlider.value = 100;
    resizeValue.innerText = "100%";
    brightnessSlider.value = 100;
    brightnessValue.innerText = "100%";
    contrastSlider.value = 100;
    contrastValue.innerText = "100%";
    
    grayscaleBtn.classList.remove('primary');
    grayscaleBtn.innerText = "Toggle Grayscale";
    
    updateVisualFilters();
}

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset all changes?")) {
        imagePreview.src = originalDataUrl;
        resetState();
        setTimeout(() => initCropper(), 50);
    }
});

// --- 6. Download Feature (Canvas API) ---

downloadBtn.addEventListener('click', () => {
    let sourceCanvas;
    if (cropper) {
        sourceCanvas = cropper.getCroppedCanvas();
    } else {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imagePreview.naturalWidth;
        tempCanvas.height = imagePreview.naturalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(imagePreview, 0, 0);
        sourceCanvas = tempCanvas;
    }
    
    const ctx = processCanvas.getContext('2d');
    const newWidth = sourceCanvas.width * currentScale;
    const newHeight = sourceCanvas.height * currentScale;
    
    processCanvas.width = newWidth;
    processCanvas.height = newHeight;
    
    // Draw and Resize
    ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);
    
    // Apply Filters (Brightness, Contrast, Grayscale)
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const data = imageData.data;
    
    const bFactor = brightness / 100;
    const cFactor = (contrast / 100);
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // 1. Brightness
        r *= bFactor;
        g *= bFactor;
        b *= bFactor;
        
        // 2. Contrast
        r = ((r / 255 - 0.5) * cFactor + 0.5) * 255;
        g = ((g / 255 - 0.5) * cFactor + 0.5) * 255;
        b = ((b / 255 - 0.5) * cFactor + 0.5) * 255;
        
        // 3. Grayscale
        if (isGrayscale) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = g = b = gray;
        }
        
        // Clamp values
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const link = document.createElement('a');
    link.download = `enhanced-image-${Date.now()}.png`;
    link.href = processCanvas.toDataURL('image/png');
    link.click();
});