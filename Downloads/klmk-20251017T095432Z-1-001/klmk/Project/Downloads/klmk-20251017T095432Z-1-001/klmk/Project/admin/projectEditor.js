let map;
let marker;
const schoolLocation = [28.5776667, 77.0718707];

function initializeMap() {
    map = L.map('map').setView(schoolLocation, 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    map.on('click', (e) => {
        if (marker) map.removeLayer(marker);
        marker = L.marker(e.latlng).addTo(map);
        document.getElementById('project-location').value = JSON.stringify(e.latlng);
    });
}

async function saveProject(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Project saved successfully!');
            window.location.reload();
        }
    } catch (error) {
        alert('Error saving project: ' + error.message);
    }
}
