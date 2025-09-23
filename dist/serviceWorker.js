// Service Worker for Ayushi Healthcare Platform
const CACHE_NAME = 'ayushi-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/js/main.chunk.js',
  '/static/js/vendors.chunk.js',
  '/static/css/main.chunk.css',
  '/logo.svg',
  '/manifest.json'
];

// Install event - precache key resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Supabase API requests (let them fail when offline)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // For HTML pages, use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails and it's an image, return a placeholder
            if (event.request.destination === 'image') {
              return caches.match('/logo.svg');
            }
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Push notification event
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Helper function to sync appointments
async function syncAppointments() {
  try {
    const pendingAppointments = await getDataFromIndexedDB('pending-appointments');
    
    for (const appointment of pendingAppointments) {
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointment)
        });
        
        if (response.ok) {
          await removeFromIndexedDB('pending-appointments', appointment.id);
        }
      } catch (error) {
        console.error('Failed to sync appointment:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing appointments:', error);
  }
}

// Helper function to sync messages
async function syncMessages() {
  try {
    const pendingMessages = await getDataFromIndexedDB('pending-messages');
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          await removeFromIndexedDB('pending-messages', message.id);
        }
      } catch (error) {
        console.error('Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing messages:', error);
  }
}

// Helper function to get data from IndexedDB
function getDataFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ayushi-offline-db', 1);
    
    request.onerror = event => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = event => {
        reject('Error getting data: ' + event.target.errorCode);
      };
    };
  });
}

// Helper function to remove data from IndexedDB
function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ayushi-offline-db', 1);
    
    request.onerror = event => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = event => {
        reject('Error deleting data: ' + event.target.errorCode);
      };
    };
  });
}