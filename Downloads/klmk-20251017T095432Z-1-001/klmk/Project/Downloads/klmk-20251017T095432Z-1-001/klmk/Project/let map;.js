let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    setupFormHandlers();
});

function initializeMap() {
    map = L.map('map').setView([28.5776667, 77.0718707], 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    map.on('click', (e) => {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
    });
}

function setupFormHandlers() {
    const form = document.getElementById('projectForm');
    const imageInput = document.getElementById('images');
    
    imageInput.addEventListener('change', handleImagePreview);
    form.addEventListener('submit', handleProjectSubmit);
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('supervisor', document.getElementById('supervisor').value);
    formData.append('description', document.getElementById('description').value);
    
    if (marker) {
        formData.append('location', JSON.stringify({
            lat: marker.getLatLng().lat,
            lng: marker.getLatLng().lng
        }));
    }
    
    const images = document.getElementById('images').files;
    for (let image of images) {
        formData.append('images', image);
    }
    
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Project saved successfully!');
        } else {
            throw new Error('Failed to save project');
        }
    } catch (error) {
        alert('Error saving project: ' + error.message);
    }
}

function handleImagePreview(e) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    for (let file of e.target.files) {
        const img = document.createElement('img');
        img.classList.add('image-preview');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    }
}
