// src/js/services/RequirementService.js
import { StorageService } from './StorageService.js';

export class RequirementService {
    // Creates a new requirement with proper formatting and metadata
    static async createRequirement(data) {
        // Add metadata and formatting to raw form data
        const requirement = {
            id: `req-${Date.now()}`,            // Unique identifier
            createdAt: new Date().toISOString(), // Creation timestamp
            status: 'active',                    // Initial status
            ...data,                            // Form data (title, priority, etc.)
            metadata: {
                version: '1.0',
                lastModified: new Date().toISOString(),
                tags: [],
                attachments: []
            }
        };

        // Save to storage and return the created requirement
        return await StorageService.saveRequirement(requirement);
    }

    // Retrieves all requirements with optional filtering
    static async getAllRequirements(filters = {}) {
        const requirements = await StorageService.getAllRequirements();

        // Apply filters if any
        if (Object.keys(filters).length > 0) {
            return requirements.filter(req => {
                return Object.entries(filters).every(([key, value]) =>
                    req[key] === value
                );
            });
        }

        return requirements;
    }

    // Updates an existing requirement
    static async updateRequirement(id, updates) {
        const requirements = await StorageService.getAllRequirements();
        const index = requirements.findIndex(req => req.id === id);

        if (index !== -1) {
            // Merge existing data with updates
            requirements[index] = {
                ...requirements[index],
                ...updates,
                metadata: {
                    ...requirements[index].metadata,
                    lastModified: new Date().toISOString(),
                    version: (parseFloat(requirements[index].metadata.version) + 0.1).toFixed(1)
                }
            };

            await StorageService.set('requirements', requirements);
            return requirements[index];
        }

        throw new Error('Requirement not found');
    }

    // Deletes a requirement
    static async deleteRequirement(id) {
        await StorageService.deleteRequirement(id);
    }

    // Archives a requirement instead of deleting it
    static async archiveRequirement(id) {
        return await this.updateRequirement(id, {
            status: 'archived',
            archivedAt: new Date().toISOString()
        });
    }

    // Search requirements by various criteria
    static async searchRequirements(query) {
        const requirements = await this.getAllRequirements();

        return requirements.filter(req => {
            const searchString = `
                ${req.title} 
                ${req.sector} 
                ${req.productType} 
                ${req.region} 
                ${req.setAside}
            `.toLowerCase();

            return searchString.includes(query.toLowerCase());
        });
    }

    // Get requirements statistics
    static async getStatistics() {
        const requirements = await this.getAllRequirements();

        return {
            total: requirements.length,
            byPriority: {
                high: requirements.filter(r => r.priority === 'high').length,
                medium: requirements.filter(r => r.priority === 'medium').length,
                low: requirements.filter(r => r.priority === 'low').length
            },
            bySector: requirements.reduce((acc, req) => {
                acc[req.sector] = (acc[req.sector] || 0) + 1;
                return acc;
            }, {}),
            byStatus: {
                active: requirements.filter(r => r.status === 'active').length,
                archived: requirements.filter(r => r.status === 'archived').length
            }
        };
    }
}