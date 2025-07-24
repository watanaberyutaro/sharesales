import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Button } from '@/components/ui/Button'
import { MessageSquare } from 'lucide-react'
import { Match } from '@/types/database'

interface ChatButtonProps {
  match: Match
  onSuccess?: () => void
}

export default function ChatButton({ match, onSuccess }: ChatButtonProps) {
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { createChatRoom, chatRooms } = useDataStore()
  const [loading, setLoading] = useState(false)

  const handleCreateChat = async () => {
    if (!user || !match.job_post || !match.talent_profile) return

    setLoading(true)

    try {
      // Check if chat room already exists for this match
      const existingRoom = chatRooms.find(room => 
        room.participant_ids.includes(match.job_post?.user_id || '') &&
        room.participant_ids.includes(match.talent_profile?.user_id || '') &&
        room.name.includes(match.job_post?.title || '')
      )

      if (existingRoom) {
        navigate(`/messages/${existingRoom.id}`)
        return
      }

      // Create new chat room
      const participantIds = [
        match.job_post.user_id,
        match.talent_profile.user_id,
      ].filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates

      const chatName = `案件: ${match.job_post.title} - ${match.talent_profile.name}`

      const result = await createChatRoom(chatName, participantIds, 'direct')

      if (result.success && result.data) {
        navigate(`/messages/${result.data.id}`)
        onSuccess?.()
      } else {
        alert('チャットルームの作成に失敗しました')
      }
    } catch (error) {
      console.error('Chat creation error:', error)
      alert('チャットルームの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCreateChat}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      {loading ? 'チャット作成中...' : 'チャットを開く'}
    </Button>
  )
}