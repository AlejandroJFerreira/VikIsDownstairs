
const searchInput = document.getElementById('search-input');
const passwordContainer = document.getElementById("password-container");
const API_BASE_URL = 'http://localhost:8080/api'; // Update with your actual server URL

// Track chat history
let chatHistory = [];
let currentQuery = '';

// Function to display chat message
function displayChatMessage(message, isUser = false, timestamp = new Date()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'system-message'}`;

    const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${isUser ? 'You' : 'Password Manager'}</span>
            <span class="message-time">${timeStr}</span>
        </div>
        <div class="message-content">${message}</div>
    `;

    passwordContainer.appendChild(messageDiv);
    passwordContainer.scrollTop = passwordContainer.scrollHeight;
}

// Function to clear chat
function clearChat() {
    chatHistory = [];
    passwordContainer.innerHTML = '';
    displayWelcomeMessage();
}

// Function to display welcome message
function displayWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <h3>Password Search</h3>
        <p>Type a query to search for passwords.</p>
        <p class="hint">Examples:</p>
        <ul class="examples">
            <li>"google" - Search for Google password</li>
            <li>"facebook login" - Search for Facebook password</li>
            <li>"retrieve github" - Get GitHub password</li>
        </ul>
        <p>Press Enter to search or type "clear" to start over.</p>
    `;
    passwordContainer.appendChild(welcomeDiv);
}

// Function to process user query
async function processQuery(query) {
    if (!query.trim()) return;

    currentQuery = query.trim();

    // Add user message to chat
    displayChatMessage(query, true);

    // Check for clear command
    if (query.toLowerCase() === 'clear') {
        clearChat();
        searchInput.value = '';
        return;
    }

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    passwordContainer.appendChild(typingIndicator);
    passwordContainer.scrollTop = passwordContainer.scrollHeight;

    try {
        // Extract service name from query (simplified - you can enhance this)
        let serviceName = extractServiceName(query);

        if (!serviceName) {
            // Remove typing indicator
            typingIndicator.remove();
            displayChatMessage("Please specify a website/service name in your query.", false);
            return;
        }

        // Call API to retrieve password
        const response = await fetch(`${API_BASE_URL}/wordpass/retrieve?service=${encodeURIComponent(serviceName.toLowerCase())}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        // Remove typing indicator
        typingIndicator.remove();

        if (!response.ok) {
            if (response.status === 404) {
                displayChatMessage(`No password found for "${serviceName}". Make sure you're searching for the correct service name.`, false);
            } else {
                throw new Error(`API error: ${response.status}`);
            }
            return;
        }

        const result = await response.text();
        let responseMessage;

        try {
            // Try to parse JSON
            const parsedData = JSON.parse(result);
            if (parsedData.error || parsedData.message) {
                responseMessage = parsedData.error || parsedData.message;
            } else {
                responseMessage = `Password for ${serviceName}: ${JSON.stringify(parsedData)}`;
            }
        } catch (e) {
            // If not JSON, use as plain text
            responseMessage = result;
        }

        // Add system response to chat
        displayChatMessage(responseMessage, false);

        // Create action buttons
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';

        // Copy button if we have a password
        if (result && !result.includes('Error') && !result.includes('No password')) {
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button copy-button';
            copyButton.innerHTML = '📋 Copy Password';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(result).then(() => {
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.textContent = 'Password copied to clipboard!';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 2000);
                });
            };
            actionDiv.appendChild(copyButton);
        }

        // Retry button
        const retryButton = document.createElement('button');
        retryButton.className = 'action-button retry-button';
        retryButton.innerHTML = '🔍 Search Again';
        retryButton.onclick = () => {
            searchInput.value = serviceName;
            searchInput.focus();
        };
        actionDiv.appendChild(retryButton);

        passwordContainer.appendChild(actionDiv);
        passwordContainer.scrollTop = passwordContainer.scrollHeight;

        // Add to chat history
        chatHistory.push({
            query: query,
            serviceName: serviceName,
            response: result,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Query processing error:', error);

        // Remove typing indicator if still exists
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }

        displayChatMessage(`Error: ${error.message}. Please try again or check your connection.`, false);
    }
}

// Function to extract service name from query (simple implementation)
function extractServiceName(query) {
    const queryLower = query.toLowerCase().trim();

    // Remove common query words
    const commonWords = ['get', 'retrieve', 'find', 'search', 'password', 'for', 'my', 'the', 'login', 'account'];
    const words = queryLower.split(' ').filter(word =>
        !commonWords.includes(word) && word.length > 0
    );

    // Return the first meaningful word as service name
    return words.length > 0 ? words[0] : null;
}

// Function to handle Enter key
function handleSearch(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = searchInput.value.trim();

        if (query) {
            processQuery(query);
            searchInput.value = '';
        }
    }
}

// Add event listeners
searchInput.addEventListener('keypress', handleSearch);

// Add clear button functionality
function addClearSearchButton() {
    const searchContainer = document.querySelector('.search-container');

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '×';
    clearButton.className = 'clear-search-button';
    clearButton.title = 'Clear chat';

    clearButton.addEventListener('click', () => {
        clearChat();
        searchInput.value = '';
        clearButton.style.display = 'none';
    });

    searchContainer.appendChild(clearButton);

    // Show and hide clear button based on input
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.trim()) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // Clear any localStorage data
    localStorage.removeItem("userData");

    // Add clear button
    addClearSearchButton();

    // Display welcome message
    displayWelcomeMessage();

    // Focus search input
    searchInput.focus();

    // Add hint to search input
    searchInput.placeholder = "Type a query and press Enter (e.g., 'get google password')";
});

// Update password button click
const passwordButton = document.getElementById("password-button-id");
passwordButton.addEventListener("click", () => {
    const passwordListView = document.getElementById("password-list-view");
    const addPasswordView = document.getElementById("add-password-view");

    passwordListView.classList.remove("hidden");
    addPasswordView.classList.add("hidden");

    // Clear search input
    searchInput.value = '';
    searchInput.focus();

    // Update placeholder
    searchInput.placeholder = "Type a query and press Enter (e.g., 'get google password')";
});