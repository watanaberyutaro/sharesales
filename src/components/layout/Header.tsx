import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { user, signOut } = useSupabaseStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'ダッシュボード', href: '/', icon: Home },
    {
      name: '探す',
      items: [
        { name: '案件', href: '/jobs', icon: BriefcaseIcon },
        { name: '人材', href: '/talents', icon: Users },
        { name: 'パートナー企業', href: '/partners', icon: Building2 },
      ],
    },
    {
      name: '投稿管理',
      items: [
        { name: '投稿した案件', href: '/my-jobs', icon: BriefcaseIcon },
        { name: '登録した人材', href: '/my-talents', icon: Users },
        { name: '登録した企業', href: '/my-partners', icon: Building2 },
      ],
    },
    {
      name: 'マッチング',
      items: [
        { name: 'マッチング一覧', href: '/matches', icon: Users },
        { name: 'アサイン管理', href: '/assignments', icon: BriefcaseIcon },
      ],
    },
    {
      name: 'コミュニケーション',
      items: [
        { name: 'DM', href: '/messages', icon: MessageSquare },
        { name: 'タイムライン', href: '/timeline', icon: MessageSquare },
      ],
    },
  ]

  const quickActions = [
    { name: '案件を投稿', href: '/jobs/new', icon: BriefcaseIcon },
    { name: '人材を登録', href: '/talents/new', icon: Users },
    { name: 'パートナー企業を登録', href: '/partners/new', icon: Building2 },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SHARE最強営業ツール
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.items ? (
                  <>
                    <button className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 font-medium">
                      {item.name}
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="flex items-center px-4 py-3 first:rounded-t-xl last:rounded-b-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <subItem.icon className="w-4 h-4 mr-3 text-gray-400" />
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.href}
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="relative group">
              <button className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="新規作成">
                <Plus className="w-5 h-5" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center px-4 py-3 first:rounded-t-xl last:rounded-b-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <action.icon className="w-4 h-4 mr-3 text-gray-400" />
                    {action.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <Link to="/notifications" className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative" title="通知">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-3 text-gray-400" />
                    お気に入り
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    設定
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-purple-500" />
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-mono-dark"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-mono-lighter">
          <div className="px-4 py-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.items ? (
                  <>
                    <div className="py-2 text-sm font-medium text-mono-dark">
                      {item.name}
                    </div>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-mono-medium hover:text-kontext-blue transition-colors"
                      >
                        <subItem.icon className="w-4 h-4 mr-2" />
                        {subItem.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-mono-dark hover:text-kontext-blue transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="border-t border-mono-lighter mt-2 pt-2">
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-2 text-sm text-mono-dark hover:text-kontext-blue transition-colors"
              >
                <Heart className="w-4 h-4 mr-2" />
                お気に入り
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-2 text-sm text-mono-dark hover:text-kontext-blue transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                設定
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center py-2 text-sm text-mono-dark hover:text-kontext-blue transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  管理画面
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center py-2 text-sm text-mono-dark hover:text-kontext-blue transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}