import { useNavigate } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { LogOut, Clock } from 'lucide-react'

export default function ApprovalPending() {
  const navigate = useNavigate()
  const { signOut } = useSupabaseStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mono-lightest px-4">
      <div className="max-w-md w-full text-center">
        <div className="kontext-card">
          <div className="mb-6">
            <div className="w-20 h-20 bg-kontext-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-kontext-blue" />
            </div>
            <h1 className="text-2xl font-bold text-mono-darkest mb-2">
              承認待ちです
            </h1>
            <p className="text-mono-medium">
              管理者があなたのアカウントを承認するまでお待ちください。
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-mono-dark">
              通常、承認には1〜2営業日かかります。承認されましたら、メールでお知らせいたします。
            </p>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center px-4 py-2 border border-mono-lighter rounded-md hover:bg-mono-lightest transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}