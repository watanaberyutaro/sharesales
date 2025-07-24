// Service Worker for SHARE最強営業ツール
const CACHE_NAME = 'share-sales-v1.0.0'
const RUNTIME_CACHE = 'share-sales-runtime'

// Cache essential app shell resources
const PRECACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Install event - cache app shell
self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => {
        console.log('Service Worker installed successfully')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(navigateHandler(event.request))
    return
  }

  // Handle other requests with cache first strategy
  event.respondWith(cacheFirst(event.request))
})

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache first failed:', error)
    return new Response('Offline content not available', { status: 503 })
  }
}

// Network first strategy - for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Network error and no cache available', { status: 503 })
  }
}

// Navigation handler - serve app shell for SPA routing
async function navigateHandler(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log('Navigation network failed, serving app shell')
    const cache = await caches.open(CACHE_NAME)
    return cache.match('/') || new Response('App not available offline', { status: 503 })
  }
}

// Push notification event
self.addEventListener('push', event => {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: 'SHARE営業ツール',
    body: '新しい通知があります',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'share-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '開く',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ]
  }

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data,
        data: data // Store original data for click handling
      }
    } catch (error) {
      console.error('Error parsing push data:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  // Handle action clicks
  if (event.action === 'close') {
    return
  }

  // Default action or 'open' action
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen)
            }
            return
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync event for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle queued offline actions
      handleBackgroundSync()
    )
  }
})

async function handleBackgroundSync() {
  try {
    // Get queued actions from IndexedDB or localStorage
    // This would sync offline actions like:
    // - Sending queued messages
    // - Submitting forms
    // - Updating user data
    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Periodic sync triggered:', event.tag)
  
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Sync content in background
      syncContent()
    )
  }
})

async function syncContent() {
  try {
    // Fetch latest jobs, talents, etc.
    // Update local cache with fresh data
    console.log('Content sync completed')
  } catch (error) {
    console.error('Content sync failed:', error)
  }
}

// Message event for communication with main thread
self.addEventListener('message', event => {
  console.log('Message received in SW:', event.data)
  
  if (event.data && event.data.action) {
    switch (event.data.action) {
      case 'skipWaiting':
        self.skipWaiting()
        break
      case 'getCacheStatus':
        event.ports[0].postMessage({
          cacheStatus: 'active',
          cacheSize: PRECACHE_URLS.length
        })
        break
      default:
        console.log('Unknown message action:', event.data.action)
    }
  }
})