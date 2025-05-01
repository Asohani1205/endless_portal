// DOM Elements
const generalSettingsForm = document.getElementById('generalSettingsForm');
const crawlerSettingsForm = document.getElementById('crawlerSettingsForm');
const notificationSettingsForm = document.getElementById('notificationSettingsForm');
const apiKeyInput = document.getElementById('apiKey');

// Load settings
async function loadSettings() {
    try {
        const response = await apiRequest('/api/settings', {
            method: 'GET'
        });
        
        populateGeneralSettings(response.general);
        populateCrawlerSettings(response.crawler);
        populateNotificationSettings(response.notifications);
        populateApiKey(response.apiKey);
    } catch (error) {
        showNotification('Failed to load settings', 'error');
    }
}

// Populate form fields
function populateGeneralSettings(settings) {
    const form = generalSettingsForm;
    form.companyName.value = settings.companyName;
    form.contactEmail.value = settings.contactEmail;
    form.phoneNumber.value = settings.phoneNumber;
    form.currency.value = settings.currency;
    form.timezone.value = settings.timezone;
}

function populateCrawlerSettings(settings) {
    const form = crawlerSettingsForm;
    form.crawlInterval.value = settings.crawlInterval;
    form.maxCrawlers.value = settings.maxCrawlers;
    form.requestTimeout.value = settings.requestTimeout;
    form.userAgent.value = settings.userAgent;
}

function populateNotificationSettings(settings) {
    const form = notificationSettingsForm;
    form.emailNotifications.checked = settings.emailEnabled;
    form.desktopNotifications.checked = settings.desktopEnabled;
    form.leadAlerts.checked = settings.leadAlertsEnabled;
}

function populateApiKey(apiKey) {
    apiKeyInput.value = apiKey;
    apiKeyInput.type = 'password';
}

// Save settings
async function saveGeneralSettings(formData) {
    try {
        await apiRequest('/api/settings/general', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showNotification('General settings saved successfully', 'success');
    } catch (error) {
        showNotification('Failed to save general settings', 'error');
    }
}

async function saveCrawlerSettings(formData) {
    try {
        await apiRequest('/api/settings/crawler', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showNotification('Crawler settings saved successfully', 'success');
    } catch (error) {
        showNotification('Failed to save crawler settings', 'error');
    }
}

async function saveNotificationSettings(formData) {
    try {
        await apiRequest('/api/settings/notifications', {
            method: 'PUT',
            body: JSON.stringify({
                emailEnabled: formData.emailNotifications,
                desktopEnabled: formData.desktopNotifications,
                leadAlertsEnabled: formData.leadAlerts
            })
        });
        
        showNotification('Notification settings saved successfully', 'success');
    } catch (error) {
        showNotification('Failed to save notification settings', 'error');
    }
}

// API Key functions
function toggleApiKey() {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
}

async function regenerateApiKey() {
    if (!confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) return;

    try {
        const response = await apiRequest('/api/settings/api-key/regenerate', {
            method: 'POST'
        });
        
        apiKeyInput.value = response.apiKey;
        showNotification('API key regenerated successfully', 'success');
    } catch (error) {
        showNotification('Failed to regenerate API key', 'error');
    }
}

// Integration functions
async function connectIntegration(service) {
    try {
        const response = await apiRequest(`/api/integrations/${service}/connect`, {
            method: 'POST'
        });
        
        // Open the OAuth window or handle the connection process
        if (response.authUrl) {
            window.open(response.authUrl, '_blank', 'width=600,height=600');
        }
    } catch (error) {
        showNotification(`Failed to connect to ${service}`, 'error');
    }
}

// Danger zone functions
async function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) return;
    
    try {
        await apiRequest('/api/settings/clear-data', {
            method: 'POST'
        });
        
        showNotification('All data cleared successfully', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        showNotification('Failed to clear data', 'error');
    }
}

async function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) return;
    
    try {
        await apiRequest('/api/settings/reset', {
            method: 'POST'
        });
        
        showNotification('Settings reset successfully', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        showNotification('Failed to reset settings', 'error');
    }
}

// Event listeners
generalSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(generalSettingsForm));
    await saveGeneralSettings(formData);
});

crawlerSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(crawlerSettingsForm));
    await saveCrawlerSettings(formData);
});

notificationSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(notificationSettingsForm));
    await saveNotificationSettings(formData);
});

// Integration buttons
document.querySelectorAll('.text-blue-400').forEach(button => {
    button.addEventListener('click', () => {
        const service = button.closest('.flex').querySelector('.font-medium').textContent.toLowerCase();
        connectIntegration(service);
    });
});

// Initialize
loadSettings(); 