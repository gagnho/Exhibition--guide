class ExitTracker {
    constructor() {
        this.geofence = {
            lat: 28.5776667,
            lng: 77.0718707,
            radius: 50 // meters
        };
        this.startTime = new Date();
    }

    watchLocation() {
        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                position => this.checkExit(position),
                error => console.error('Location error:', error),
                { enableHighAccuracy: true }
            );
        }
    }

    checkExit(position) {
        const distance = this.calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            this.geofence.lat,
            this.geofence.lng
        );

        if (distance > this.geofence.radius) {
            this.handleExit();
        }
    }

    async handleExit() {
        const duration = Math.round((new Date() - this.startTime) / 60000); // minutes
        
        try {
            const response = await fetch('/api/visitors/exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    duration,
                    phoneNumber: localStorage.getItem('visitorPhone')
                })
            });

            if (response.ok) {
                window.location.href = '/exit-page.html';
            }
        } catch (error) {
            console.error('Exit tracking error:', error);
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula implementation
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

// Initialize exit tracking
const exitTracker = new ExitTracker();
exitTracker.watchLocation();
