import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import {
  Menu,
  X,
  Home,
  BriefcaseIcon,
  Users,
  Building2,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Plus,
  User,
  Target,
  Clock,
  Shield,
  Search,
  Calendar,
  TrendingUp,
  Activity,
} from 'lucide-react'

export default function GlobalMenu() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useSupabaseStore()
  const [isOpen, setIsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setIsOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    if (isOpen || profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, profileMenuOpen])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setProfileMenuOpen(false)
  }, [location.pathname])

  const menuItems = [
    {
      category: 'メイン',
      items: [
        { name: 'ダッシュボード', href: '/', icon: Home },
        { name: 'お気に入り', href: '/favorites', icon: Heart },
        { name: '通知', href: '/notifications', icon: Bell },
        { name: 'タイムライン', href: '/timeline', icon: Clock },
      ],
    },
    {
      category: '探す・検索',
      items: [
        { name: '案件を探す', href: '/jobs', icon: BriefcaseIcon },
        { name: '人材を探す', href: '/talents', icon: Users },
        { name: 'パートナー企業', href: '/partners', icon: Building2 },
        { name: '検索', href: '/search', icon: Search },
      ],
    },
    {
      category: '投稿・管理',
      items: [
        { name: '投稿した案件', href: '/my-jobs', icon: BriefcaseIcon },
        { name: '登録した人材', href: '/my-talents', icon: Users },
        { name: '登録した企業', href: '/my-partners', icon: Building2 },
      ],
    },
    {
      category: 'マッチング・営業',
      items: [
        { name: 'マッチング一覧', href: '/matches', icon: Target },
        { name: 'アサイン管理', href: '/assignments', icon: Calendar },
        { name: '営業活動', href: '/sales', icon: TrendingUp },
        { name: 'レポート', href: '/reports', icon: Activity },
      ],
    },
    {
      category: 'コミュニケーション',
      items: [
        { name: 'DM・メッセージ', href: '/messages', icon: MessageSquare },
        { name: 'チャットルーム', href: '/chat-rooms', icon: MessageSquare },
      ],
    },
    {
      category: '新規作成',
      items: [
        { name: '案件を投稿', href: '/jobs/new', icon: Plus },
        { name: '人材を登録', href: '/talents/new', icon: Plus },
        { name: 'パートナー企業を登録', href: '/partners/new', icon: Plus },
      ],
    },
  ]

  const adminItems = [
    { name: '管理ダッシュボード', href: '/admin', icon: Shield },
    { name: 'ユーザー管理', href: '/admin/users', icon: Users },
    { name: 'コンテンツ管理', href: '/admin/content', icon: BriefcaseIcon },
  ]

  const isCurrentPath = (href: string) => {
    return location.pathname === href
  }

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="メニューを開く"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center: Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SHARE営業ツール
            </h1>
          </Link>

          {/* Right: Profile Menu and Notifications */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Link 
              to="/notifications" 
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative" 
              title="通知"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Link>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-1 text-gray-700 hover:text-blue-600 transition-colors"
                title="プロフィールメニュー"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'ユーザー'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/favorites"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-3 text-gray-400" />
                    お気に入り
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    設定
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-3 text-purple-500" />
                      管理画面
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 rounded-b-xl"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-500" />
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[55] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[60] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">S</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SHARE営業ツール</h2>
                <p className="text-blue-100 text-sm">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {menuItems.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCurrentPath(item.href)
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${
                          isCurrentPath(item.href) ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Admin Section */}
              {user?.role === 'admin' && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">
                    管理者機能
                  </h3>
                  <div className="space-y-1">
                    {adminItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCurrentPath(item.href)
                            ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                            : 'text-purple-600 hover:bg-purple-50 hover:text-purple-800'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${
                          isCurrentPath(item.href) ? 'text-purple-600' : 'text-purple-400'
                        }`} />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrentPath('/settings')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5 mr-3 text-gray-400" />
              設定
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 text-red-500" />
              ログアウト
            </button>

            {/* User Info */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}