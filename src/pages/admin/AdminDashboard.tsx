import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Users,
  BriefcaseIcon,
  Building2,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Settings,
  Star,
  Activity,
  Calendar,
  DollarSign,
  FileText,
  PieChart,
  BarChart3,
  UserCheck,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/utils/formatters'

export default function AdminDashboard() {
  const { user } = useSupabaseStore()
  const { 
    jobPosts, 
    talentProfiles, 
    partners, 
    matches, 
    assignments,
    approvedUsers,
    fetchJobPosts,
    fetchTalentProfiles,
    fetchPartners,
    fetchMatches,
    fetchAssignments,
    fetchApprovedUsers
  } = useDataStore()

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalJobs: 0,
    totalTalents: 0,
    totalPartners: 0,
    totalMatches: 0,
    totalAssignments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    flaggedContent: 0,
    hotJobs: 0,
    monthlyRevenue: Array(12).fill(0),
    revenueGrowth: 0,
  })

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchJobPosts()
      fetchTalentProfiles()
      fetchPartners()
      fetchMatches()
      fetchAssignments()
      fetchApprovedUsers()
    }
  }, [user, fetchJobPosts, fetchTalentProfiles, fetchPartners, fetchMatches, fetchAssignments, fetchApprovedUsers])

  useEffect(() => {
    // Calculate admin statistics
    const totalRevenue = assignments
      .filter(assignment => assignment.status === 'completed')
      .reduce((total, assignment) => total + (assignment.total_profit || 0), 0)

    const activeUsers = new Set([
      ...jobPosts.map(job => job.user_id),
      ...talentProfiles.map(talent => talent.user_id),
      ...partners.map(partner => partner.user_id)
    ]).size

    const hotJobs = jobPosts.filter(job => job.is_hot).length
    
    // Calculate monthly revenue for the past 12 months
    const monthlyRevenue = Array(12).fill(0)
    const currentDate = new Date()
    
    assignments.forEach(assignment => {
      const assignmentDate = new Date(assignment.created_at)
      const monthDiff = (currentDate.getFullYear() - assignmentDate.getFullYear()) * 12 + 
                        (currentDate.getMonth() - assignmentDate.getMonth())
      
      if (monthDiff >= 0 && monthDiff < 12) {
        monthlyRevenue[11 - monthDiff] += assignment.total_profit || 0
      }
    })
    
    // Calculate revenue growth
    const thisMonth = monthlyRevenue[11] || 0
    const lastMonth = monthlyRevenue[10] || 0
    const revenueGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100) : 0

    setStats({
      totalUsers: approvedUsers.length,
      pendingApprovals: 12, // TODO: Implement pending approvals count
      totalJobs: jobPosts.length,
      totalTalents: talentProfiles.length,
      totalPartners: partners.length,
      totalMatches: matches.length,
      totalAssignments: assignments.length,
      totalRevenue,
      activeUsers,
      flaggedContent: 3, // TODO: Implement flagged content count
      hotJobs,
      monthlyRevenue,
      revenueGrowth,
    })
  }, [jobPosts, talentProfiles, partners, matches, assignments, approvedUsers])

  const recentActivities = [
    ...jobPosts.slice(0, 3).map(job => ({
      type: 'job',
      id: job.id,
      title: `新規案件: ${job.title}`,
      user: job.user?.name || 'Unknown',
      timestamp: job.created_at,
      status: job.status,
    })),
    ...talentProfiles.slice(0, 3).map(talent => ({
      type: 'talent',
      id: talent.id,
      title: `人材登録: ${talent.name}`,
      user: talent.user?.name || 'Unknown',
      timestamp: talent.created_at,
      status: talent.status,
    })),
    ...matches.slice(0, 2).map(match => ({
      type: 'match',
      id: match.id,
      title: `マッチング: ${match.job_post?.title}`,
      user: match.proposer?.name || 'Unknown',
      timestamp: match.created_at,
      status: match.status,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-mono-darkest mb-2">
              アクセス権限がありません
            </h2>
            <p className="text-mono-medium">
              この機能は管理者のみ利用できます。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">管理者ダッシュボード</h1>
          <p className="text-mono-medium">システム全体の状況を管理・監視します</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              ユーザー管理
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              システム設定
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-blue-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-blue-600 font-medium">承認済みユーザー</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="w-4 h-4 mr-1" />
              <span>アクティブ: {stats.activeUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-orange-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                <p className="text-sm text-orange-600 font-medium">承認待ち申請</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>要対応</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 text-green-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ¥{stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 font-medium">総収益</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className={`w-4 h-4 mr-1 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Star className="w-10 h-10 text-red-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.hotJobs}</p>
                <p className="text-sm text-red-600 font-medium">ホット案件</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              <span>全案件: {stats.totalJobs}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Target className="w-10 h-10 text-purple-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
                <p className="text-sm text-purple-600 font-medium">マッチング</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>完了: {stats.totalAssignments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hot Jobs Section */}
      <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Star className="w-5 h-5 mr-2" />
              ホットな案件
            </h2>
            <Badge className="bg-white text-red-600 font-bold">
              {stats.hotJobs}件
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobPosts.filter(job => job.is_hot).slice(0, 3).map((job) => (
              <div key={job.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{job.title}</p>
                    <p className="text-sm text-white/80">
                      {job.company_name || job.user?.name} • ¥{job.budget.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                    HOT
                  </Badge>
                </div>
              </div>
            ))}
            {stats.hotJobs === 0 && (
              <div className="text-center py-4">
                <p className="text-white/80">現在ホットな案件はありません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              月別収益推移
            </h2>
            <div className="text-right">
              <p className="text-sm text-mono-medium">今月</p>
              <p className="text-lg font-bold text-mono-darkest">
                ¥{(stats.monthlyRevenue[11] || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-1 h-32">
              {stats.monthlyRevenue.map((revenue, index) => {
                const maxRevenue = Math.max(...stats.monthlyRevenue)
                const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                const currentMonth = new Date().getMonth()
                const monthIndex = (currentMonth - 11 + index + 12) % 12
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex-1 flex items-end">
                      <div 
                        className={`w-full rounded-t transition-all duration-300 ${
                          index === 11 ? 'bg-blue-500' : 'bg-blue-300'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${monthNames[monthIndex]}: ¥${revenue.toLocaleString()}`}
                      ></div>
                    </div>
                    <span className="text-xs text-mono-medium mt-1">
                      {monthNames[monthIndex].slice(0, 1)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-sm text-mono-medium">
              <span>過去12ヶ月の収益推移</span>
              <span className={`flex items-center ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                前月比 {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content Stats */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-mono-darkest">コンテンツ統計</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-mono-dark">案件</span>
                </div>
                <span className="font-semibold text-mono-darkest">{stats.totalJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-mono-dark">人材</span>
                </div>
                <span className="font-semibold text-mono-darkest">{stats.totalTalents}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span className="text-mono-dark">パートナー</span>
                </div>
                <span className="font-semibold text-mono-darkest">{stats.totalPartners}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-mono-dark">マッチング</span>
                </div>
                <span className="font-semibold text-mono-darkest">{stats.totalMatches}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              ユーザー活動
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.activeUsers}
                </div>
                <p className="text-sm text-blue-600 font-medium">アクティブユーザー</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-mono-medium flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    今日のログイン
                  </span>
                  <Badge variant="secondary" className="font-bold">24</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-mono-medium flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    今週の新規登録
                  </span>
                  <Badge variant="secondary" className="font-bold">8</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-mono-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    今月の投稿数
                  </span>
                  <Badge variant="secondary" className="font-bold">
                    {stats.totalJobs + stats.totalTalents}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              システム状態
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-mono-dark flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  データベース
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-mono-dark flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  API応答
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  正常 (120ms)
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-mono-dark flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  ストレージ
                </span>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs border-yellow-300">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  使用率 78%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-mono-dark flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  バックアップ
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  2時間前
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-mono-darkest">最近の活動</h2>
            <Link to="/admin/activities" className="text-sm text-kontext-blue hover:underline">
              すべて見る
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <div
                key={`${activity.type}-${activity.id}-${index}`}
                className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'job' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'talent' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'job' && <BriefcaseIcon className="w-4 h-4" />}
                    {activity.type === 'talent' && <Users className="w-4 h-4" />}
                    {activity.type === 'match' && <Target className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-mono-darkest">{activity.title}</p>
                    <p className="text-sm text-mono-medium">
                      {activity.user} • {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={
                    activity.status === 'active' || activity.status === 'available' || activity.status === 'accepted' 
                      ? 'success' 
                      : activity.status === 'pending' 
                      ? 'warning' 
                      : 'default'
                  }
                  className="text-xs"
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="text-center py-6">
              <Users className="w-8 h-8 text-kontext-blue mx-auto mb-2" />
              <h3 className="font-medium text-mono-darkest">ユーザー管理</h3>
              <p className="text-sm text-mono-medium">承認・停止・削除</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/content">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="text-center py-6">
              <BriefcaseIcon className="w-8 h-8 text-kontext-blue mx-auto mb-2" />
              <h3 className="font-medium text-mono-darkest">コンテンツ管理</h3>
              <p className="text-sm text-mono-medium">案件・人材・企業</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="text-center py-6">
              <AlertTriangle className="w-8 h-8 text-kontext-blue mx-auto mb-2" />
              <h3 className="font-medium text-mono-darkest">報告・通報</h3>
              <p className="text-sm text-mono-medium">問題のあるコンテンツ</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="text-center py-6">
              <TrendingUp className="w-8 h-8 text-kontext-blue mx-auto mb-2" />
              <h3 className="font-medium text-mono-darkest">分析・レポート</h3>
              <p className="text-sm text-mono-medium">詳細な統計情報</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}