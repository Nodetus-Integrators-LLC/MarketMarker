// src/js/utils/validators.js
export const validators = {
    // Validation schemas
    requirementSchema: {
        validate: async (data, options = {}) => {
            const errors = [];

            // Required fields
            const requiredFields = [
                'title',
                'priority',
                'sector',
                'productType',
                'region',
                'priceRange',
                'setAside'
            ];

            requiredFields.forEach(field => {
                if (!data[field] || data[field].trim() === '') {
                    errors.push({
                        path: field,
                        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
                    });
                }
            });

            // Title validation
            if (data.title && data.title.length < 3) {
                errors.push({
                    path: 'title',
                    message: 'Title must be at least 3 characters long'
                });
            }

            // Priority validation
            const validPriorities = ['high', 'medium', 'low'];
            if (data.priority && !validPriorities.includes(data.priority.toLowerCase())) {
                errors.push({
                    path: 'priority',
                    message: 'Invalid priority level'
                });
            }

            if (errors.length > 0) {
                throw { inner: errors };
            }

            return true;
        }
    },

    // Common validation functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    isValidPrice(price) {
        return !isNaN(price) && parseFloat(price) >= 0;
    },

    isValidDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    },

    // Custom validation rules
    validateRequirementTitle(title) {
        const minLength = 3;
        const maxLength = 100;

        if (!title || typeof title !== 'string') {
            return { isValid: false, message: 'Title is required' };
        }

        if (title.length < minLength) {
            return { isValid: false, message: `Title must be at least ${minLength} characters` };
        }

        if (title.length > maxLength) {
            return { isValid: false, message: `Title must not exceed ${maxLength} characters` };
        }

        return { isValid: true };
    },

    validatePriceRange(range) {
        const validRanges = [
            'Under $5,000',
            '$5,000 - $10,000',
            '$10,000 - $50,000',
            '$50,000 - $100,000',
            'Over $100,000'
        ];

        return {
            isValid: validRanges.includes(range),
            message: 'Invalid price range selected'
        };
    },

    validateSetAside(setAside) {
        const validSetAsides = [
            'Small Business',
            '8(a)',
            'HUBZone',
            'Service-Disabled Veteran-Owned',
            'Woman-Owned',
            'Not Set Aside'
        ];

        return {
            isValid: validSetAsides.includes(setAside),
            message: 'Invalid set-aside status selected'
        };
    }
};