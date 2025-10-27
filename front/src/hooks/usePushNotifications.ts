import { useState, useEffect } from "react";
const URL = import.meta.env.VITE_SERVER_URL;

if (!URL) {
  throw new Error("VITE_SERVER_URL is not defined in environment variables.");
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered successfully.");
        } catch (e) {
          console.error("Service Worker registration failed:", e);
          setError("Service Worker registration failed.");
        }
      }
    };

    registerServiceWorker();

    const checkSubscription = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (e) {
          console.error("Error checking push subscription:", e);
          setError("Error checking push subscription.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Push notifications are not supported by this browser.");
        setIsLoading(false);
      }
    };
    checkSubscription();
  }, []);

  const handleSubscription = async () => {
    setIsLoading(true);
    setError(null);

    // Comprehensive support check
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setError("Push notifications are not fully supported by this browser.");
      setIsLoading(false);
      return;
    }

    // HTTPS check for production (localhost is usually exempt)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError("Push notifications require HTTPS in production.");
      setIsLoading(false);
      return;
    }

    try {
      // Request notification permission explicitly
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== 'granted') {
        throw new Error('Notification permission denied.');
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        // If already subscribed, just update state
        setIsSubscribed(true);
        console.log("Already subscribed.");
      } else {
        // Subscribe logic
        const vapidRes = await fetch(`${URL}/push/vapid-key`);
        if (!vapidRes.ok) {
          throw new Error(`Failed to get VAPID key from server: ${vapidRes.statusText}`);
        }
        const { vapidPublicKey } = await vapidRes.json();

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const subscribeRes = await fetch(`${URL}/push/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: subscription.toJSON().keys?.p256dh,
            auth: subscription.toJSON().keys?.auth,
          }),
          credentials: "include",
        });

        if (!subscribeRes.ok) {
          throw new Error(`Failed to subscribe on server: ${subscribeRes.statusText}`);
        }
        setIsSubscribed(true);
        console.log("Subscribed successfully.");
      }
    } catch (err: any) {
      console.error("Subscription failed:", err);
      setError(err.message || "Failed to process subscription.");
      setIsSubscribed(false); // Ensure state is correct on failure
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSubscribed,
    isLoading,
    error,
    handleSubscription,
  };
}
