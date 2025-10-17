class VisitorRanking {
    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            const response = await fetch('/api/visitors/stats');
            const data = await response.json();
            this.updateDisplay(data);
        } catch (error) {
            console.error('Error fetching visitor stats:', error);
        }
    }

    updateDisplay(data) {
        const counterElement = document.createElement('div');
        counterElement.className = 'visitor-counter';
        counterElement.innerHTML = `
            <div class="visitor-count">
                Total Visitors: ${data.totalVisitors}
            </div>
            <div class="visitor-rank">
                You are visitor #${data.currentVisitorNumber}
            </div>
        `;

        document.body.appendChild(counterElement);
    }

    async recordVisit() {
        try {
            const response = await fetch('/api/visitors/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: new Date(),
                    userAgent: navigator.userAgent
                })
            });

            const data = await response.json();
            this.updateDisplay(data);
        } catch (error) {
            console.error('Error recording visit:', error);
        }
    }
}

// Initialize visitor ranking
const visitorRanking = new VisitorRanking();