// @ts-check
/** @type {module} */

import { RequirementService } from './services/RequirementService.js';
import { RequirementCard } from './components/RequirementCard.js';
import { Modal } from './components/Modal.js';
import { WindowManager } from './components/WindowManager.js';
import { helpers } from './utils/helpers.js';
import { validators } from './utils/validators.js';
class App {
    constructor() {
        this.windowManager = new WindowManager();
        this.modal = new Modal('new-requirement-modal', {
            onSubmit: this.handleRequirementSubmit.bind(this),
            closeOnEscape: true,
            closeOnOutsideClick: true
        });

        this.requirementsList = document.getElementById('requirements-list');
        this.requirements = [];
        this.loadingState = false;

        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.loadRequirements = helpers.debounce(this.loadRequirements.bind(this), 300);

        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadRequirements();
        } catch (error) {
            this.handleError(error);
        }
    }

    setupEventListeners() {
        // Add requirement button
        const addButton = document.getElementById('add-requirement-btn');
        if (addButton) {
            addButton.addEventListener('click', () => this.modal.open());
        }

        // New window button
        const newWindowBtn = document.getElementById('new-window-btn');
        if (newWindowBtn) {
            newWindowBtn.addEventListener('click', () => {
                this.windowManager.createWindow({
                    title: 'Market Research',
                    content: this.requirementsList?.innerHTML || '',
                    width: 800,
                    height: 600
                });
            });
        }

        // Global error handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    async handleRequirementSubmit(formData) {
        try {
            if (this.loadingState) return;
            this.loadingState = true;

            const requirement = this.createRequirementFromForm(formData);
            const validationResult = validators.validateRequirementTitle(requirement.title);

            if (!validationResult.isValid) {
                throw new Error(validationResult.message);
            }

            await RequirementService.createRequirement(requirement);
            await this.loadRequirements();

            // Show success message
            this.showNotification('Requirement created successfully', 'success');

        } catch (error) {
            this.handleError(error);
        } finally {
            this.loadingState = false;
        }
    }

    async loadRequirements() {
        try {
            if (this.loadingState) return;
            this.loadingState = true;

            this.requirements = await RequirementService.getAllRequirements();
            await this.renderRequirements();

        } catch (error) {
            this.handleError(error);
        } finally {
            this.loadingState = false;
        }
    }

    async renderRequirements() {
        if (!this.requirementsList) return;

        this.requirementsList.innerHTML = '';

        if (this.requirements.length === 0) {
            this.requirementsList.innerHTML = `
                <div class="no-requirements">
                    <p>No requirements found. Click the + button to add one.</p>
                </div>
            `;
            return;
        }

        this.requirements
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(requirement => {
                const card = new RequirementCard(
                    requirement,
                    this.handleRequirementDelete.bind(this)
                );
                this.requirementsList.appendChild(card.createElement());
            });
    }

    async handleRequirementDelete(id) {
        try {
            await RequirementService.deleteRequirement(id);
            await this.loadRequirements();
            this.showNotification('Requirement deleted successfully', 'success');
        } catch (error) {
            this.handleError(error);
        }
    }

    createRequirementFromForm(formData) {
        return {
            title: formData.get('title'),
            priority: formData.get('priority'),
            sector: formData.get('sector'),
            productType: formData.get('productType'),
            region: formData.get('region'),
            priceRange: formData.get('priceRange'),
            setAside: formData.get('setAside'),
            createdAt: new Date().toISOString()
        };
    }

    handleError(error) {
        console.error('Application Error:', error);
        this.showNotification(
            error.message || 'An unexpected error occurred',
            'error'
        );
    }

    showNotification(message, type = 'info') {
        // Implementation depends on your UI requirements
        // Could use a toast notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});