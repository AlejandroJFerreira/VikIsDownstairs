
// Close popup functionality (existing code with improved styling)
const closePopupButton = document.getElementById("close-popup-button-id");
const popupOverlay = document.getElementById("popup-overlay-id");

closePopupButton.addEventListener("click", () => {
    popupOverlay.classList.add("hidden");
});

// Also close popup when clicking outside the popup content
popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
        popupOverlay.classList.add("hidden");
    }
});

// Optional: Close with Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popupOverlay.classList.contains("hidden")) {
        popupOverlay.classList.add("hidden");
    }
});