// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
    }
}

// Initialize Analytics
function initializeAnalytics() {
    const ctx = document.getElementById('visitorChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLastSevenDays(),
            datasets: [{
                label: 'Daily Visitors',
                data: [12, 19, 15, 25, 22, 30, 28],
                borderColor: '#4A90E2',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Visitor Trends'
                }
            }
        }
    });
}

// Handle Image Upload
function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            preview.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
}

// Save Project with Images
async function saveProject(formData) {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            showNotification('Project saved successfully!');
        }
    } catch (error) {
        showNotification('Error saving project', 'error');
    }
}

// Update Analytics Data
async function updateAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        document.getElementById('total-visitors').textContent = data.totalVisitors;
        document.getElementById('active-projects').textContent = data.activeProjects;
        document.getElementById('avg-duration').textContent = `${data.avgDuration} mins`;
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
}

// Utility Functions
function getLastSevenDays() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeAnalytics();
    updateAnalytics();
    
    const imageInput = document.querySelector('input[type="file"]');
    imageInput?.addEventListener('change', handleImageUpload);
    
    document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await saveProject(formData);
    });
});
