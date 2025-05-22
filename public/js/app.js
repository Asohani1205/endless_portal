// DOM Elements
const activityFeed = document.getElementById('activityFeed');
const newLeadsCount = document.getElementById('newLeadsCount');
const leadsChange = document.getElementById('leadsChange');
const activeCrawlersCount = document.getElementById('activeCrawlersCount');
const crawlerStatus = document.getElementById('crawlerStatus');
const conversionRate = document.getElementById('conversionRate');
const conversionChange = document.getElementById('conversionChange');
const totalDataPoints = document.getElementById('totalDataPoints');
const dailyDataPoints = document.getElementById('dailyDataPoints');

// Initialize counters
let todayLeads = 0;
let totalLeadsProcessed = 0;

// Create activity feed item
function createActivityItem(lead) {
    const item = document.createElement('div');
    item.className = 'bg-gray-700 p-4 rounded-lg';
    
    const timeAgo = Math.floor((Date.now() - new Date(lead.timestamp)) / 1000);
    const timeString = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`;

    // Define source badge colors
    const sourceBadgeColors = {
        facebook: 'bg-blue-600',
        instagram: 'bg-pink-600',
        linkedin: 'bg-blue-700',
        website: 'bg-green-600',
        google: 'bg-red-500'
    };

    const sourceColor = sourceBadgeColors[lead.source.toLowerCase()] || 'bg-gray-600';

    // Only show content if it exists
    const name = lead.name ? lead.name : '';
    const mobile = lead.mobile ? lead.mobile : '';
    const address = lead.address ? lead.address : '';

    item.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <div class="flex items-center mb-2">
                    <span class="font-semibold text-lg">${name}</span>
                    ${lead.source ? `<span class="ml-2 px-2 py-1 ${sourceColor} text-xs rounded-full">${lead.source}</span>` : ''}
                </div>
                ${mobile ? `
                <div class="text-sm text-gray-400 mb-1">
                    <span>${mobile}</span>
                </div>
                ` : ''}
                ${address ? `
                <div class="text-sm text-gray-400">
                    <span>${address}</span>
                </div>
                ` : ''}
            </div>
            <div class="text-sm text-gray-400">${timeString}</div>
        </div>
    `;

    // Add to activity feed
    activityFeed.insertBefore(item, activityFeed.firstChild);

    // Keep only last 50 items
    if (activityFeed.children.length > 50) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

// Update stats display
function updateStatsDisplay() {
    // Update leads count
    newLeadsCount.textContent = todayLeads;
    leadsChange.textContent = `+${todayLeads} today`;
    
    // Update crawler status
    activeCrawlersCount.textContent = '3';
    crawlerStatus.textContent = 'All systems operational';
    
    // Update conversion rate
    const rate = Math.round((todayLeads / totalLeadsProcessed) * 100) || 0;
    conversionRate.textContent = `${rate}%`;
    conversionChange.textContent = `+${Math.round(rate * 0.1)}% from yesterday`;
    
    // Update data points
    totalDataPoints.textContent = formatNumber(totalLeadsProcessed * 15);
    dailyDataPoints.textContent = `+${formatNumber(todayLeads * 15)} today`;
}

// Socket event handlers
if (typeof socket === 'undefined') {
  window.socket = io(API_BASE_URL);
}

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('newLead', (lead) => {
    createActivityItem(lead);
    todayLeads++;
    totalLeadsProcessed++;
    updateStatsDisplay();
});

// Start/Stop Fetching Button Logic
const toggleFetchingBtn = document.getElementById('toggleFetchingBtn');

async function updateFetchingStatus() {
    const res = await fetch(`${API_BASE_URL}/api/fetching-status`);
    const data = await res.json();
    toggleFetchingBtn.textContent = data.isFetching ? 'Stop Fetching' : 'Start Fetching';
}

toggleFetchingBtn?.addEventListener('click', async () => {
    await fetch(
        `${API_BASE_URL}${toggleFetchingBtn.textContent.includes('Start') ? '/api/start-fetching' : '/api/stop-fetching'}`,
        { method: 'POST' }
    );
    await updateFetchingStatus();
});

// On page load, set the correct button text
updateFetchingStatus();

// Initial stats update
updateStatsDisplay(); 