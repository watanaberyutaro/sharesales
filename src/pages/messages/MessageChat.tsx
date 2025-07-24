import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Send,
  Users,
  User,
  CheckCircle,
} from 'lucide-react'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters'
import { ChatRoom, ChatMessage } from '@/types/database'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'

export default function MessageChat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { chatRooms, chatMessages, fetchChatMessages, sendMessage } = useDataStore()
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mockMessages, setMockMessages] = useState<any[]>([])
  
  // Enable real-time chat updates
  useRealtimeChat(id || null)

  useEffect(() => {
    if (id && user) {
      let foundRoom = chatRooms.find(r => r.id === id)
      
      // If not found in real data, create mock room
      if (!foundRoom) {
        const mockRoomNames: Record<string, string> = {
          'room-1': '田中さんとの案件について',
          'room-2': 'Webデザイナー募集の件',
          'room-3': 'マーケティング支援について',
        }
        
        foundRoom = {
          id,
          name: mockRoomNames[id] || 'チャットルーム',
          participant_ids: [user.id, 'other-user'],
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
        
        // Create mock messages
        const mockChatMessages = [
          {
            id: 'msg-1',
            room_id: id,
            sender_id: 'other-user',
            message: 'こんにちは！案件の件でご連絡いたしました。',
            message_type: 'text',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            sender: { id: 'other-user', name: '田中太郎', email: 'tanaka@example.com' },
          },
          {
            id: 'msg-2',
            room_id: id,
            sender_id: user.id,
            message: 'こんにちは！こちらこそ、よろしくお願いします。',
            message_type: 'text',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            sender: user,
          },
          {
            id: 'msg-3',
            room_id: id,
            sender_id: 'other-user',
            message: '早速ですが、案件の詳細について教えていただけますでしょうか？\n特に以下の点が気になっています：\n・期間\n・予算\n・必要なスキル',
            message_type: 'text',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            sender: { id: 'other-user', name: '田中太郎', email: 'tanaka@example.com' },
          },
        ]
        
        setMockMessages(mockChatMessages)
      }
      
      setRoom(foundRoom)
      
      if (foundRoom && chatRooms.find(r => r.id === id)) {
        fetchChatMessages(foundRoom.id)
      }
    }
  }, [id, chatRooms, fetchChatMessages, user])

  useEffect(() => {
    if (id) {
      const realMessages = chatMessages[id] || []
      const allMessages = [...realMessages, ...mockMessages]
      setMessages(allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))
    }
  }, [id, chatMessages, mockMessages])

  useEffect(() => {
    // スクロールを最下部に移動
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !room || !user) return

    setLoading(true)
    
    // Try to send real message, but also add to mock messages for demo
    const result = await sendMessage(room.id, newMessage.trim(), user.id)
    
    if (result.success) {
      setNewMessage('')
    } else {
      // For demo purposes, add to mock messages even if real send fails
      const newMockMessage = {
        id: `mock-${Date.now()}`,
        room_id: room.id,
        sender_id: user.id,
        message: newMessage.trim(),
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
        sender: user,
      }
      
      setMockMessages(prev => [...prev, newMockMessage])
      setNewMessage('')
    }
    
    setLoading(false)
  }

  const isMyMessage = (message: ChatMessage) => {
    return message.sender_id === user?.id
  }

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return 'システム'
      case 'approval_request': return '承認依頼'
      default: return ''
    }
  }

  if (!room) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-mono-medium">チャットルームが見つかりませんでした</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{room.name}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                オンライン
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  message.message_type === 'system'
                    ? 'bg-gray-200 text-gray-700 text-center mx-auto'
                    : message.message_type === 'approval_request'
                    ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                    : isMyMessage(message)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {/* Message Type Label */}
                {message.message_type !== 'text' && (
                  <div className="text-xs font-medium mb-1">
                    {getMessageTypeLabel(message.message_type)}
                  </div>
                )}

                {/* Sender Name (for other people's messages) */}
                {!isMyMessage(message) && message.message_type === 'text' && (
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    {message.sender?.name}
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap break-words">
                  {message.message}
                </div>

                {/* Timestamp */}
                <div
                  className={`text-xs mt-2 ${
                    isMyMessage(message) && message.message_type === 'text'
                      ? 'text-blue-100'
                      : 'text-gray-400'
                  }`}
                >
                  {formatDateTime(message.created_at)}
                </div>

                {/* Read Status (for my messages) */}
                {isMyMessage(message) && message.is_read && (
                  <div className="flex justify-end mt-1">
                    <CheckCircle className="w-3 h-3 text-blue-200" />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">まだメッセージがありません</p>
            <p className="text-gray-400 text-sm mt-1">最初のメッセージを送信しましょう</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-6 py-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}