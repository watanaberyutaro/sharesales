import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Flame,
  BriefcaseIcon,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, getStatusLabel, getWorkTypeLabel } from '@/utils/formatters'
import { STATUS_COLORS } from '@/constants/jobOptions'

export default function MyJobs() {
  const { user } = useSupabaseStore()
  const { jobPosts, fetchJobPosts, deleteJobPost, getJobsByUser } = useDataStore()
  const [loading, setLoading] = useState<string | null>(null)

  const myJobs = getJobsByUser(user?.id || '')

  useEffect(() => {
    fetchJobPosts()
  }, [fetchJobPosts])

  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`「${jobTitle}」を削除してもよろしいですか？`)) return

    setLoading(jobId)
    const result = await deleteJobPost(jobId)
    
    if (!result.success) {
      alert('削除に失敗しました')
    }
    setLoading(null)
  }

  const getStatusCount = (status: string) => {
    return myJobs.filter(job => job.status === status).length
  }

  const statusStats = [
    { status: 'active', label: '募集中', count: getStatusCount('active'), color: 'success' },
    { status: 'draft', label: '下書き', count: getStatusCount('draft'), color: 'default' },
    { status: 'assigned', label: 'アサイン済み', count: getStatusCount('assigned'), color: 'primary' },
    { status: 'completed', label: '完了', count: getStatusCount('completed'), color: 'primary' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">投稿した案件</h1>
          <p className="text-mono-medium">あなたが投稿した案件の管理</p>
        </div>
        <Link to="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規投稿
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusStats.map((stat) => (
          <Card key={stat.status}>
            <div className="text-center">
              <div className="text-2xl font-bold text-mono-darkest mb-1">
                {stat.count}
              </div>
              <Badge variant={stat.color as any} className="text-xs">
                {stat.label}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {myJobs.length > 0 ? (
          myJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                    >
                      {job.title}
                    </Link>
                    {job.is_hot && <Flame className="w-4 h-4 text-orange-500" />}
                    <Badge variant={STATUS_COLORS[job.status as keyof typeof STATUS_COLORS] as any}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-mono-medium mb-3">
                    {job.company_name && (
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {job.company_name}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatRelativeTime(job.created_at)}
                    </div>
                  </div>

                  <p className="text-mono-dark mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-kontext-blue font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(job.budget)}
                      </div>
                      <div className="text-sm text-mono-medium">
                        {job.work_days}日間 / {getWorkTypeLabel(job.work_type)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          詳細
                        </Button>
                      </Link>
                      <Link to={`/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          編集
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id, job.title)}
                        disabled={loading === job.id}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="mb-4">
                <BriefcaseIcon className="w-12 h-12 text-mono-light mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-mono-darkest mb-2">
                まだ案件を投稿していません
              </h3>
              <p className="text-mono-medium mb-4">
                最初の案件を投稿して、優秀な人材とマッチングしましょう
              </p>
              <Link to="/jobs/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  案件を投稿
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}