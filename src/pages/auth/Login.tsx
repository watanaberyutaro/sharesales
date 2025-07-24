import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useSupabaseStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(formData.email, formData.password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'ログインに失敗しました')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mono-lightest px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold kontext-gradient-text mb-2">
            SHARE最強営業ツール
          </h1>
          <p className="text-mono-medium">ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="kontext-card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

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

          <div className="mb-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full kontext-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ログイン中...
              </>
            ) : (
              'ログイン'
            )}
          </button>

          <div className="mt-4 text-center text-sm">
            <span className="text-mono-medium">アカウントをお持ちでない方は</span>
            <Link to="/register" className="text-kontext-blue hover:underline ml-1">
              新規登録
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}