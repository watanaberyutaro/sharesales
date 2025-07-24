import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Clock,
  BriefcaseIcon,
  Users,
  Target,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'
import { formatRelativeTime, formatCurrency } from '@/utils/formatters'

export default function RecentActivity() {
  const { user } = useSupabaseStore()
  const { 
    jobPosts, 
    talentProfiles, 
    matches, 
    assignments,
    getJobsByUser,
    getMatchesForUser 
  } = useDataStore()

  if (!user) return null

  // Get recent user activities
  const userJobs = getJobsByUser(user.id).slice(0, 3)
  const userMatches = getMatchesForUser(user.id).slice(0, 3)
  const recentAssignments = assignments
    .filter(assignment => 
      assignment.match?.job_post?.user_id === user.id ||
      assignment.match?.talent_profile?.user_id === user.id
    )
    .slice(0, 3)

  const activities = [
    ...userJobs.map(job => ({
      type: 'job_created',
      id: job.id,
      title: `案件「${job.title}」を投稿`,
      date: job.created_at,
      icon: BriefcaseIcon,
      color: 'bg-blue-100 text-blue-600',
      link: `/jobs/${job.id}`,
      data: job
    })),
    ...userMatches.map(match => ({
      type: 'match_created',
      id: match.id,
      title: `マッチング提案: ${match.job_post?.title}`,
      date: match.created_at,
      icon: Target,
      color: 'bg-orange-100 text-orange-600',
      link: `/matches/${match.id}`,
      data: match
    })),
    ...recentAssignments.map(assignment => ({
      type: 'assignment_created',
      id: assignment.id,
      title: `契約作成: ${assignment.match?.job_post?.title}`,
      date: assignment.created_at,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      link: `/assignments`,
      data: assignment
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <Clock className="w-5 h-5 mr-2 text-mono-medium" />
            最近の活動
          </h2>
          <Link to="/dashboard/activity" className="text-sm text-kontext-blue hover:underline">
            すべて見る
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Link
                key={`${activity.type}-${activity.id}`}
                to={activity.link}
                className="block p-3 border border-mono-lighter rounded-lg hover:border-kontext-blue hover:bg-mono-lightest transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-mono-darkest mb-1">
                      {activity.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-mono-medium">
                        {formatRelativeTime(activity.date)}
                      </p>
                      {activity.type === 'job_created' && (
                        <Badge variant="primary" className="text-xs">
                          {formatCurrency(activity.data.budget)}
                        </Badge>
                      )}
                      {activity.type === 'assignment_created' && activity.data.profit_amount && (
                        <Badge variant="success" className="text-xs">
                          利益: {formatCurrency(activity.data.profit_amount)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-mono-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-darkest mb-2">
              まだ活動履歴がありません
            </h3>
            <p className="text-mono-medium mb-4">
              案件投稿やマッチング提案をして活動を開始しましょう
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/jobs/new">
                <Badge variant="primary" className="cursor-pointer">
                  案件を投稿
                </Badge>
              </Link>
              <Link to="/jobs">
                <Badge variant="outline" className="cursor-pointer">
                  案件を探す
                </Badge>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}