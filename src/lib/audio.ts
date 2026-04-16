/**
 * Utility to play the notification sound.
 * File is located at /public/notification.mp3
 */
export const playNotificationSound = () => {
    if (typeof window === "undefined") return;
    
    try {
        const isMuted = localStorage.getItem("isMuted") === "true";
        if (isMuted) return;

        const audio = new Audio("/notification.mp3");
        audio.play().catch(err => {
            console.warn("Audio playback failed (possibly blocked by browser):", err);
        });
    } catch (error) {
        console.error("Failed to initialize audio:", error);
    }
};
