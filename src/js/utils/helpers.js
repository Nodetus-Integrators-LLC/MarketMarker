// src/js/utils/helpers.js
export const helpers = {
    // DOM Helpers
    nextFrame(callback) {
        requestAnimationFrame(() => requestAnimationFrame(callback));
    },

    // Creates a debounced function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Creates a throttled function
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Format date to locale string
    formatDate(date) {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Generate unique ID
    generateId(prefix = '') {
        return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Deep clone an object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Safely get nested object properties
    get(obj, path, defaultValue = undefined) {
        const travel = (regexp) =>
            String.prototype.split
                .call(path, regexp)
                .filter(Boolean)
                .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
        const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
        return result === undefined || result === obj ? defaultValue : result;
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Error handling wrapper
    async errorHandler(callback) {
        try {
            return await callback();
        } catch (error) {
            console.error('Operation failed:', error);
            throw error;
        }
    }
};