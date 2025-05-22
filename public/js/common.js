// Load sidebar content
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <div class="w-64 bg-gray-800 p-4 h-full">
            <div class="text-xl font-bold mb-8">Sudarshan leads Portal</div>
            <nav>
                <a href="/index.html" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded mb-2">Dashboard</a>
                <a href="/pages/web-crawler.html" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded mb-2">Web Crawler</a>
                <a href="/pages/leads.html" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded mb-2">Leads</a>
                <a href="/pages/settings.html" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">Settings</a>
            </nav>
        </div>
    `;

    // Highlight current page in navigation
    const currentPage = window.location.pathname;
    const navLinks = sidebar.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.remove('text-gray-300', 'hover:bg-gray-700');
            link.classList.add('bg-blue-600', 'text-white');
        }
    });

    // If sidebar is being loaded dynamically, hide or remove the Leads link
    const leadsLink = document.querySelector('a[href*="leads"]');
    if (leadsLink) {
        leadsLink.style.display = 'none';
    }
});

// Format date helper function
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Format number helper function
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Format currency helper function
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Show notification helper function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-yellow-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set the backend API base URL for production
const API_BASE_URL = "https://admin-lead-portal-production.up.railway.app";

// API request helper function
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Socket connection and fetching control
let socket;
let isConnected = false;

function connectSocket() {
    if (!isConnected) {
        socket = io(API_BASE_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            isConnected = true;
            updateConnectionStatus(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            isConnected = false;
            updateConnectionStatus(false);
        });

        socket.on('newLead', (lead) => {
            console.log('New lead received:', lead);
            if (typeof addLeadToTable === 'function') {
                addLeadToTable(lead);
            }
            if (typeof updateStats === 'function') {
                updateStats();
            }
        });

        socket.on('fetchingStatus', (data) => {
            updateFetchingStatus(data.isFetching);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            isConnected = false;
            updateConnectionStatus(false);
        });
    }
}

function disconnectSocket() {
    if (socket && isConnected) {
        socket.disconnect();
        isConnected = false;
        updateConnectionStatus(false);
    }
}

function startFetching() {
    if (socket && isConnected) {
        socket.emit('startFetching');
    } else {
        connectSocket();
        socket.on('connect', () => {
            socket.emit('startFetching');
        });
    }
}

function stopFetching() {
    if (socket && isConnected) {
        socket.emit('stopFetching');
    }
}

function updateFetchingStatus(isFetching) {
    const startBtn = document.getElementById('startFetching');
    const stopBtn = document.getElementById('stopFetching');
    if (startBtn && stopBtn) {
        startBtn.style.display = isFetching ? 'none' : 'block';
        stopBtn.style.display = isFetching ? 'block' : 'none';
    }
}

// Update the event listeners in the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Ensure both Start and Stop buttons exist
    let startBtn = document.getElementById('startFetching');
    let stopBtn = document.getElementById('stopFetching');

    if (!startBtn) {
        startBtn = document.createElement('button');
        startBtn.id = 'startFetching';
        startBtn.textContent = 'Start Fetching';
        startBtn.className = 'btn btn-primary';
        document.body.appendChild(startBtn);
    }
    if (!stopBtn) {
        stopBtn = document.createElement('button');
        stopBtn.id = 'stopFetching';
        stopBtn.textContent = 'Stop Fetching';
        stopBtn.className = 'btn btn-danger';
        stopBtn.style.display = 'none';
        document.body.appendChild(stopBtn);
    }

    startBtn.addEventListener('click', () => {
        startFetching();
    });
    stopBtn.addEventListener('click', () => {
        stopFetching();
    });

    // ... rest of the existing code ...
}); 