import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Loader2 } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useSupabaseStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'client',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)

    const result = await signUp(formData.email, formData.password, formData.name, formData.role)

    if (result.success) {
      navigate('/approval-pending')
    } else {
      setError(result.error || '登録に失敗しました')
    }

    setLoading(false)
  }

  const roles = [
    { value: 'client', label: 'クライアント' },
    { value: 'supplier', label: 'サプライヤー' },
    { value: '営業1番隊', label: '営業1番隊' },
    { value: '営業2番隊', label: '営業2番隊' },
    { value: '営業3番隊', label: '営業3番隊' },
    { value: '営業1番隊隊長', label: '営業1番隊隊長' },
    { value: '営業2番隊隊長', label: '営業2番隊隊長' },
    { value: '営業3番隊隊長', label: '営業3番隊隊長' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-mono-lightest px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold kontext-gradient-text mb-2">
            SHARE最強営業ツール
          </h1>
          <p className="text-mono-medium">新規登録</p>
        </div>

        <form onSubmit={handleSubmit} className="kontext-card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-mono-dark mb-1">
              お名前
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="山田太郎"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-mono-dark mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="name@example.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-mono-dark mb-1">
              役割
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-mono-dark mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-mono-dark mb-1">
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full kontext-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                登録中...
              </>
            ) : (
              '登録'
            )}
          </button>

          <div className="mt-4 text-center text-sm">
            <span className="text-mono-medium">すでにアカウントをお持ちの方は</span>
            <Link to="/login" className="text-kontext-blue hover:underline ml-1">
              ログイン
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}