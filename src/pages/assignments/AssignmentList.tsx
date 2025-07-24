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
  Play,
  Pause,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
} from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime, getStatusLabel } from '@/utils/formatters'

export default function AssignmentList() {
  const { user } = useSupabaseStore()
  const { assignments, fetchAssignments, updateAssignment } = useDataStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const userAssignments = assignments.filter(assignment => 
    assignment.client_user_id === user?.id || assignment.talent_user_id === user?.id
  )

  const filteredAssignments = statusFilter 
    ? userAssignments.filter(a => a.status === statusFilter)
    : userAssignments

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const handleStatusChange = async (assignmentId: string, newStatus: 'active' | 'paused' | 'completed') => {
    setLoading(assignmentId)
    
    const result = await updateAssignment(assignmentId, { status: newStatus })
    
    if (!result.success) {
      alert('ステータス変更に失敗しました')
    }
    
    setLoading(null)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      paused: 'warning',
      completed: 'primary',
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play
      case 'paused': return Pause
      case 'completed': return CheckCircle
      default: return Play
    }
  }

  const canManageAssignment = (assignment: any) => {
    return assignment.client_user_id === user?.id
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">アサイン管理</h1>
          <p className="text-mono-medium">進行中のプロジェクトと利益を管理</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
          >
            <option value="">すべて</option>
            <option value="active">進行中</option>
            <option value="paused">一時停止</option>
            <option value="completed">完了</option>
          </select>
        </div>
      </div>

      {/* Assignment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { status: 'active', label: '進行中', icon: Play, color: 'success' },
          { status: 'paused', label: '一時停止', icon: Pause, color: 'warning' },
          { status: 'completed', label: '完了', icon: CheckCircle, color: 'primary' },
          { status: 'total_profit', label: '総利益', icon: DollarSign, color: 'primary' },
        ].map((stat) => (
          <Card key={stat.status}>
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 text-${stat.color === 'warning' ? 'yellow' : stat.color === 'success' ? 'green' : 'kontext-blue'}-500`} />
              <div>
                <div className="text-2xl font-bold text-mono-darkest">
                  {stat.status === 'total_profit' 
                    ? formatCurrency(userAssignments.reduce((sum, a) => sum + a.total_profit, 0))
                    : userAssignments.filter(a => a.status === stat.status).length
                  }
                </div>
                <div className="text-sm text-mono-medium">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const StatusIcon = getStatusIcon(assignment.status)
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={getStatusColor(assignment.status) as any}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {getStatusLabel(assignment.status)}
                      </Badge>
                      {assignment.client_user_id === user?.id && (
                        <Badge variant="primary">クライアント</Badge>
                      )}
                      {assignment.talent_user_id === user?.id && (
                        <Badge variant="success">人材</Badge>
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
                            to={`/jobs/${assignment.job_post?.id}`}
                            className="font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                          >
                            {assignment.job_post?.title}
                          </Link>
                          <div className="text-sm text-mono-medium mt-1">
                            予算: {formatCurrency(assignment.job_post?.budget || 0)}
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
                            to={`/talents/${assignment.talent_profile?.id}`}
                            className="font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                          >
                            {assignment.talent_profile?.name}
                          </Link>
                          <div className="text-sm text-mono-medium mt-1">
                            日額: {formatCurrency(assignment.talent_profile?.rate || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profit Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-mono-lightest rounded-lg p-3">
                        <div className="text-xs text-mono-medium mb-1">開始日</div>
                        <div className="font-semibold text-sm">
                          {formatDate(assignment.start_date)}
                        </div>
                      </div>
                      <div className="bg-mono-lightest rounded-lg p-3">
                        <div className="text-xs text-mono-medium mb-1">月次利益</div>
                        <div className="font-semibold text-sm text-kontext-blue">
                          {formatCurrency(assignment.monthly_profit)}
                        </div>
                      </div>
                      <div className="bg-mono-lightest rounded-lg p-3">
                        <div className="text-xs text-mono-medium mb-1">累計利益</div>
                        <div className="font-semibold text-sm text-kontext-blue">
                          {formatCurrency(assignment.total_profit)}
                        </div>
                      </div>
                      <div className="bg-mono-lightest rounded-lg p-3">
                        <div className="text-xs text-mono-medium mb-1">最終更新</div>
                        <div className="font-semibold text-sm">
                          {formatRelativeTime(assignment.updated_at)}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {assignment.notes && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                        <p className="text-sm text-blue-800">{assignment.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-mono-medium">
                        作成: {formatRelativeTime(assignment.created_at)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/assignments/${assignment.id}`}>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            詳細
                          </Button>
                        </Link>

                        {canManageAssignment(assignment) && assignment.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(assignment.id, 'paused')}
                            disabled={loading === assignment.id}
                            className="text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300"
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            一時停止
                          </Button>
                        )}

                        {canManageAssignment(assignment) && assignment.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(assignment.id, 'active')}
                            disabled={loading === assignment.id}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            再開
                          </Button>
                        )}

                        {canManageAssignment(assignment) && assignment.status !== 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(assignment.id, 'completed')}
                            disabled={loading === assignment.id}
                            className="bg-kontext-blue hover:bg-kontext-blue-dark text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            完了
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <Card>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-mono-light mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mono-darkest mb-2">
                アサインがまだありません
              </h3>
              <p className="text-mono-medium mb-4">
                マッチングが成立して契約が完了すると、ここにアサインが表示されます
              </p>
              <Link to="/matches">
                <Button>マッチング一覧を見る</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}