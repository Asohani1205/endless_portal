// DOM Elements
const crawlersList = document.querySelector('.space-y-4');
const configForm = document.querySelector('form');
const terminalContent = document.querySelector('.terminal-content');

// Load crawler data
async function loadCrawlers() {
    try {
        const { crawlers } = await apiRequest('/crawlers');
        updateCrawlersList(crawlers);
    } catch (error) {
        showNotification('Failed to load crawlers', 'error');
    }
}

// Update crawlers list
function updateCrawlersList(crawlers) {
    crawlersList.innerHTML = crawlers.map(crawler => `
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded">
            <div>
                <div class="font-medium">${crawler.name}</div>
                <div class="text-sm text-gray-400">${crawler.sources.join(', ')}</div>
            </div>
            <div class="flex items-center">
                <span class="px-2 py-1 ${
                    crawler.status === 'running' ? 'bg-green-500' :
                    crawler.status === 'paused' ? 'bg-yellow-500' :
                    'bg-red-500'
                } text-xs rounded mr-2">${crawler.status}</span>
                <button 
                    class="px-3 py-1 ${crawler.status === 'running' ? 'bg-red-500' : 'bg-green-500'} rounded text-sm"
                    onclick="toggleCrawler('${crawler.id}', '${crawler.status}')"
                >
                    ${crawler.status === 'running' ? 'Stop' : 'Start'}
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle crawler status
async function toggleCrawler(crawlerId, currentStatus) {
    try {
        await apiRequest(`/crawlers/${crawlerId}/toggle`, {
            method: 'POST',
            body: JSON.stringify({
                status: currentStatus === 'running' ? 'paused' : 'running'
            })
        });
        
        showNotification(`Crawler ${currentStatus === 'running' ? 'stopped' : 'started'} successfully`);
        loadCrawlers();
        
        // Add log entry
        addLogEntry(
            currentStatus === 'running' 
                ? `[INFO] ${crawlerId} crawler stopped by user`
                : `[INFO] ${crawlerId} crawler started by user`,
            currentStatus === 'running' ? 'warning' : 'success'
        );
    } catch (error) {
        showNotification('Failed to update crawler status', 'error');
    }
}

// Add log entry to terminal
function addLogEntry(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `terminal-line ${type}`;
    entry.textContent = `${message}`;
    
    terminalContent.insertBefore(entry, terminalContent.firstChild);
    
    // Keep only last 100 entries
    while (terminalContent.children.length > 100) {
        terminalContent.removeChild(terminalContent.lastChild);
    }
}

// Handle configuration form submission
configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(configForm);
    const config = {
        frequency: formData.get('frequency'),
        priority: formData.get('priority'),
        targetUrls: formData.get('targetUrls').split('\n').filter(url => url.trim())
    };
    
    try {
        await apiRequest('/crawlers/config', {
            method: 'POST',
            body: JSON.stringify(config)
        });
        
        showNotification('Configuration updated successfully');
        addLogEntry('[INFO] Crawler configuration updated', 'success');
    } catch (error) {
        showNotification('Failed to update configuration', 'error');
        addLogEntry('[ERROR] Failed to update crawler configuration', 'error');
    }
});

// Simulate real-time logs
function simulateLogEntries() {
    const logMessages = [
        { message: 'Social Media Crawler: Successfully fetched 23 new leads', type: 'success' },
        { message: 'Property Portal Crawler: Scanning page 3 of MagicBricks', type: 'info' },
        { message: 'Forums Crawler: Rate limit reached, cooling down', type: 'warning' },
        { message: 'Failed to connect to LinkedIn API, retrying...', type: 'error' }
    ];
    
    setInterval(() => {
        const log = logMessages[Math.floor(Math.random() * logMessages.length)];
        addLogEntry(`[${log.type.toUpperCase()}] ${log.message}`, log.type);
    }, Math.random() * 5000 + 2000); // Random interval between 2-7 seconds
}

// Initialize
loadCrawlers();
simulateLogEntries(); 