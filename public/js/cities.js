// State management
let cities = [];
let currentCity = null;
let charts = {};

// DOM Elements
const citiesGrid = document.getElementById('citiesGrid');
const cityModal = document.getElementById('cityModal');
const cityForm = document.getElementById('cityForm');
const cityAnalyticsModal = document.getElementById('cityAnalyticsModal');

// Load cities data
async function loadCities() {
    try {
        const response = await apiRequest('/api/cities', {
            method: 'GET'
        });
        
        cities = response.cities;
        document.getElementById('activeCitiesCount').textContent = cities.filter(city => city.status === 'active').length;
        renderCities();
    } catch (error) {
        showNotification('Failed to load cities', 'error');
    }
}

// Render cities in the grid
function renderCities() {
    citiesGrid.innerHTML = cities.map(city => `
        <div class="bg-gray-800 rounded-lg overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold">${city.name}</h3>
                        <div class="text-gray-400">${city.state}</div>
                    </div>
                    <div class="px-2 py-1 rounded ${getStatusColor(city.status)}">
                        ${city.status}
                    </div>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Population:</span>
                        <span>${formatNumber(city.population)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Properties:</span>
                        <span>${formatNumber(city.propertyCount || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Active Leads:</span>
                        <span>${formatNumber(city.activeLeads || 0)}</span>
                    </div>
                </div>
                <div class="mt-6 space-y-2">
                    <div class="text-sm text-gray-400">Target Areas:</div>
                    <div class="flex flex-wrap gap-2">
                        ${(city.targetAreas || []).map(area => `
                            <span class="px-2 py-1 bg-gray-700 rounded-full text-sm">${area}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="flex justify-between mt-6">
                    <button onclick="viewCityAnalytics('${city.id}')" class="text-blue-400 hover:text-blue-300">
                        View Analytics
                    </button>
                    <div class="flex space-x-2">
                        <button onclick="editCity('${city.id}')" class="p-2 text-blue-400 hover:text-blue-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button onclick="deleteCity('${city.id}')" class="p-2 text-red-400 hover:text-red-300">
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

// Helper functions
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-500 text-white';
        case 'inactive':
            return 'bg-red-500 text-white';
        case 'pending':
            return 'bg-yellow-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-IN').format(number);
}

// Modal functions
function openCityModal() {
    cityModal.classList.remove('hidden');
}

function closeCityModal() {
    cityModal.classList.add('hidden');
    cityForm.reset();
    currentCity = null;
}

function openCityAnalyticsModal() {
    cityAnalyticsModal.classList.remove('hidden');
}

function closeCityAnalyticsModal() {
    cityAnalyticsModal.classList.add('hidden');
    // Destroy existing charts to prevent memory leaks
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
}

// City CRUD operations
async function addCity(formData) {
    try {
        const response = await apiRequest('/api/cities', {
            method: 'POST',
            body: JSON.stringify({
                ...formData,
                targetAreas: formData.targetAreas.split(',').map(area => area.trim()).filter(Boolean)
            })
        });
        
        showNotification('City added successfully', 'success');
        closeCityModal();
        loadCities();
    } catch (error) {
        showNotification('Failed to add city', 'error');
    }
}

async function editCity(cityId) {
    try {
        currentCity = cities.find(c => c.id === cityId);
        if (!currentCity) return;

        // Populate form with city data
        Object.keys(currentCity).forEach(key => {
            const input = cityForm.querySelector(`[name="${key}"]`);
            if (input) {
                if (key === 'targetAreas') {
                    input.value = currentCity[key].join(', ');
                } else {
                    input.value = currentCity[key];
                }
            }
        });

        openCityModal();
    } catch (error) {
        showNotification('Failed to load city details', 'error');
    }
}

async function deleteCity(cityId) {
    if (!confirm('Are you sure you want to delete this city?')) return;

    try {
        await apiRequest(`/api/cities/${cityId}`, {
            method: 'DELETE'
        });
        
        showNotification('City deleted successfully', 'success');
        loadCities();
    } catch (error) {
        showNotification('Failed to delete city', 'error');
    }
}

// Analytics functions
async function viewCityAnalytics(cityId) {
    try {
        const city = cities.find(c => c.id === cityId);
        if (!city) return;

        const analytics = await apiRequest(`/api/cities/${cityId}/analytics`, {
            method: 'GET'
        });

        openCityAnalyticsModal();
        renderAnalytics(analytics);
    } catch (error) {
        showNotification('Failed to load city analytics', 'error');
    }
}

function renderAnalytics(analytics) {
    // Property Distribution Chart
    charts.propertyDistribution = new Chart(
        document.getElementById('propertyDistributionChart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Residential', 'Commercial', 'Industrial'],
                datasets: [{
                    data: [
                        analytics.propertyDistribution.residential,
                        analytics.propertyDistribution.commercial,
                        analytics.propertyDistribution.industrial
                    ],
                    backgroundColor: ['#60A5FA', '#34D399', '#F472B6']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        }
    );

    // Price Trends Chart
    charts.priceTrends = new Chart(
        document.getElementById('priceTrendsChart'),
        {
            type: 'line',
            data: {
                labels: analytics.priceTrends.months,
                datasets: [{
                    label: 'Average Price',
                    data: analytics.priceTrends.prices,
                    borderColor: '#60A5FA',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        }
    );

    // Lead Sources Chart
    charts.leadSources = new Chart(
        document.getElementById('leadSourcesChart'),
        {
            type: 'bar',
            data: {
                labels: Object.keys(analytics.leadSources),
                datasets: [{
                    label: 'Leads',
                    data: Object.values(analytics.leadSources),
                    backgroundColor: '#60A5FA'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        }
    );

    // Market Activity Chart
    charts.marketActivity = new Chart(
        document.getElementById('marketActivityChart'),
        {
            type: 'line',
            data: {
                labels: analytics.marketActivity.dates,
                datasets: [{
                    label: 'Listings',
                    data: analytics.marketActivity.listings,
                    borderColor: '#60A5FA',
                    tension: 0.4
                }, {
                    label: 'Sales',
                    data: analytics.marketActivity.sales,
                    borderColor: '#34D399',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        }
    );

    // Render recent activity table
    const recentActivityTable = document.getElementById('recentActivityTable');
    recentActivityTable.innerHTML = analytics.recentActivity.map(activity => `
        <tr class="border-t border-gray-600">
            <td class="py-3">${new Date(activity.date).toLocaleDateString()}</td>
            <td class="py-3">${activity.description}</td>
            <td class="py-3">${activity.location}</td>
            <td class="py-3">
                <span class="px-2 py-1 rounded ${getActivityStatusColor(activity.status)}">
                    ${activity.status}
                </span>
            </td>
        </tr>
    `).join('');
}

function getActivityStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-500 text-white';
        case 'in progress':
            return 'bg-yellow-500 text-white';
        case 'pending':
            return 'bg-gray-500 text-white';
        default:
            return 'bg-blue-500 text-white';
    }
}

// Event listeners
document.querySelector('.bg-blue-600.px-4.py-2').addEventListener('click', openCityModal);

cityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(cityForm));
    
    if (currentCity) {
        try {
            await apiRequest(`/api/cities/${currentCity.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...formData,
                    targetAreas: formData.targetAreas.split(',').map(area => area.trim()).filter(Boolean)
                })
            });
            
            showNotification('City updated successfully', 'success');
            closeCityModal();
            loadCities();
        } catch (error) {
            showNotification('Failed to update city', 'error');
        }
    } else {
        await addCity(formData);
    }
});

// Initialize
loadCities(); 