// src/js/components/Modal.js
import { validators } from '../utils/validators.js';
import { helpers } from '../utils/helpers.js';

export class Modal {
    constructor(id, options = {}) {
        this.id = id;
        this.modal = document.getElementById(id);
        this.options = {
            closeOnEscape: true,
            closeOnOutsideClick: true,
            onOpen: () => { },
            onClose: () => { },
            ...options
        };

        this.isOpen = false;
        this.form = this.modal?.querySelector('form');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close button event
        const closeBtn = this.modal?.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Outside click event
        if (this.options.closeOnOutsideClick) {
            this.modal?.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Escape key event
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    open() {
        if (!this.modal) return;

        this.modal.style.display = 'block';
        this.isOpen = true;
        this.options.onOpen();

        // Focus first input if it exists
        const firstInput = this.modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }

        // Add class for animation
        helpers.nextFrame(() => {
            this.modal.classList.add('modal-open');
        });
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('modal-open');
        this.isOpen = false;

        // Wait for animation to complete
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.options.onClose();
            this.resetForm();
        }, 300); // Match CSS animation duration
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            // Clear validation states
            const fields = this.form.querySelectorAll('.error');
            fields.forEach(field => field.classList.remove('error'));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.form) return;

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Validate form data
        const validationResult = await this.validateForm(data);

        if (validationResult.isValid) {
            if (this.options.onSubmit) {
                await this.options.onSubmit(data);
            }
            this.close();
        } else {
            this.showErrors(validationResult.errors);
        }
    }

    async validateForm(data) {
        if (!validators.requirementSchema) return { isValid: true };

        try {
            await validators.requirementSchema.validate(data, { abortEarly: false });
            return { isValid: true };
        } catch (errors) {
            return {
                isValid: false,
                errors: errors.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {})
            };
        }
    }

    showErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const element = this.form?.querySelector(`[name="${field}"]`);
            if (element) {
                element.classList.add('error');

                // Add or update error message
                let errorDiv = element.nextElementSibling;
                if (!errorDiv || !errorDiv.classList.contains('error-message')) {
                    errorDiv = document.createElement('div');
                    errorDiv.classList.add('error-message');
                    element.parentNode.insertBefore(errorDiv, element.nextSibling);
                }
                errorDiv.textContent = message;
            }
        });
    }

    setContent(content) {
        const contentContainer = this.modal?.querySelector('.modal-content');
        if (contentContainer) {
            contentContainer.innerHTML = content;
        }
    }
}