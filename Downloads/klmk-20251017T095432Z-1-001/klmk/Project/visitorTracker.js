class VisitorTracker {
    constructor() {
        this.initializeCounter();
        this.trackVisit();
    }

    async initializeCounter() {
        try {
            const response = await fetch('/api/visitors/count');
            const data = await response.json();
            this.updateCounterDisplay(data.totalVisitors, data.currentVisitorNumber);
        } catch (error) {
            console.error('Error initializing counter:', error);
        }
    }

    setupWebSocket() {
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'visitor_update') {
                this.updateCounter(data.count);
            }
        };
    }

    updateCounter(count) {
        const counterElement = document.getElementById('visitor-count');
        if (counterElement) {
            counterElement.textContent = count;
            
            // Add animation
            counterElement.classList.add('pulse');
            setTimeout(() => counterElement.classList.remove('pulse'), 1000);
        }
    }

    async trackVisit() {
        try {
            const response = await fetch('/api/visitors/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date(),
                    page: window.location.pathname
                })
            });
            
            if (!response.ok) throw new Error('Failed to track visit');
            
        } catch (error) {
            console.error('Visitor tracking error:', error);
        }
    }
}
