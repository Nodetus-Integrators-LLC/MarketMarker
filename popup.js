// Utility function for DOM element selection
function $(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id '${id}' not found`);
    }
    return element;
}

// Main function to set up the extension
function initializeExtension() {
    const createRequirementBtn = $('create-requirement');
    const requirementsList = $('requirements-list');
    let draggingElement = null;

    if (createRequirementBtn && requirementsList) {
        loadRequirements();
        createRequirementBtn.addEventListener('click', validateAndSaveNewRequirement);
    } else {
        console.error("Required elements not found");
    }

    // Function to load and display requirements
    function loadRequirements() {
        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            requirementsList.innerHTML = '';
            requirements.forEach((req, index) => {
                const card = createRequirementCard(req, index);
                requirementsList.appendChild(card);
            });
            setupDragAndDrop();
        });
    }

    // Function to create a requirement card
    function createRequirementCard(requirement, index) {
        const card = document.createElement('div');
        card.className = `requirement-card priority-${requirement.priority}`;
        card.draggable = true;
        card.dataset.index = index;
        card.innerHTML = `
        <div class="card-header">
            <h3>${requirement.id}: ${requirement.need}</h3>
            <button class="toggle-btn" aria-label="Expand details">▼</button>
        </div>
        <div class="card-details hidden">
            <p><strong>Priority:</strong> ${requirement.priority}</p>
            <p><strong>Market Sector:</strong> ${requirement.marketSector}</p>
            <p><strong>Product/Service Type:</strong> ${requirement.productServiceType}</p>
            <p><strong>Region:</strong> ${requirement.region}</p>
            <p><strong>Due Date:</strong> ${requirement.dueDate}</p>
            <p><strong>Price/Cost Estimate:</strong> ${requirement.priceEstimate}</p>
            <p><strong>Set-Aside:</strong> ${requirement.setAside}</p>
            <p><strong>NAICS Code:</strong> ${requirement.naicsCode}</p>
            ${requirement.gsaSchedule ? `<p><strong>GSA Schedule:</strong> ${requirement.gsaSchedule}</p>` : ''}
            ${requirement.commercialPractices ? `<p><strong>Commercial Practices:</strong> ${requirement.commercialPractices}</p>` : ''}
            ${requirement.qualityFactors ? `<p><strong>Quality Factors:</strong> ${requirement.qualityFactors}</p>` : ''}
            ${requirement.riskFactors ? `<p><strong>Risk Factors:</strong> ${requirement.riskFactors}</p>` : ''}
            ${requirement.additionalNotes ? `<p><strong>Additional Notes:</strong> ${requirement.additionalNotes}</p>` : ''}
        </div>
    `;

        const toggleBtn = card.querySelector('.toggle-btn');
        const cardDetails = card.querySelector('.card-details');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanding = cardDetails.classList.contains('hidden');
            cardDetails.classList.toggle('hidden');
            toggleBtn.textContent = isExpanding ? '▲' : '▼';
            toggleBtn.setAttribute('aria-label', isExpanding ? 'Collapse details' : 'Expand details');

            if (isExpanding) {
                if (!card.querySelector('.delete-btn')) {
                    const deleteBtn = createDeleteButton(index);
                    cardDetails.appendChild(deleteBtn);
                }
            } else {
                const deleteBtn = card.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.remove();
                }
                // Hide delete confirmation when collapsing
                const deleteConfirmation = card.querySelector('.delete-confirmation');
                if (deleteConfirmation) {
                    deleteConfirmation.remove();
                }
            }
        });

        return card;
    }

    function createDeleteButton(index) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-index', index);
        deleteBtn.setAttribute('aria-label', 'Delete requirement');
        deleteBtn.innerHTML = '<span class="delete-icon">×</span>';

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(index);
        });

        return deleteBtn;
    }

    function showDeleteConfirmation(index) {
        const card = document.querySelector(`.requirement-card[data-index="${index}"]`);
        let deleteConfirmation = card.querySelector('.delete-confirmation');

        if (!deleteConfirmation) {
            deleteConfirmation = document.createElement('div');
            deleteConfirmation.className = 'delete-confirmation';
            deleteConfirmation.innerHTML = `
            <input type="text" class="delete-confirmation-input" placeholder="Type 'DELETE THIS'">
            <button class="confirm-delete-btn">Confirm Delete</button>
        `;
            card.appendChild(deleteConfirmation);

            const confirmDeleteBtn = deleteConfirmation.querySelector('.confirm-delete-btn');
            const deleteConfirmationInput = deleteConfirmation.querySelector('.delete-confirmation-input');

            confirmDeleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (deleteConfirmationInput.value.trim() === 'DELETE THIS') {
                    deleteRequirement(index);
                } else {
                    alert('Please type "DELETE THIS" to confirm deletion.');
                }
            });
        }

        deleteConfirmation.classList.remove('hidden');
    }

    // Function to set up toggle functionality for a card
    function setupCardToggle(card) {
        const toggleBtn = card.querySelector('.toggle-btn');
        const cardHeader = card.querySelector('.card-header');
        const cardDetails = card.querySelector('.card-details');

        function toggleDetails(e) {
            e.stopPropagation();
            cardDetails.classList.toggle('hidden');
            toggleBtn.textContent = cardDetails.classList.contains('hidden') ? '▼' : '▲';
        }

        toggleBtn.addEventListener('click', toggleDetails);
        cardHeader.addEventListener('click', toggleDetails);
    }

    // Function to validate and save a new requirement
    function validateAndSaveNewRequirement() {
        const fields = [
            'requirement-id', 'requirement-need', 'priority', 'market-sector',
            'product-service-type', 'region', 'due-date', 'price-cost-estimate',
            'set-aside', 'naics-code'
        ];

        let isValid = true;

        fields.forEach(field => {
            const element = $(field);
            if (element && !element.value.trim()) {
                isValid = false;
                showError(element, 'This field is required.');
            } else if (element) {
                clearError(element);
            }
        });

        if (isValid) {
            saveNewRequirement();
        }
    }

    // Function to show error for invalid fields
    function showError(element, message) {
        element.classList.add('error');
        let errorElement = element.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            element.parentNode.insertBefore(errorElement, element.nextSibling);
        }
        errorElement.textContent = message;
        element.classList.add('vibrate');
        setTimeout(() => element.classList.remove('vibrate'), 300);
    }

    // Function to clear error for valid fields
    function clearError(element) {
        element.classList.remove('error');
        const errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
        }
    }

    // Function to save a new requirement
    function saveNewRequirement() {
        const newRequirement = {
            id: $('requirement-id')?.value || '',
            need: $('requirement-need')?.value || '',
            priority: $('priority')?.value || '',
            marketSector: $('market-sector')?.value || '',
            productServiceType: $('product-service-type')?.value || '',
            region: $('region')?.value || '',
            dueDate: $('due-date')?.value || '',
            priceEstimate: $('price-cost-estimate')?.value || '',
            setAside: $('set-aside')?.value || '',
            naicsCode: $('naics-code')?.value || '',
            gsaSchedule: $('gsa-schedule')?.value || '',
            commercialPractices: $('commercial-practices')?.value || '',
            qualityFactors: $('quality-factors')?.value || '',
            riskFactors: $('risk-factors')?.value || '',
            additionalNotes: $('additional-notes')?.value || ''
        };

        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            requirements.push(newRequirement);
            chrome.storage.local.set({ requirements }, () => {
                loadRequirements();
                clearInputFields();
            });
        });
    }

    // Function to delete a requirement
    function deleteRequirement(index) {
        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            requirements.splice(index, 1);
            chrome.storage.local.set({ requirements }, () => {
                loadRequirements();
            });
        });
    }

    // Function to clear input fields after saving a new requirement
    function clearInputFields() {
        const fields = [
            'requirement-id', 'requirement-need', 'priority', 'market-sector',
            'product-service-type', 'region', 'due-date', 'price-cost-estimate',
            'set-aside', 'naics-code', 'gsa-schedule', 'commercial-practices',
            'quality-factors', 'risk-factors', 'additional-notes'
        ];

        fields.forEach(field => {
            const element = $(field);
            if (element) {
                element.value = '';
                clearError(element);
            }
        });
    }

    // Functions for drag and drop functionality
    function setupDragAndDrop() {
        const cards = document.querySelectorAll('.requirement-card');
        cards.forEach(card => {
            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);
            card.addEventListener('dragover', dragOver);
            card.addEventListener('drop', drop);
        });
        requirementsList.addEventListener('dragover', listDragOver);
    }

    function dragStart(e) {
        draggingElement = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    function dragEnd(e) {
        e.target.classList.remove('dragging');
        draggingElement = null;
        updateCardPositions();
    }

    function dragOver(e) {
        e.preventDefault();
        if (e.target.classList.contains('requirement-card') && e.target !== draggingElement) {
            const draggingRect = draggingElement.getBoundingClientRect();
            const targetRect = e.target.getBoundingClientRect();
            if (draggingRect.top < targetRect.top) {
                e.target.parentNode.insertBefore(draggingElement, e.target.nextSibling);
            } else {
                e.target.parentNode.insertBefore(draggingElement, e.target);
            }
        }
    }

    function listDragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(requirementsList, e.clientY);
        if (afterElement == null) {
            requirementsList.appendChild(draggingElement);
        } else {
            requirementsList.insertBefore(draggingElement, afterElement);
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.requirement-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function drop(e) {
        e.preventDefault();
        updateCardPositions();
    }

    function updateCardPositions() {
        const cards = document.querySelectorAll('.requirement-card');
        const newOrder = Array.from(cards).map(card => parseInt(card.dataset.index));

        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            const reorderedRequirements = newOrder.map(index => requirements[index]);
            chrome.storage.local.set({ requirements: reorderedRequirements }, () => {
                loadRequirements();
            });
        });
    }
}

// Initialize the extension when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeExtension);