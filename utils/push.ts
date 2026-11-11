export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // PASTE YOUR PUBLIC KEY HERE (starts with 'B')
    // We hardcode it here to prevent the process.env crash in the browser.
    const publicKey = 'BA0oz1YP_9nx534ELYm9P_gZeae4WU0ZJywLjd3-dw4QaQJvUe6pPFAN-MdWcI4v5VrfxUz92KpYROR9Ao0RNpw'; 

    if (!publicKey) {
      console.error("You forgot to paste the public key in utils/push.ts");
      return null;
    }

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    
    localStorage.setItem('lateCirclePushSubscription', JSON.stringify(subscription));
    
    return subscription;
  } catch (error) {
    console.error("Push subscription failed:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}