// Service worker registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

// Check for service worker updates
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.update();
      });
  }
}

// Setup IndexedDB for offline data storage
export function setupOfflineStorage() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ayushi-offline-db', 1);
    
    request.onerror = event => {
      console.error('IndexedDB error:', event.target.errorCode);
      reject(event.target.errorCode);
    };
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object stores for offline data
      if (!db.objectStoreNames.contains('pending-appointments')) {
        db.createObjectStore('pending-appointments', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pending-messages')) {
        db.createObjectStore('pending-messages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('cached-user-data')) {
        db.createObjectStore('cached-user-data', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = event => {
      console.log('IndexedDB setup successful');
      resolve(event.target.result);
    };
  });
}

// Save data to IndexedDB for offline use
export function saveToOfflineStorage(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ayushi-offline-db', 1);
    
    request.onerror = event => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const addRequest = store.put(data);
      
      addRequest.onsuccess = () => {
        resolve();
      };
      
      addRequest.onerror = event => {
        reject('Error saving data: ' + event.target.errorCode);
      };
    };
  });
}

// Get data from IndexedDB
export function getFromOfflineStorage(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ayushi-offline-db', 1);
    
    request.onerror = event => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      let getRequest;
      
      if (id) {
        getRequest = store.get(id);
      } else {
        getRequest = store.getAll();
      }
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
      
      getRequest.onerror = event => {
        reject('Error getting data: ' + event.target.errorCode);
      };
    };
  });
}

// Register for push notifications
export function registerForPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    return navigator.serviceWorker.ready
      .then(registration => {
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            // Replace with your VAPID public key
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
          )
        });
      })
      .then(subscription => {
        // Send subscription to backend
        return fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
        });
      })
      .catch(error => {
        console.error('Error registering for push notifications:', error);
      });
  }
}

// Helper function to convert base64 to Uint8Array for push notifications
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}