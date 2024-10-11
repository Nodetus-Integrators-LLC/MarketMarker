document.addEventListener('DOMContentLoaded', function () {
    const createRequirementBtn = document.getElementById('create-requirement');
    const requirementsList = document.getElementById('requirements-list');
    let draggingElement = null;

    loadRequirements();
    createRequirementBtn.addEventListener('click', saveNewRequirement);

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

    function saveNewRequirement() {
        const newRequirement = {
            name: document.getElementById('requirement-name').value,
            priority: document.getElementById('priority').value,
            marketSector: document.getElementById('market-sector').value,
            productServiceType: document.getElementById('product-service-type').value,
            region: document.getElementById('region').value,
            priceEstimate: document.getElementById('price-cost-estimate').value
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

    function createRequirementCard(requirement, index) {
        const card = document.createElement('div');
        card.className = `requirement-card priority-${requirement.priority}`;
        card.draggable = true;
        card.dataset.index = index;
        card.innerHTML = `
            <h3>${requirement.name}</h3>
            <p><strong>Priority:</strong> ${requirement.priority}</p>
            <p><strong>Market Sector:</strong> ${requirement.marketSector}</p>
            <p><strong>Product/Service Type:</strong> ${requirement.productServiceType}</p>
            <p><strong>Region:</strong> ${requirement.region}</p>
            <p><strong>Price/Cost Estimate:</strong> ${requirement.priceEstimate}</p>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRequirement(index);
        });

        return card;
    }

    function deleteRequirement(index) {
        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            requirements.splice(index, 1);
            chrome.storage.local.set({ requirements }, loadRequirements);
        });
    }

    function clearInputFields() {
        document.getElementById('requirement-name').value = '';
        document.getElementById('priority').value = 'high';
        document.getElementById('market-sector').value = '';
        document.getElementById('product-service-type').value = '';
        document.getElementById('region').value = '';
        document.getElementById('price-cost-estimate').value = '';
    }

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
});