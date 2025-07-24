import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  User,
} from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'

export default function MessageList() {
  const { user } = useSupabaseStore()
  const { chatRooms, fetchChatRooms, getChatRoomsForUser } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [mockRooms, setMockRooms] = useState<any[]>([])

  // Create mock chat rooms for demo
  useEffect(() => {
    if (user) {
      const mockChatRooms = [
        {
          id: 'room-1',
          name: '田中さんとの案件について',
          participant_ids: [user.id, 'user-1'],
          last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: 'room-2', 
          name: 'Webデザイナー募集の件',
          participant_ids: [user.id, 'user-2'],
          last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: 'room-3',
          name: 'マーケティング支援について',
          participant_ids: [user.id, 'user-3'],
          last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ]
      setMockRooms(mockChatRooms)
      fetchChatRooms(user.id)
    }
  }, [user, fetchChatRooms])

  const userChatRooms = getChatRoomsForUser(user?.id || '')
  const allRooms = [...userChatRooms, ...mockRooms]

  const filteredRooms = allRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-7 h-7 mr-3 text-blue-600" />
            メッセージ
          </h1>
          <p className="text-gray-600 mt-1">チャットでコミュニケーションを取りましょう</p>
        </div>
        <Button onClick={() => alert('新しいチャット機能は実装中です')}>
          <Plus className="w-4 h-4 mr-2" />
          新しいチャット
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative p-4">
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="チャットを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Chat Rooms List */}
      <div className="space-y-2">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <Link key={room.id} to={`/messages/${room.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(room.last_message_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {room.participant_ids.length}名
                      </div>
                      
                      {/* 未読バッジ - デモ用にランダム表示 */}
                      {index === 0 && (
                        <Badge className="bg-red-100 text-red-800 border-red-300 text-xs animate-pulse">
                          未読 3
                        </Badge>
                      )}
                    </div>
                    
                    {/* Last message preview */}
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {index === 0 && 'よろしくお願いします。詳細について...'}
                      {index === 1 && '資料を確認しました。いくつか質問が...'}
                      {index === 2 && 'ありがとうございました。また連絡します。'}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '該当するチャットが見つかりませんでした' : 'まだチャットがありません'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? '検索条件を変更して再度お試しください'
                  : 'マッチングが成立すると、自動的にチャットルームが作成されます'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-4 justify-center">
                  <Link to="/matches">
                    <Button variant="outline">マッチング一覧を見る</Button>
                  </Link>
                  <Link to="/jobs">
                    <Button>案件を探す</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}