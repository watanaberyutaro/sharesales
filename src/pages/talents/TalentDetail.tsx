import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import MatchProposalButton from '@/components/match/MatchProposalButton'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  Flame,
  DollarSign,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime, getStatusLabel, getWorkTypeLabel } from '@/utils/formatters'
import { STATUS_COLORS } from '@/constants/talentOptions'
import { TalentProfile } from '@/types/database'

export default function TalentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { talentProfiles, jobPosts, deleteTalentProfile, toggleFavorite, getUserFavorites, getJobsByUser } = useDataStore()
  const [talent, setTalent] = useState<TalentProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string>('')

  const favorites = getUserFavorites(user?.id || '', 'talent')
  const userJobs = getJobsByUser(user?.id || '').filter(job => job.status === 'active')

  useEffect(() => {
    if (id) {
      const foundTalent = talentProfiles.find(t => t.id === id)
      setTalent(foundTalent || null)
    }
  }, [id, talentProfiles])

  const handleDelete = async () => {
    if (!talent || !window.confirm('この人材プロフィールを削除してもよろしいですか？')) return

    setLoading(true)
    const result = await deleteTalentProfile(talent.id)
    
    if (result.success) {
      navigate('/talents')
    } else {
      alert('削除に失敗しました')
    }
    setLoading(false)
  }

  const handleToggleFavorite = () => {
    if (user && talent) {
      toggleFavorite(user.id, talent.id, 'talent')
    }
  }

  const isFavorite = talent ? favorites.some(fav => fav.favoritable_id === talent.id) : false
  const isOwner = user && talent && talent.user_id === user.id

  if (!talent) {
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
            <p className="text-mono-medium">人材が見つかりませんでした</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-mono-light hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          {isOwner && (
            <>
              <Link to={`/talents/${talent.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </>
          )}
          
          {!isOwner && userJobs.length > 0 && (
            <div className="w-64 space-y-2">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue text-sm"
              >
                <option value="">案件を選択</option>
                {userJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              {selectedJob && (
                <MatchProposalButton 
                  job={userJobs.find(j => j.id === selectedJob)} 
                  talent={talent} 
                  onSuccess={() => {
                    alert('マッチング提案を送信しました')
                    setSelectedJob('')
                  }}
                />
              )}
            </div>
          )}
          
          {!isOwner && userJobs.length === 0 && (
            <Link to="/jobs/new">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                案件投稿してマッチング
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Talent Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-kontext-blue-light rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-kontext-blue" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-mono-darkest">{talent.name}</h1>
                {talent.is_hot && <Flame className="w-6 h-6 text-orange-500" />}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={STATUS_COLORS[talent.status as keyof typeof STATUS_COLORS] as any}>
                  {getStatusLabel(talent.status)}
                </Badge>
                <Badge variant="default">
                  {getWorkTypeLabel(talent.work_type)}
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-kontext-blue mb-1">
                {formatCurrency(talent.rate)} / 日
              </div>
              <div className="text-sm text-mono-medium">
                経験年数: {talent.experience_years}年
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              {talent.company_name && (
                <div className="flex items-center text-mono-dark">
                  <User className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">所属企業</div>
                    <div className="font-medium">{talent.company_name}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-mono-dark">
                <MapPin className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">勤務可能地域</div>
                  <div className="font-medium">{talent.location}</div>
                </div>
              </div>

              <div className="flex items-center text-mono-dark">
                <Calendar className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">登録日</div>
                  <div className="font-medium">{formatDate(talent.created_at)}</div>
                  <div className="text-xs text-mono-medium">
                    {formatRelativeTime(talent.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-mono-dark">
                <DollarSign className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">希望日額</div>
                  <div className="font-medium">{formatCurrency(talent.rate)}</div>
                </div>
              </div>

              <div className="flex items-center text-mono-dark">
                <TrendingUp className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">経験年数</div>
                  <div className="font-medium">{talent.experience_years}年</div>
                </div>
              </div>

              {talent.user && (
                <div className="flex items-center text-mono-dark">
                  <User className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">登録者</div>
                    <div className="font-medium">{talent.user.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-mono-darkest mb-3">自己紹介</h3>
            <div className="bg-mono-lightest rounded-lg p-4">
              <p className="text-mono-dark whitespace-pre-wrap">{talent.bio}</p>
            </div>
          </div>

          {/* Skills */}
          {talent.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">スキル・経験</h3>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Carriers */}
          {talent.preferred_carrier.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">希望キャリア</h3>
              <div className="flex flex-wrap gap-2">
                {talent.preferred_carrier.map((carrier) => (
                  <Badge key={carrier} variant="default">
                    {carrier}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {talent.portfolio && (
            <div>
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">ポートフォリオ</h3>
              <div className="bg-mono-lightest rounded-lg p-4">
                <a
                  href={talent.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kontext-blue hover:underline flex items-center"
                >
                  {talent.portfolio}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}