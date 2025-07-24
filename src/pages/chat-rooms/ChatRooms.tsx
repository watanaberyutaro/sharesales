import { useState } from 'react'
import { MessageSquare, Users, Plus, Search, Pin, Hash, Lock, Globe } from 'lucide-react'

interface ChatRoom {
  id: string
  name: string
  description: string
  type: 'public' | 'private' | 'direct'
  memberCount: number
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
  }
  unreadCount: number
  isPinned: boolean
}

export default function ChatRooms() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'public' | 'private' | 'direct'>('all')
  
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: '全体チャット',
      description: '全メンバーが参加する一般的な情報共有チャット',
      type: 'public',
      memberCount: 47,
      lastMessage: {
        content: 'お疲れ様です！新しい案件情報を共有します。',
        sender: '田中',
        timestamp: '2024-01-15T14:30:00Z'
      },
      unreadCount: 3,
      isPinned: true
    },
    {
      id: '2',
      name: 'React開発チーム',
      description: 'React案件に関する技術的な議論とマッチング',
      type: 'public',
      memberCount: 12,
      lastMessage: {
        content: 'Next.js 14の新機能について議論しましょう',
        sender: '佐藤',
        timestamp: '2024-01-15T13:45:00Z'
      },
      unreadCount: 0,
      isPinned: false
    },
    {
      id: '3',
      name: '管理者グループ',
      description: '管理者のみのプライベートチャット',
      type: 'private',
      memberCount: 5,
      lastMessage: {
        content: '来月のシステムメンテナンスについて',
        sender: '山田',
        timestamp: '2024-01-15T12:20:00Z'
      },
      unreadCount: 1,
      isPinned: true
    },
    {
      id: '4',
      name: '鈴木 一郎',
      description: '',
      type: 'direct',
      memberCount: 2,
      lastMessage: {
        content: '案件の詳細について確認したいことがあります',
        sender: '鈴木',
        timestamp: '2024-01-15T11:15:00Z'
      },
      unreadCount: 2,
      isPinned: false
    },
    {
      id: '5',
      name: 'Python開発者コミュニティ',
      description: 'Python関連の案件とスキル情報の共有',
      type: 'public',
      memberCount: 23,
      lastMessage: {
        content: 'Django vs FastAPI の議論が熱いですね',
        sender: '高橋',
        timestamp: '2024-01-15T10:30:00Z'
      },
      unreadCount: 0,
      isPinned: false
    }
  ])

  const filteredRooms = chatRooms.filter(room => {
    const matchesCategory = selectedCategory === 'all' || room.type === selectedCategory
    const matchesSearch = searchQuery === '' || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const pinnedRooms = filteredRooms.filter(room => room.isPinned)
  const unpinnedRooms = filteredRooms.filter(room => !room.isPinned)

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Hash className="w-5 h-5 text-green-600" />
      case 'private':
        return <Lock className="w-5 h-5 text-orange-600" />
      case 'direct':
        return <MessageSquare className="w-5 h-5 text-blue-600" />
      default:
        return <Globe className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'public':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">パブリック</span>
      case 'private':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">プライベート</span>
      case 'direct':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">DM</span>
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}分前`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}時間前`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}日前`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">チャットルーム</h1>
            <p className="text-gray-600 mt-2">チーム・プロジェクト・個人チャットの管理</p>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            新規ルーム作成
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="チャットルームを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">カテゴリ:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'すべて' },
                  { key: 'public', label: 'パブリック' },
                  { key: 'private', label: 'プライベート' },
                  { key: 'direct', label: 'DM' }
                ].map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedCategory === category.key
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Rooms */}
        {pinnedRooms.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Pin className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">ピン留めされたルーム</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-yellow-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getRoomIcon(room.type)}
                      <div>
                        <h3 className="font-medium text-gray-900">{room.name}</h3>
                        {getTypeBadge(room.type)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Pin className="w-4 h-4 text-yellow-500" />
                      {room.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {room.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                  )}
                  
                  {room.lastMessage && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        <span className="font-medium">{room.lastMessage.sender}:</span> {room.lastMessage.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTimestamp(room.lastMessage.timestamp)}</span>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {room.memberCount}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Rooms */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">すべてのチャットルーム</h2>
          
          {unpinnedRooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">チャットルームが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更するか、新しいルームを作成してください。</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {unpinnedRooms.map((room) => (
                <div key={room.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getRoomIcon(room.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                          {getTypeBadge(room.type)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-4 h-4 mr-1" />
                            {room.memberCount}
                          </div>
                          {room.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {room.description && (
                        <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                      )}
                      
                      {room.lastMessage && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">{room.lastMessage.sender}:</span> {room.lastMessage.content}
                          <span className="ml-2">• {formatTimestamp(room.lastMessage.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}