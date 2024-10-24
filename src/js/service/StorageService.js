// src/js/services/StorageService.js
export class StorageService {
    static async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (result) => {
                resolve(result[key]);
            });
        });
    }

    static async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, resolve);
        });
    }

    static async remove(key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, resolve);
        });
    }

    static async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(resolve);
        });
    }

    static async getAllRequirements() {
        const requirements = await this.get('requirements');
        return requirements || [];
    }

    static async saveRequirement(requirement) {
        const requirements = await this.getAllRequirements();
        requirements.push(requirement);
        await this.set('requirements', requirements);
        return requirement;
    }

    static async deleteRequirement(requirementId) {
        const requirements = await this.getAllRequirements();
        const updatedRequirements = requirements.filter(req => req.id !== requirementId);
        await this.set('requirements', updatedRequirements);
    }
}