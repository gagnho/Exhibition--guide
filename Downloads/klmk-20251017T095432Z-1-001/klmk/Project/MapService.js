const Project = require('../models/Project');

class MapService {
    static async saveProjectLocation(projectId, location) {
        try {
            const project = await Project.findByIdAndUpdate(projectId, {
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    description: location.description
                }
            }, { new: true });
            return project;
        } catch (error) {
            throw new Error('Error saving project location');
        }
    }

    static async getProjectLocations() {
        try {
            const projects = await Project.find({}, 'title location');
            return projects;
        } catch (error) {
            throw new Error('Error fetching project locations');
        }
    }
}

module.exports = MapService;
