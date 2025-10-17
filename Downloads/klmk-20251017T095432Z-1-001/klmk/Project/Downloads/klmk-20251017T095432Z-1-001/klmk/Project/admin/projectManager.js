class ProjectManager {
    static async editProject(projectId, event) {
        event.stopPropagation();
        const project = await fetch(`/api/projects/${projectId}`).then(r => r.json());
        
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <form id="edit-project-form">
                <input type="text" name="title" value="${project.title}" required>
                <input type="text" name="supervisor" value="${project.supervisor || ''}" placeholder="Supervisor Name">
                <textarea name="description">${project.description || ''}</textarea>
                <input type="file" name="images" multiple accept="image/*">
                <div id="current-images">
                    ${project.images?.map(img => `
                        <div class="image-container">
                            <img src="${img}" alt="Project Image">
                            <button type="button" onclick="removeImage('${img}')">Remove</button>
                        </div>
                    `).join('') || ''}
                </div>
                <div id="map"></div>
                <button type="submit">Save Changes</button>
            </form>
        `;
        
        document.body.appendChild(modal);
        initializeMap(project.location);
    }

    static async saveProject(formData) {
        const response = await fetch('/api/projects', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to save project');
        return response.json();
    }
}

// Export for use in other files
window.ProjectManager = ProjectManager;
