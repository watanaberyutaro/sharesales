import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Users,
  BriefcaseIcon,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, getStatusLabel } from '@/utils/formatters'
import { calculateProfit, calculateEachProfit } from '@/utils/matchUtils'

export default function MatchList() {
  const { user } = useSupabaseStore()
  const { matches, fetchMatches, updateMatch, getMatchesForUser } = useDataStore()
  const [loading, setLoading] = useState<string | null>(null)

  const userMatches = getMatchesForUser(user?.id || '')

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const handleMatchAction = async (matchId: string, status: 'accepted' | 'rejected') => {
    setLoading(matchId)
    
    const result = await updateMatch(matchId, { status })
    
    if (!result.success) {
      alert('操作に失敗しました')
    }
    
    setLoading(null)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'error',
      contracted: 'primary',
      completed: 'primary',
      assigned: 'primary',
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const canTakeAction = (match: any) => {
    if (match.status !== 'pending') return false
    
    // 提案者以外がアクションを取れる
    return match.proposer_id !== user?.id
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-mono-darkest">マッチング一覧</h1>
        <p className="text-mono-medium">案件と人材のマッチング状況を管理</p>
      </div>

      {/* Match Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { status: 'pending', label: '承認待ち', icon: Clock, color: 'warning' },
          { status: 'accepted', label: '承認済み', icon: CheckCircle, color: 'success' },
          { status: 'contracted', label: '契約済み', icon: TrendingUp, color: 'primary' },
          { status: 'completed', label: '完了', icon: CheckCircle, color: 'primary' },
        ].map((stat) => (
          <Card key={stat.status}>
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 text-${stat.color === 'warning' ? 'yellow' : stat.color === 'success' ? 'green' : 'kontext-blue'}-500`} />
              <div>
                <div className="text-2xl font-bold text-mono-darkest">
                  {userMatches.filter(m => m.status === stat.status).length}
                </div>
                <div className="text-sm text-mono-medium">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {userMatches.length > 0 ? (
          userMatches.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getStatusColor(match.status) as any}>
                      {getStatusLabel(match.status)}
                    </Badge>
                    {match.proposer_id === user?.id && (
                      <Badge variant="primary">あなたが提案</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Job Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-mono-medium mb-1">案件</div>
                        <Link
                          to={`/jobs/${match.job_post?.id}`}
                          className="font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                        >
                          {match.job_post?.title}
                        </Link>
                        <div className="text-sm text-mono-medium mt-1">
                          予算: {formatCurrency(match.job_post?.budget || 0)} / {match.job_post?.work_days}日
                        </div>
                      </div>
                    </div>

                    {/* Talent Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-mono-medium mb-1">人材</div>
                        <Link
                          to={`/talents/${match.talent_profile?.id}`}
                          className="font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                        >
                          {match.talent_profile?.name}
                        </Link>
                        <div className="text-sm text-mono-medium mt-1">
                          日額: {formatCurrency(match.talent_profile?.rate || 0)} / {match.talent_profile?.experience_years}年経験
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profit Calculation */}
                  {match.job_post && match.talent_profile && (
                    <div className="bg-mono-lightest rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center text-kontext-blue font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          予想利益: {formatCurrency(calculateProfit(
                            match.job_post.budget,
                            match.talent_profile.rate,
                            match.job_post.work_days
                          ))}
                        </div>
                        <div className="text-mono-medium">
                          各自: {formatCurrency(calculateEachProfit(calculateProfit(
                            match.job_post.budget,
                            match.talent_profile.rate,
                            match.job_post.work_days
                          )))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {match.message && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                      <p className="text-sm text-blue-800">{match.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-mono-medium">
                      {formatRelativeTime(match.created_at)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/matches/${match.id}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          詳細
                        </Button>
                      </Link>

                      {canTakeAction(match) && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMatchAction(match.id, 'accepted')}
                            disabled={loading === match.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            承認
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMatchAction(match.id, 'rejected')}
                            disabled={loading === match.id}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            却下
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-mono-light mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mono-darkest mb-2">
                マッチングがまだありません
              </h3>
              <p className="text-mono-medium mb-4">
                案件や人材の詳細ページからマッチング提案を行いましょう
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/jobs">
                  <Button variant="outline">案件を探す</Button>
                </Link>
                <Link to="/talents">
                  <Button variant="outline">人材を探す</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}