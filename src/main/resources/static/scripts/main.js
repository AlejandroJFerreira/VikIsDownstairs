// Button ID's
const passwordButton = document.getElementById("password-button-id");
const addPasswordButton = document.getElementById("add-password-button-id");
const searchSubmitButton = document.getElementById("search-submit-button");

// View ID's
const passwordListView = document.getElementById("password-list-view");
const addPasswordView = document.getElementById("add-password-view");

// Search input
const searchWebsiteInput = document.getElementById("search-website-input");

// Base URL for your Spring Boot API
const API_BASE_URL = 'http://localhost:8080/api'; // Update with your actual server URL

// Switching between pages
addPasswordButton.addEventListener("click", () => {
    passwordListView.classList.add("hidden");
    addPasswordView.classList.remove("hidden");
});

passwordButton.addEventListener("click", () => {
    passwordListView.classList.remove("hidden");
    addPasswordView.classList.add("hidden");
    showEmptyState();
});

// Search button click handler
searchSubmitButton.addEventListener("click", () => {
    const searchText = searchWebsiteInput.value.trim();

    if (searchText) {
        // Show alert with the search text
        alert(`Searching for: ${searchText}`);

        // You can also use the existing doGet function here if you want
        // to actually search the API:
        doGet(searchText);
    } else {
        alert("Please enter a website name to search.");
    }
});

// Optional: Add event listener for Enter key in search input
searchWebsiteInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchSubmitButton.click();
    }
});

// Cancel button
const cancelButton = document.getElementById("cancel-button-id");

cancelButton.addEventListener("click", () => {
    const inputs = addPasswordView.querySelectorAll("input");
    inputs.forEach(input => input.value = "");
});

// Save button
const saveButton = document.getElementById('save-button-id');
const message = document.getElementById('message');

saveButton.addEventListener('click', async () => {
    // Get values
    const service = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Checking for missing fields
    if (!service || !username || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    try {
        // Save to API
        await saveDataToAPI(service, username, password);

        // Show success message
        showMessage("Saved successfully!", "success");

        // Clear form
        const inputs = addPasswordView.querySelectorAll("input");
        inputs.forEach(input => input.value = "");
    } catch (error) {
        showMessage("Failed to save password. Please try again.", "error");
        console.error('Save error:', error);
    }
});

// Function to show a message
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.opacity = 1;

    setTimeout(() => {
        message.style.opacity = 0;
    }, 2000);
}

// Function to save password to API
async function saveDataToAPI(website, username, password) {
    try {
        // Using the PasswordController endpoint
        const response = await fetch(`${API_BASE_URL}/passwords`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service: website,
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.text();
        console.log('Save API response:', result);
        return result;
    } catch (error) {
        console.error('Error saving to API:', error);
        throw error;
    }
}

// Function to get password from API (when GET button is clicked)
async function doGet(website) {
    try {
        // Using the PasswordGetAPI retrieve endpoint
        const response = await fetch(`${API_BASE_URL}/wordpass/retrieve?service=${encodeURIComponent(website.toLowerCase())}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.text();

        // Parse the JSON response
        let passwordData;
        try {
            passwordData = JSON.parse(result);
        } catch (e) {
            // If not JSON, use as plain text
            passwordData = result;
        }

        // Show popup with retrieved data
        let user = "";
        let service = website;
        let password = "";
        if (typeof passwordData === 'object' && passwordData !== null && passwordData.status === "success") {
            // Prefer username from data if available
            if (passwordData.data && typeof passwordData.data === 'object' && passwordData.data.username) {
                user = passwordData.data.username;
            } else {
                user = passwordData.user || "";
            }
            service = passwordData.service || website;
            // passwordData.data could be an object or string
            if (typeof passwordData.data === 'object' && passwordData.data !== null) {
                const cipher = passwordData.data.ciphertext || "";
                password = decipher(cipher);
            } else {
                password = passwordData.data || "";
            }
        // Caesar decipher function: shift each letter/digit back by 3, wrap around
        function decipher(text) {
            const shift = 3;
            return text.split('').map(char => {
                if (/[A-Z]/.test(char)) {
                    // Uppercase letters
                    return String.fromCharCode((char.charCodeAt(0) - 'A'.charCodeAt(0) - shift + 26) % 26 + 'A'.charCodeAt(0));
                } else if (/[a-z]/.test(char)) {
                    // Lowercase letters
                    return String.fromCharCode((char.charCodeAt(0) - 'a'.charCodeAt(0) - shift + 26) % 26 + 'a'.charCodeAt(0));
                } else if (/[0-9]/.test(char)) {
                    // Digits
                    return String.fromCharCode((char.charCodeAt(0) - '0'.charCodeAt(0) - shift + 10) % 10 + '0'.charCodeAt(0));
                } else {
                    // Other characters unchanged
                    return char;
                }
            }).join('');
        }
        } else if (typeof passwordData === 'string') {
            password = passwordData;
        }
        document.getElementById("popup-website-id").textContent = service;
        document.getElementById("popup-username-id").textContent = user ? user : "Retrieved from API";
        document.getElementById("popup-password-id").textContent = password;
        document.getElementById("popup-overlay-id").classList.remove("hidden");

    } catch (error) {
        console.error('Error retrieving password:', error);
        showMessage(`Failed to retrieve password for ${website}`, "error");
    }
}

// Function to show empty state
function showEmptyState() {
    const passwordContainer = document.getElementById("password-container");
    passwordContainer.innerHTML = "";

    const emptyState = document.createElement("div");
    emptyState.classList.add("empty-state");
    emptyState.innerHTML = `
        <p>No passwords stored locally.</p>
        <p>Use the search bar above to find passwords from the API.</p>
        <p>Click "Add Password" to save a new password to the API.</p>
    `;
    passwordContainer.appendChild(emptyState);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Clear any existing localStorage data
    localStorage.removeItem("userData");

    // Show empty state
    showEmptyState();

    // Clear search input
    searchWebsiteInput.value = "";
});