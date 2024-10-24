import { helpers } from '../utils/helpers.js';

export class RequirementCard {
    constructor(requirement, onDelete) {
        this.requirement = requirement;
        this.onDelete = onDelete;
        this.template = document.getElementById('requirement-card-template');
    }

    createElement() {
        if (!this.template) {
            throw new Error('Requirement card template not found');
        }

        // Clone the template
        const clone = document.importNode(this.template.content, true);
        const card = clone.querySelector('.requirement-card');

        // Replace template variables with actual data
        this.populateTemplate(card);
        this.attachEventListeners(card);

        return card;
    }

    populateTemplate(element) {
        const replaceVariables = (text) => {
            return text.replace(/\${(\w+)}/g, (match, variable) => {
                return this.requirement[variable] || '';
            });
        };

        // Replace text content in all elements
        element.querySelectorAll('*').forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                el.textContent = replaceVariables(el.textContent || '');
            }
        });

        // Set data attributes
        element.setAttribute('data-id', this.requirement.id);
        element.classList.add(`priority-${this.requirement.priority.toLowerCase()}`);
    }

    attachEventListeners(card) {
        // Toggle details
        const toggleBtn = card.querySelector('.toggle-btn');
        const details = card.querySelector('.card-details');

        toggleBtn?.addEventListener('click', () => {
            details?.classList.toggle('hidden');
            const icon = toggleBtn.querySelector('.icon');
            if (icon) {
                icon.textContent = details?.classList.contains('hidden') ? '▼' : '▲';
            }
        });

        // Delete button
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (await this.confirmDelete()) {
                this.onDelete?.(this.requirement.id);
            }
        });

        // Edit button
        const editBtn = card.querySelector('.edit-btn');
        editBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editRequirement();
        });

        // Action buttons
        card.querySelectorAll('.requirement-actions button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.textContent?.trim().toLowerCase();
                this.handleAction(action);
            });
        });
    }

    async confirmDelete() {
        return confirm('Are you sure you want to delete this requirement?');
    }

    editRequirement() {
        // Implementation for editing requirement
        console.log('Edit requirement:', this.requirement.id);
    }

    handleAction(action) {
        switch (action) {
            case 'view details':
                // Implementation for viewing details
                break;
            case 'add research':
                // Implementation for adding research
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }
}