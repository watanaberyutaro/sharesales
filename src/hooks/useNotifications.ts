import { useState, useEffect } from 'react'
import { useSupabaseStore } from '@/stores/supabaseStore'

interface NotificationState {
  permission: NotificationPermission
  isSupported: boolean
  isSubscribed: boolean
  requestPermission: () => Promise<boolean>
  subscribeToNotifications: () => Promise<boolean>
  unsubscribeFromNotifications: () => Promise<boolean>
  sendTestNotification: () => void
}

// VAPID keys for push notifications (これは実際のプロジェクトでは環境変数に設定)
const VAPID_PUBLIC_KEY = 'BHdBkOcHNUITUvPJW3zDMFBOXIL5nBpkH7jHcNxL2gNsRjGHgWPgJH8YtH2Jz9CvXmGNqTd9K8rL9B2fQ3dVjKw'

export function useNotifications(): NotificationState {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { user } = useSupabaseStore()

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission)
      checkSubscriptionStatus()
    }
  }, [isSupported])

  const checkSubscriptionStatus = async () => {
    if (!isSupported) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToNotifications = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Cannot subscribe: notifications not supported or permission not granted')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        console.error('Service worker not registered')
        return false
      }

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        setIsSubscribed(true)
        return true
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Send subscription to server
      await saveSubscriptionToServer(subscription)
      
      setIsSubscribed(true)
      console.log('Push notification subscription successful:', subscription)
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }

  const unsubscribeFromNotifications = async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return false

      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await removeSubscriptionFromServer(subscription)
        setIsSubscribed(false)
        console.log('Push notification unsubscription successful')
        return true
      }
      return false
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  const saveSubscriptionToServer = async (subscription: PushSubscription) => {
    if (!user) return

    try {
      // TODO: Save subscription to Supabase
      // This would typically involve calling an API endpoint or Edge Function
      console.log('Saving subscription to server:', {
        userId: user.id,
        subscription: subscription.toJSON()
      })
      
      // Example API call:
      // await supabase.from('push_subscriptions').upsert({
      //   user_id: user.id,
      //   endpoint: subscription.endpoint,
      //   keys: subscription.toJSON().keys
      // })
    } catch (error) {
      console.error('Error saving subscription to server:', error)
    }
  }

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    if (!user) return

    try {
      // TODO: Remove subscription from Supabase
      console.log('Removing subscription from server:', {
        userId: user.id,
        endpoint: subscription.endpoint
      })
      
      // Example API call:
      // await supabase.from('push_subscriptions')
      //   .delete()
      //   .eq('user_id', user.id)
      //   .eq('endpoint', subscription.endpoint)
    } catch (error) {
      console.error('Error removing subscription from server:', error)
    }
  }

  const sendTestNotification = () => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Cannot send test notification: not supported or permission not granted')
      return
    }

    // Send a local notification for testing
    new Notification('SHARE営業ツール', {
      body: 'テスト通知です。プッシュ通知が正常に動作しています！',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'アプリを開く'
        }
      ]
    })
  }

  return {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification
  }
}