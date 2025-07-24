import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useDataStore } from '@/stores/dataStore'
import { ChatMessage } from '@/types/database'

export function useRealtimeChat(roomId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const { fetchChatMessages } = useDataStore()

  useEffect(() => {
    if (!roomId) return

    // Subscribe to chat messages for this room
    channelRef.current = supabase.channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('New message received:', payload)
          // Refresh messages to get updated data with user info
          fetchChatMessages(roomId)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [roomId, fetchChatMessages])

  return channelRef.current
}