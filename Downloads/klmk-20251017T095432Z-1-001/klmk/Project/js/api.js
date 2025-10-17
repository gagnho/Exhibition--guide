// API endpoints
const API_BASE_URL = '/.netlify/functions/api';

// Visitor tracking
async function trackVisitor() {
    try {
        const response = await fetch(`${API_BASE_URL}/visitors/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success) {
            updateVisitorCounter(data.visitorNumber);
        }
    } catch (error) {
        console.error('Error tracking visitor:', error);
    }
}

// Update visitor counter display
function updateVisitorCounter(number) {
    const counterElement = document.getElementById('visitor-number');
    if (counterElement) {
        counterElement.textContent = number;
    }
}

// Get total visitors
async function getTotalVisitors() {
    try {
        const response = await fetch(`${API_BASE_URL}/visitors/count`);
        const data = await response.json();
        const totalElement = document.getElementById('visitor-count');
        if (totalElement) {
            totalElement.textContent = data.totalVisitors;
        }
    } catch (error) {
        console.error('Error getting visitor count:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    trackVisitor();
    getTotalVisitors();
});