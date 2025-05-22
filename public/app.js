// DOM Elements
const newLeadsCount = document.getElementById('newLeadsCount');
const leadsChange = document.getElementById('leadsChange');
const activeCrawlersCount = document.getElementById('activeCrawlersCount');
const crawlerStatus = document.getElementById('crawlerStatus');
const conversionRate = document.getElementById('conversionRate');
const conversionChange = document.getElementById('conversionChange');
const totalDataPoints = document.getElementById('totalDataPoints');
const dailyDataPoints = document.getElementById('dailyDataPoints');
const map = document.getElementById('map');
const activityFeed = document.getElementById('activityFeed');

// Initialize Google Maps
let googleMap;
let markers = [];

function initMap() {
    // Indore coordinates
    const indoreCenter = { lat: 22.7196, lng: 75.8577 };
    
    googleMap = new google.maps.Map(map, {
        center: indoreCenter,
        zoom: 12,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            }
        ]
    });
}

// Create map point with animation
async function createMapPoint(address, isHot = false) {
    try {
        // Create a Geocoder instance
        const geocoder = new google.maps.Geocoder();
        
        // Add ", Indore, India" to the address if it doesn't already contain "Indore"
        const fullAddress = address.toLowerCase().includes('indore') ? 
            address : `${address}, Indore, India`;
        
        // Geocode the address
        const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
                if (status === 'OK') {
                    resolve(results[0].geometry.location);
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
        
        // Create marker
        const marker = new google.maps.Marker({
            position: result,
            map: googleMap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: isHot ? '#ff4444' : '#4444ff',
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: isHot ? '#ff0000' : '#0000ff'
            }
        });
        
        // Add pulse animation
        let opacity = 0.8;
        let growing = false;
        const pulseAnimation = setInterval(() => {
            if (growing) {
                opacity += 0.1;
                if (opacity >= 0.8) growing = false;
            } else {
                opacity -= 0.1;
                if (opacity <= 0.2) growing = true;
            }
            
            marker.setIcon({
                ...marker.getIcon(),
                fillOpacity: opacity
            });
        }, 100);
        
        // Store marker and animation
        markers.push({ marker, animation: pulseAnimation });
        
        // Remove marker after animation
        setTimeout(() => {
            const index = markers.findIndex(m => m.marker === marker);
            if (index !== -1) {
                clearInterval(markers[index].animation);
                markers[index].marker.setMap(null);
                markers.splice(index, 1);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error creating map point:', error);
    }
}

// Initialize navigation
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('bg-blue-600'));
    link.classList.add('bg-blue-600');
  });
});

// Keep track of yesterday's leads for comparison
let yesterdayLeads = 0;
let currentLeads = 0;

// Format time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds/60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
    return `${Math.floor(seconds/86400)} days ago`;
}

// Create activity feed item
function createActivityItem(lead) {
    const item = document.createElement('div');
    item.className = 'bg-gray-700 p-4 rounded-lg';
    
    const priorityClass = {
        'High': 'bg-red-500',
        'Medium': 'bg-yellow-500',
        'Low': 'bg-green-500'
    }[lead.priority] || 'bg-gray-500';
    
    item.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
                <span class="w-2 h-2 rounded-full ${priorityClass}"></span>
                <span class="font-medium text-white">${lead.name}</span>
                <span class="source-badge ${lead.source.toLowerCase()}">${lead.source}</span>
            </div>
            <span class="text-sm text-gray-400">${timeAgo(new Date(lead.timestamp))}</span>
        </div>
        <div class="text-sm text-gray-400">
            <div class="flex items-center space-x-2 mb-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>${lead.mobile}</span>
            </div>
            <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>${lead.address}</span>
            </div>
        </div>
    `;
    
    return item;
}

// Update stats display
function updateStatsDisplay(stats) {
    newLeadsCount.textContent = stats.dailyLeadsCount;
    const changePercent = ((stats.dailyLeadsCount - stats.yesterdayLeadsCount) / stats.yesterdayLeadsCount * 100).toFixed(1);
    leadsChange.textContent = `↑ ${changePercent}% vs yesterday`;
    
    activeCrawlersCount.textContent = stats.activeCrawlers;
    crawlerStatus.textContent = `All online • ${stats.highPriorityCrawlers} high priority`;
    
    conversionRate.textContent = `${stats.conversionRate}%`;
    conversionChange.textContent = `↑ ${stats.conversionRateChange}% vs last month`;
    
    totalDataPoints.textContent = stats.totalDataPoints;
    dailyDataPoints.textContent = `${stats.dailyDataPoints.toLocaleString()} collected today`;
}

// Socket event handlers
if (typeof socket !== 'undefined' && socket) {
    socket.on('newLead', (lead) => {
        console.log('New lead received:', lead); // Debug log
        // Create and add map point
        createMapPoint(lead.address, lead.priority === 'High');
        // Create and add activity item
        const activityItem = createActivityItem(lead);
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        // Remove old items if more than 5
        if (activityFeed.children.length > 5) {
            activityFeed.lastChild.remove();
        }
    });

    socket.on('updateStats', (stats) => {
        updateStatsDisplay(stats);
    });

    // Initialize with loading state
    socket.on('connect', () => {
      console.log('Connected to server');
    });
} else {
    console.error('Socket is not defined. Make sure common.js is loaded before app.js.');
}

// Initialize map when page loads
window.addEventListener('load', initMap); 