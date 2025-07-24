import { useState } from 'react'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import NotificationSettings from '@/components/pwa/NotificationSettings'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  HelpCircle,
  LogOut,
  Edit,
  Save,
  X,
  Camera,
  Upload,
} from 'lucide-react'

export default function Settings() {
  const { user, signOut, updateProfile } = useSupabaseStore()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルのみアップロード可能です')
      return
    }

    setAvatarFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      let updatedData = { ...profileData }
      
      // If avatar file is selected, create a mock URL for demo
      if (avatarFile) {
        // In real app, you would upload to cloud storage and get URL
        updatedData.avatar = avatarPreview || undefined
      }
      
      const result = await updateProfile(updatedData)
      if (result.success) {
        setEditingProfile(false)
        setAvatarFile(null)
        alert('プロフィールを更新しました')
      } else {
        alert('更新に失敗しました: ' + result.error)
      }
    } catch (error) {
      alert('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await signOut()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="w-7 h-7 mr-3 text-blue-600" />
          設定
        </h1>
        <p className="text-gray-600 mt-1">アカウントとアプリの設定を管理します</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              プロフィール
            </h2>
            {!editingProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleProfileUpdate}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProfile(false)
                    setProfileData({
                      name: user?.name || '',
                      email: user?.email || '',
                    })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="プロフィール画像" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                {editingProfile && (
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="画像を変更"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">プロフィール画像</p>
                <p className="text-sm text-gray-500">JPG、PNG、GIF形式をサポート（最大5MB）</p>
                {!editingProfile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    画像を選択
                  </Button>
                )}
                {avatarFile && (
                  <p className="text-xs text-green-600 mt-1">
                    選択済み: {avatarFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                名前
              </label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="お名前を入力してください"
                />
              ) : (
                <p className="py-2 text-gray-900">{user?.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                メールアドレス
              </label>
              {editingProfile ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="メールアドレスを入力してください"
                />
              ) : (
                <p className="py-2 text-gray-900">{user?.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                権限
              </label>
              <Badge className={user?.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-gray-100 text-gray-700 border-gray-300'}>
                {user?.role === 'admin' ? '管理者' : '一般ユーザー'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <NotificationSettings />

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            セキュリティ
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
              <div>
                <p className="font-medium text-mono-darkest">パスワード</p>
                <p className="text-sm text-mono-medium">最後の変更: 30日前</p>
              </div>
              <Button variant="outline" size="sm">
                変更
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
              <div>
                <p className="font-medium text-mono-darkest">二段階認証</p>
                <p className="text-sm text-mono-medium">セキュリティを強化</p>
              </div>
              <Badge variant="outline">未設定</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
              <div>
                <p className="font-medium text-mono-darkest">ログイン履歴</p>
                <p className="text-sm text-mono-medium">最近のログイン履歴を確認</p>
              </div>
              <Button variant="outline" size="sm">
                表示
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            アプリ設定
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-mono-medium" />
                <div>
                  <p className="font-medium text-mono-darkest">テーマ</p>
                  <p className="text-sm text-mono-medium">外観をカスタマイズ</p>
                </div>
              </div>
              <select className="px-3 py-1 border border-mono-lighter rounded text-sm">
                <option>ライト</option>
                <option>ダーク</option>
                <option>自動</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-mono-medium" />
                <div>
                  <p className="font-medium text-mono-darkest">言語</p>
                  <p className="text-sm text-mono-medium">表示言語を選択</p>
                </div>
              </div>
              <select className="px-3 py-1 border border-mono-lighter rounded text-sm">
                <option>日本語</option>
                <option>English</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-mono-medium" />
                <div>
                  <p className="font-medium text-mono-darkest">オフライン同期</p>
                  <p className="text-sm text-mono-medium">データを自動同期</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-kontext-blue" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            ヘルプ・サポート
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              よくある質問
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              利用規約
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              プライバシーポリシー
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              お問い合わせ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              アカウントを削除
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-mono-medium space-y-1">
            <p>SHARE最強営業ツール</p>
            <p>バージョン 1.0.0</p>
            <p>© 2024 SHARE Corporation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}