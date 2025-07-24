import { useState } from 'react'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MessageSquare, Loader2, TrendingUp } from 'lucide-react'
import { generateMatchId, calculateMatchScore, getMatchScoreLabel, getMatchScoreColor } from '@/utils/matchUtils'
import { JobPost, TalentProfile } from '@/types/database'

interface MatchProposalButtonProps {
  job?: JobPost
  talent?: TalentProfile
  onSuccess?: () => void
}

export default function MatchProposalButton({ job, talent, onSuccess }: MatchProposalButtonProps) {
  const { user } = useSupabaseStore()
  const { addMatch } = useDataStore()
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!job || !talent || !user) return null

  const matchScore = calculateMatchScore(job, talent)
  const matchId = generateMatchId(job.id, talent.id)

  // マッチング提案できるのは案件または人材の所有者以外
  const canPropose = job.user_id !== user.id && talent.user_id !== user.id

  if (!canPropose) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await addMatch({
      id: matchId,
      job_post_id: job.id,
      talent_profile_id: talent.id,
      proposer_id: user.id,
      proposer_type: job.user_id === user.id ? 'client' : 'talent',
      message: message.trim() || undefined,
      status: 'pending',
    })

    if (result.success) {
      setShowForm(false)
      setMessage('')
      onSuccess?.()
    } else {
      alert('マッチング提案に失敗しました')
    }

    setLoading(false)
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="bg-mono-lightest rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-mono-darkest">マッチング提案</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getMatchScoreColor(matchScore)}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {getMatchScoreLabel(matchScore)} ({matchScore}%)
              </Badge>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-dark mb-2">
                メッセージ（任意）
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="マッチング提案の理由や詳細があれば記入してください..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    提案を送信
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant={getMatchScoreColor(matchScore)}>
          <TrendingUp className="w-3 h-3 mr-1" />
          {getMatchScoreLabel(matchScore)} ({matchScore}%)
        </Badge>
      </div>
      
      <Button
        onClick={() => setShowForm(true)}
        className="w-full"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        マッチング提案
      </Button>
    </div>
  )
}