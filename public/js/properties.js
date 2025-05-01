// State management
let currentPage = 1;
const itemsPerPage = 9;
let totalProperties = 0;
let properties = [];
let filters = {
    type: 'All',
    priceRange: 'All',
    location: 'All',
    status: 'All',
    search: ''
};

// DOM Elements
const propertiesGrid = document.getElementById('propertiesGrid');
const propertyModal = document.getElementById('propertyModal');
const propertyForm = document.getElementById('propertyForm');
const searchInput = document.querySelector('input[placeholder="Search properties..."]');
const filterSelects = document.querySelectorAll('.bg-gray-800 select');

// Load properties with filters and pagination
async function loadProperties() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            ...filters
        });

        const response = await apiRequest(`/api/properties?${queryParams}`, {
            method: 'GET'
        });

        properties = response.properties;
        totalProperties = response.total;
        
        renderProperties();
        updatePagination();
        updateTotalCount();
    } catch (error) {
        showNotification('Failed to load properties', 'error');
    }
}

// Render properties in the grid
function renderProperties() {
    propertiesGrid.innerHTML = properties.map(property => `
        <div class="bg-gray-800 rounded-lg overflow-hidden">
            <div class="h-48 bg-gray-700 relative">
                ${property.image ? 
                    `<img src="${property.image}" alt="${property.name}" class="w-full h-full object-cover">` :
                    `<div class="w-full h-full flex items-center justify-center text-gray-500">No Image</div>`
                }
                <div class="absolute top-2 right-2 px-2 py-1 rounded ${getStatusColor(property.status)}">
                    ${property.status}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">${property.name}</h3>
                <div class="text-gray-400 text-sm mb-2">${property.location}</div>
                <div class="text-xl font-bold mb-4">₹${formatPrice(property.price)}</div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">${property.type}</span>
                    <div class="flex space-x-2">
                        <button onclick="editProperty('${property.id}')" class="p-2 text-blue-400 hover:text-blue-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button onclick="deleteProperty('${property.id}')" class="p-2 text-red-400 hover:text-red-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(totalProperties / itemsPerPage);
    const paginationContainer = document.querySelector('.flex.space-x-2');
    
    let paginationHTML = `
        <button onclick="changePage(${currentPage - 1})" class="px-3 py-1 ${currentPage === 1 ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="px-3 py-1 bg-blue-600">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})" class="px-3 py-1 bg-gray-700 hover:bg-gray-600">${i}</button>`;
        }
    }

    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" class="px-3 py-1 ${currentPage === totalPages ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Update total properties count
function updateTotalCount() {
    document.getElementById('totalPropertiesCount').textContent = totalProperties;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalProperties);
    
    document.querySelector('.text-sm.text-gray-400').innerHTML = `
        Showing <span class="font-medium">${startIndex}</span> to <span class="font-medium">${endIndex}</span> of <span class="font-medium">${totalProperties}</span> properties
    `;
}

// Helper functions
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'available':
            return 'bg-green-500 text-white';
        case 'under contract':
            return 'bg-yellow-500 text-white';
        case 'sold':
            return 'bg-red-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

function formatPrice(price) {
    if (price >= 10000000) {
        return (price / 10000000).toFixed(2) + ' Cr';
    } else if (price >= 100000) {
        return (price / 100000).toFixed(2) + ' L';
    }
    return price.toLocaleString('en-IN');
}

// Modal functions
function openPropertyModal() {
    propertyModal.classList.remove('hidden');
}

function closePropertyModal() {
    propertyModal.classList.add('hidden');
    propertyForm.reset();
}

// Property CRUD operations
async function addProperty(formData) {
    try {
        const response = await apiRequest('/api/properties', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Property added successfully', 'success');
        closePropertyModal();
        loadProperties();
    } catch (error) {
        showNotification('Failed to add property', 'error');
    }
}

async function editProperty(propertyId) {
    try {
        const property = properties.find(p => p.id === propertyId);
        if (!property) return;

        // Populate form with property data
        Object.keys(property).forEach(key => {
            const input = propertyForm.querySelector(`[name="${key}"]`);
            if (input) input.value = property[key];
        });

        openPropertyModal();
    } catch (error) {
        showNotification('Failed to load property details', 'error');
    }
}

async function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
        await apiRequest(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        });
        
        showNotification('Property deleted successfully', 'success');
        loadProperties();
    } catch (error) {
        showNotification('Failed to delete property', 'error');
    }
}

// Event listeners
document.querySelector('.bg-blue-600.px-4.py-2').addEventListener('click', openPropertyModal);

propertyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(propertyForm));
    await addProperty(formData);
});

// Filter and search handlers
filterSelects.forEach(select => {
    select.addEventListener('change', () => {
        filters[select.parentElement.querySelector('label').textContent.toLowerCase()] = select.value;
        currentPage = 1;
        loadProperties();
    });
});

searchInput.addEventListener('input', debounce(() => {
    filters.search = searchInput.value;
    currentPage = 1;
    loadProperties();
}, 300));

function changePage(page) {
    if (page < 1 || page > Math.ceil(totalProperties / itemsPerPage)) return;
    currentPage = page;
    loadProperties();
}

// Initialize
loadProperties(); 