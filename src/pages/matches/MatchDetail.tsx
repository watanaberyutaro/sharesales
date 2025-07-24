import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import ChatButton from '@/components/match/ChatButton'
import {
  ArrowLeft,
  Users,
  BriefcaseIcon,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  User,
  FileText,
} from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime, getStatusLabel } from '@/utils/formatters'
import { calculateProfit, calculateEachProfit, generateMatchId } from '@/utils/matchUtils'
import { Match } from '@/types/database'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { matches, updateMatch, addAssignment } = useDataStore()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(false)
  const [contractNote, setContractNote] = useState('')

  useEffect(() => {
    if (id) {
      const foundMatch = matches.find(m => m.id === id)
      setMatch(foundMatch || null)
    }
  }, [id, matches])

  const handleMatchAction = async (status: 'accepted' | 'rejected') => {
    if (!match) return

    setLoading(true)
    const result = await updateMatch(match.id, { status })
    
    if (result.success) {
      setMatch({ ...match, status })
    } else {
      alert('操作に失敗しました')
    }
    
    setLoading(false)
  }

  const handleCreateContract = async () => {
    if (!match || !match.job_post || !match.talent_profile) return

    setLoading(true)

    // マッチステータスを契約済みに更新
    const matchResult = await updateMatch(match.id, { 
      status: 'contracted',
      assignment_type: 'ongoing' // デフォルトで継続案件
    })

    if (matchResult.success) {
      // アサインメントを作成
      const profit = calculateProfit(
        match.job_post.budget,
        match.talent_profile.rate,
        match.job_post.work_days
      )
      const eachProfit = calculateEachProfit(profit)

      const assignmentResult = await addAssignment({
        match_id: match.id,
        job_post_id: match.job_post.id,
        talent_profile_id: match.talent_profile.id,
        client_user_id: match.job_post.user_id,
        talent_user_id: match.talent_profile.user_id,
        status: 'active',
        monthly_profit: eachProfit,
        total_profit: eachProfit,
        notes: contractNote,
      })

      if (assignmentResult.success) {
        navigate('/assignments')
      } else {
        alert('アサインメント作成に失敗しました')
      }
    } else {
      alert('契約処理に失敗しました')
    }

    setLoading(false)
  }

  const canTakeAction = () => {
    if (!match || match.status !== 'pending') return false
    return match.proposer_id !== user?.id
  }

  const canCreateContract = () => {
    if (!match || match.status !== 'accepted') return false
    return match.proposer_id === user?.id || 
           (match.job_post?.user_id === user?.id) ||
           (match.talent_profile?.user_id === user?.id)
  }

  if (!match) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-mono-medium">マッチングが見つかりませんでした</p>
          </div>
        </Card>
      </div>
    )
  }

  const profit = match.job_post && match.talent_profile 
    ? calculateProfit(match.job_post.budget, match.talent_profile.rate, match.job_post.work_days)
    : 0
  const eachProfit = calculateEachProfit(profit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-mono-darkest">マッチング詳細</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={match.status === 'pending' ? 'warning' : match.status === 'accepted' ? 'success' : match.status === 'rejected' ? 'error' : 'primary'}>
                {getStatusLabel(match.status)}
              </Badge>
              {match.proposer_id === user?.id && (
                <Badge variant="primary">あなたが提案</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canTakeAction() && (
            <>
              <Button
                onClick={() => handleMatchAction('accepted')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                承認
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMatchAction('rejected')}
                disabled={loading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <XCircle className="w-4 h-4 mr-2" />
                却下
              </Button>
            </>
          )}

          {canCreateContract() && (
            <Button
              onClick={handleCreateContract}
              disabled={loading}
              className="bg-kontext-blue hover:bg-kontext-blue-dark text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              契約作成
            </Button>
          )}

          {match.status === 'accepted' && (
            <ChatButton match={match} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-mono-darkest">案件情報</h3>
                <Link
                  to={`/jobs/${match.job_post?.id}`}
                  className="text-sm text-kontext-blue hover:underline"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-mono-darkest mb-1">{match.job_post?.title}</h4>
                <p className="text-sm text-mono-medium line-clamp-3">{match.job_post?.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-mono-medium">予算</div>
                  <div className="font-semibold text-kontext-blue">
                    {formatCurrency(match.job_post?.budget || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-mono-medium">稼働日数</div>
                  <div className="font-semibold">{match.job_post?.work_days}日</div>
                </div>
                <div>
                  <div className="text-mono-medium">勤務地</div>
                  <div className="font-semibold">{match.job_post?.location}</div>
                </div>
                <div>
                  <div className="text-mono-medium">日額換算</div>
                  <div className="font-semibold">
                    {match.job_post ? formatCurrency(
                      match.job_post.daily_rate || (match.job_post.budget / match.job_post.work_days)
                    ) : '-'}
                  </div>
                </div>
              </div>

              {match.job_post?.skill_tags && match.job_post.skill_tags.length > 0 && (
                <div>
                  <div className="text-sm text-mono-medium mb-2">必要スキル</div>
                  <div className="flex flex-wrap gap-1">
                    {match.job_post.skill_tags.map(skill => (
                      <Badge key={skill} variant="primary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Talent Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-mono-darkest">人材情報</h3>
                <Link
                  to={`/talents/${match.talent_profile?.id}`}
                  className="text-sm text-kontext-blue hover:underline"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-mono-darkest mb-1">{match.talent_profile?.name}</h4>
                <p className="text-sm text-mono-medium line-clamp-3">{match.talent_profile?.bio}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-mono-medium">希望日額</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(match.talent_profile?.rate || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-mono-medium">経験年数</div>
                  <div className="font-semibold">{match.talent_profile?.experience_years}年</div>
                </div>
                <div>
                  <div className="text-mono-medium">勤務可能地域</div>
                  <div className="font-semibold">{match.talent_profile?.location}</div>
                </div>
                <div>
                  <div className="text-mono-medium">ステータス</div>
                  <div className="font-semibold">
                    {getStatusLabel(match.talent_profile?.status || '')}
                  </div>
                </div>
              </div>

              {match.talent_profile?.skills && match.talent_profile.skills.length > 0 && (
                <div>
                  <div className="text-sm text-mono-medium mb-2">スキル</div>
                  <div className="flex flex-wrap gap-1">
                    {match.talent_profile.skills.map(skill => (
                      <Badge key={skill} variant="success" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Calculation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-kontext-blue" />
            <h3 className="text-lg font-semibold text-mono-darkest">利益計算</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">案件予算</div>
              <div className="text-xl font-bold text-blue-700">
                {formatCurrency(match.job_post?.budget || 0)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">人材コスト</div>
              <div className="text-xl font-bold text-green-700">
                {formatCurrency((match.talent_profile?.rate || 0) * (match.job_post?.work_days || 0))}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">総利益</div>
              <div className="text-xl font-bold text-purple-700">
                {formatCurrency(profit)}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 mb-1">各自の利益</div>
              <div className="text-xl font-bold text-orange-700">
                {formatCurrency(eachProfit)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Details */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-mono-darkest">マッチング詳細</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-mono-medium" />
                <div>
                  <span className="text-mono-medium">提案者: </span>
                  <span className="font-medium">
                    {match.proposer_id === user?.id ? 'あなた' : '相手方'}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-mono-medium" />
                <div>
                  <span className="text-mono-medium">提案日時: </span>
                  <span className="font-medium">{formatDate(match.created_at)}</span>
                </div>
              </div>
            </div>

            {match.message && (
              <div>
                <div className="text-sm text-mono-medium mb-2">メッセージ</div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-blue-800">{match.message}</p>
                </div>
              </div>
            )}

            {canCreateContract() && match.status === 'accepted' && (
              <div>
                <label className="block text-sm font-medium text-mono-dark mb-2">
                  契約メモ（任意）
                </label>
                <textarea
                  value={contractNote}
                  onChange={(e) => setContractNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                  placeholder="契約に関する特記事項があれば記入してください..."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}