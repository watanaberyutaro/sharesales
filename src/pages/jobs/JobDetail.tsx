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
  Building2,
  User,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  Flame,
  DollarSign,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime, getStatusLabel, getWorkTypeLabel } from '@/utils/formatters'
import { STATUS_COLORS } from '@/constants/jobOptions'
import { JobPost } from '@/types/database'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { jobPosts, talentProfiles, deleteJobPost, toggleFavorite, getUserFavorites, getTalentByUser } = useDataStore()
  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(false)

  const favorites = getUserFavorites(user?.id || '', 'job')
  const userTalent = getTalentByUser(user?.id || '')

  useEffect(() => {
    if (id) {
      const foundJob = jobPosts.find(j => j.id === id)
      setJob(foundJob || null)
    }
  }, [id, jobPosts])

  const handleDelete = async () => {
    if (!job || !window.confirm('この案件を削除してもよろしいですか？')) return

    setLoading(true)
    const result = await deleteJobPost(job.id)
    
    if (result.success) {
      navigate('/jobs')
    } else {
      alert('削除に失敗しました')
    }
    setLoading(false)
  }

  const handleToggleFavorite = () => {
    if (user && job) {
      toggleFavorite(user.id, job.id, 'job')
    }
  }

  const isFavorite = job ? favorites.some(fav => fav.favoritable_id === job.id) : false
  const isOwner = user && job && job.user_id === user.id

  if (!job) {
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
            <p className="text-mono-medium">案件が見つかりませんでした</p>
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
              <Link to={`/jobs/${job.id}/edit`}>
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
          
          {!isOwner && userTalent && (
            <div className="w-64">
              <MatchProposalButton 
                job={job} 
                talent={userTalent} 
                onSuccess={() => alert('マッチング提案を送信しました')}
              />
            </div>
          )}
          
          {!isOwner && !userTalent && (
            <Link to="/talents/new">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                人材登録してマッチング
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-mono-darkest">{job.title}</h1>
                {job.is_hot && <Flame className="w-6 h-6 text-orange-500" />}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={STATUS_COLORS[job.status as keyof typeof STATUS_COLORS] as any}>
                  {getStatusLabel(job.status)}
                </Badge>
                <Badge variant="default">
                  {getWorkTypeLabel(job.work_type)}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-kontext-blue mb-1">
                {formatCurrency(job.budget)}
              </div>
              <div className="text-sm text-mono-medium">
                {job.work_days}日間
              </div>
              {job.daily_rate && (
                <div className="text-sm text-mono-medium">
                  日額: {formatCurrency(job.daily_rate)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              {job.company_name && (
                <div className="flex items-center text-mono-dark">
                  <Building2 className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">企業名</div>
                    <div className="font-medium">{job.company_name}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-mono-dark">
                <MapPin className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">勤務地</div>
                  <div className="font-medium">{job.location}</div>
                </div>
              </div>

              <div className="flex items-center text-mono-dark">
                <Calendar className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">投稿日</div>
                  <div className="font-medium">{formatDate(job.created_at)}</div>
                  <div className="text-xs text-mono-medium">
                    {formatRelativeTime(job.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-mono-dark">
                <DollarSign className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">予算</div>
                  <div className="font-medium">{formatCurrency(job.budget)}</div>
                </div>
              </div>

              <div className="flex items-center text-mono-dark">
                <Clock className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">稼働日数</div>
                  <div className="font-medium">{job.work_days}日間</div>
                </div>
              </div>

              {job.user && (
                <div className="flex items-center text-mono-dark">
                  <User className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">投稿者</div>
                    <div className="font-medium">{job.user.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-mono-darkest mb-3">案件詳細</h3>
            <div className="bg-mono-lightest rounded-lg p-4">
              <p className="text-mono-dark whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Skills */}
          {job.skill_tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">必要スキル</h3>
              <div className="flex flex-wrap gap-2">
                {job.skill_tags.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Carriers */}
          {job.preferred_carrier.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">希望キャリア</h3>
              <div className="flex flex-wrap gap-2">
                {job.preferred_carrier.map((carrier) => (
                  <Badge key={carrier} variant="default">
                    {carrier}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Work Dates */}
          {job.work_dates && (
            <div>
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">稼働予定</h3>
              <div className="bg-mono-lightest rounded-lg p-4">
                <p className="text-mono-dark">
                  {typeof job.work_dates === 'string' 
                    ? job.work_dates 
                    : JSON.stringify(job.work_dates, null, 2)
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}