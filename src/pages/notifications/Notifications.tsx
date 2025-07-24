import { useState } from 'react'
import { Bell, BellRing, Check, X, Eye, Archive, Settings } from 'lucide-react'

interface Notification {
  id: string
  type: 'match' | 'message' | 'assignment' | 'system'
  title: string
  description: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'match',
      title: '新しいマッチが見つかりました',
      description: 'フロントエンドエンジニアの案件「React開発者募集」があなたの人材とマッチしました。',
      isRead: false,
      createdAt: '2024-01-15T10:30:00Z',
      actionUrl: '/matches/1'
    },
    {
      id: '2',
      type: 'message',
      title: '新しいメッセージ',
      description: '田中様からメッセージが届いています。',
      isRead: false,
      createdAt: '2024-01-15T09:15:00Z',
      actionUrl: '/messages/2'
    },
    {
      id: '3',
      type: 'assignment',
      title: 'アサイン完了',
      description: 'Python開発者の案件にアサインが完了しました。',
      isRead: true,
      createdAt: '2024-01-14T16:20:00Z',
      actionUrl: '/assignments'
    },
    {
      id: '4',
      type: 'system',
      title: 'システムメンテナンス',
      description: '1月20日 2:00-4:00にシステムメンテナンスを実施します。',
      isRead: true,
      createdAt: '2024-01-13T12:00:00Z'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return '🎯'
      case 'message': return '💬'
      case 'assignment': return '📋'
      case 'system': return '⚙️'
      default: return '📢'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return '数分前'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}時間前`
    } else {
      return `${Math.floor(diffInHours / 24)}日前`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">通知</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : '未読通知はありません'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  すべて既読
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              すべて ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                filter === 'unread'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              未読 ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? '未読通知はありません' : '通知はありません'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'すべての通知を既読にしました。' 
                  : '新しい通知が届くとここに表示されます。'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />
                        )}
                      </h3>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{notification.description}</p>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          既読にする
                        </button>
                      )}
                      
                      {notification.actionUrl && (
                        <button className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition-colors">
                          詳細を見る
                        </button>
                      )}
                      
                      <button className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                        <Archive className="w-3 h-3 mr-1" />
                        アーカイブ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}