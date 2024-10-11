document.addEventListener('DOMContentLoaded', function () {
    const homeScreen = document.getElementById('home-screen');
    const requirementView = document.getElementById('requirement-view');
    const newRequirementScreen = document.getElementById('new-requirement');
    const addRequirementBtn = document.getElementById('add-requirement');
    const createRequirementBtn = document.getElementById('create-requirement');
    const backToHomeBtn = document.getElementById('back-to-home');
    const requirementsList = document.getElementById('requirements-list');

    // Load existing requirements
    loadRequirements();

    // Add event listeners
    addRequirementBtn.addEventListener('click', showNewRequirementScreen);
    createRequirementBtn.addEventListener('click', saveNewRequirement);
    backToHomeBtn.addEventListener('click', showHomeScreen);

    function loadRequirements() {
        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            requirementsList.innerHTML = '';
            requirements.forEach((req, index) => {
                const div = document.createElement('div');
                div.textContent = `Requirement ${index + 1}: ${req.name}`;
                div.addEventListener('click', () => showRequirementView(req));
                requirementsList.appendChild(div);
            });
        });
    }

    function showNewRequirementScreen() {
        homeScreen.style.display = 'none';
        newRequirementScreen.style.display = 'block';
    }

    function saveNewRequirement(e) {
        e.preventDefault();
        const newRequirement = {
            name: document.getElementById('requirement-name').value,
            priority: document.getElementById('priority').value,
            marketSector: document.getElementById('market-sector').value,
            productServiceType: document.getElementById('product-service-type').value,
            region: document.getElementById('region').value,
            priceEstimate: document.getElementById('price-estimate').value
        };

        chrome.storage.local.get('requirements', (result) => {
            const requirements = result.requirements || [];
            requirements.push(newRequirement);
            chrome.storage.local.set({ requirements }, () => {
                loadRequirements();
                showHomeScreen();
            });
        });
    }

    function showRequirementView(requirement) {
        document.getElementById('requirement-title').textContent = `${requirement.name} {ID}`;
        homeScreen.style.display = 'none';
        requirementView.style.display = 'block';
    }

    function showHomeScreen() {
        newRequirementScreen.style.display = 'none';
        requirementView.style.display = 'none';
        homeScreen.style.display = 'block';
    }
});