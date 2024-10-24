// src/js/components/WindowManager.js
import { helpers } from '../utils/helpers.js';
import { RequirementService } from '../services/RequirementService.js';

export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndex = 1000;
        this.snapThreshold = 20; // pixels for window snapping
        this.minWidth = 300;
        this.minHeight = 200;
    }

    createWindow(options = {}) {
        const windowId = helpers.generateId('window-');
        const windowEl = document.createElement('div');
        windowEl.className = 'resizable-window';
        windowEl.id = windowId;

        // Create window structure
        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">${options.title || 'Market Marker'}</div>
                <div class="window-controls">
                    <button class="minimize-btn" title="Minimize">−</button>
                    <button class="maximize-btn" title="Maximize">□</button>
                    <button class="close-btn" title="Close">×</button>
                </div>
            </div>
            <div class="window-content">
                <div class="content-area">${options.content || ''}</div>
            </div>
            <div class="resize-handle resize-handle-n" data-direction="n"></div>
            <div class="resize-handle resize-handle-e" data-direction="e"></div>
            <div class="resize-handle resize-handle-s" data-direction="s"></div>
            <div class="resize-handle resize-handle-w" data-direction="w"></div>
            <div class="resize-handle resize-handle-ne" data-direction="ne"></div>
            <div class="resize-handle resize-handle-se" data-direction="se"></div>
            <div class="resize-handle resize-handle-sw" data-direction="sw"></div>
            <div class="resize-handle resize-handle-nw" data-direction="nw"></div>
        `;

        // Set initial position
        const pos = this.getInitialPosition();
        Object.assign(windowEl.style, {
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${options.width || 600}px`,
            height: `${options.height || 400}px`,
            zIndex: this.zIndex++
        });

        document.body.appendChild(windowEl);

        this.windows.set(windowId, {
            element: windowEl,
            state: 'normal',
            previousState: null,
            position: pos,
            size: {
                width: options.width || 600,
                height: options.height || 400
            }
        });

        this.initializeWindow(windowEl);
        this.activateWindow(windowId);

        return windowId;
    }

    initializeWindow(windowEl) {
        this.initializeDrag(windowEl);
        this.initializeResize(windowEl);
        this.initializeControls(windowEl);
        this.initializeContentRefresh(windowEl);
    }

    initializeDrag(windowEl) {
        const header = windowEl.querySelector('.window-header');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        const dragStart = (e) => {
            if (e.target.closest('.window-controls')) return;
            isDragging = true;
            initialX = e.clientX - windowEl.offsetLeft;
            initialY = e.clientY - windowEl.offsetTop;
            windowEl.style.zIndex = this.zIndex++;
        };

        const dragMove = helpers.throttle((e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Apply window snapping
            if (currentX < this.snapThreshold) currentX = 0;
            if (currentY < this.snapThreshold) currentY = 0;
            if (window.innerWidth - (currentX + windowEl.offsetWidth) < this.snapThreshold) {
                currentX = window.innerWidth - windowEl.offsetWidth;
            }

            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        }, 16); // ~60fps

        const dragEnd = () => {
            isDragging = false;
        };

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }

    initializeResize(windowEl) {
        const handles = windowEl.querySelectorAll('.resize-handle');
        handles.forEach(handle => {
            let isResizing = false;
            let startWidth, startHeight, startX, startY;
            const direction = handle.dataset.direction;

            const resizeStart = (e) => {
                isResizing = true;
                startWidth = windowEl.offsetWidth;
                startHeight = windowEl.offsetHeight;
                startX = e.clientX;
                startY = e.clientY;
                windowEl.style.zIndex = this.zIndex++;
            };

            const resizeMove = helpers.throttle((e) => {
                if (!isResizing) return;

                e.preventDefault();
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newWidth = startWidth;
                let newHeight = startHeight;

                // Apply resize based on direction
                if (direction.includes('e')) newWidth = startWidth + dx;
                if (direction.includes('w')) newWidth = startWidth - dx;
                if (direction.includes('s')) newHeight = startHeight + dy;
                if (direction.includes('n')) newHeight = startHeight - dy;

                // Apply minimum dimensions
                newWidth = Math.max(this.minWidth, newWidth);
                newHeight = Math.max(this.minHeight, newHeight);

                windowEl.style.width = `${newWidth}px`;
                windowEl.style.height = `${newHeight}px`;
            }, 16);

            const resizeEnd = () => {
                isResizing = false;
            };

            handle.addEventListener('mousedown', resizeStart);
            document.addEventListener('mousemove', resizeMove);
            document.addEventListener('mouseup', resizeEnd);
        });
    }

    initializeControls(windowEl) {
        const windowId = windowEl.id;
        const controls = {
            minimize: windowEl.querySelector('.minimize-btn'),
            maximize: windowEl.querySelector('.maximize-btn'),
            close: windowEl.querySelector('.close-btn')
        };

        controls.minimize?.addEventListener('click', () => this.minimizeWindow(windowId));
        controls.maximize?.addEventListener('click', () => this.maximizeWindow(windowId));
        controls.close?.addEventListener('click', () => this.closeWindow(windowId));
    }

    initializeContentRefresh(windowEl) {
        // Refresh content when window is focused
        windowEl.addEventListener('click', async () => {
            const contentArea = windowEl.querySelector('.content-area');
            if (contentArea) {
                const requirements = await RequirementService.getAllRequirements();
                // Update content based on requirements
                // This would need to be customized based on your needs
            }
        });
    }

    activateWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        this.activeWindow = windowId;
        windowData.element.style.zIndex = this.zIndex++;
    }

    getInitialPosition() {
        const offset = this.windows.size * 30;
        return {
            x: Math.min(offset + 50, window.innerWidth - 400),
            y: Math.min(offset + 50, window.innerHeight - 300)
        };
    }

    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (windowData.state === 'minimized') {
            windowData.element.style.display = 'block';
            windowData.state = windowData.previousState || 'normal';
        } else {
            windowData.previousState = windowData.state;
            windowData.element.style.display = 'none';
            windowData.state = 'minimized';
        }
    }

    maximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (windowData.state === 'maximized') {
            // Restore previous position and size
            Object.assign(windowData.element.style, {
                top: `${windowData.position.y}px`,
                left: `${windowData.position.x}px`,
                width: `${windowData.size.width}px`,
                height: `${windowData.size.height}px`
            });
            windowData.state = 'normal';
        } else {
            // Save current position and size
            windowData.position = {
                x: windowData.element.offsetLeft,
                y: windowData.element.offsetTop
            };
            windowData.size = {
                width: windowData.element.offsetWidth,
                height: windowData.element.offsetHeight
            };
            // Maximize
            Object.assign(windowData.element.style, {
                top: '0',
                left: '0',
                width: '100%',
                height: '100%'
            });
            windowData.state = 'maximized';
        }
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        windowData.element.remove();
        this.windows.delete(windowId);
    }
}