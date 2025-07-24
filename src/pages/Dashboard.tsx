import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import {
  TrendingUp,
  Users,
  BriefcaseIcon,
  Building2,
  Target,
  MessageSquare,
  Bell,
  Flame,
} from 'lucide-react'
import RecentActivity from '@/components/dashboard/RecentActivity'
import MatchingRecommendations from '@/components/dashboard/MatchingRecommendations'

export default function Dashboard() {
  const { user } = useSupabaseStore()
  const { 
    jobPosts, 
    talentProfiles, 
    partners,
    matches,
    assignments,
    fetchJobPosts, 
    fetchTalentProfiles, 
    fetchPartners,
    fetchMatches,
    fetchAssignments,
    notifications,
    getJobsByUser,
    getTalentByUser,
    getPartnersByUser,
    getMatchesForUser
  } = useDataStore()
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalTalents: 0,
    totalPartners: 0,
    totalMatches: 0,
    activeAssignments: 0,
    monthlyProfit: 0,
    myJobs: 0,
    myTalents: 0,
    myPartners: 0,
    myMatches: 0,
  })

  useEffect(() => {
    if (user) {
      fetchJobPosts()
      fetchTalentProfiles()
      fetchPartners()
      fetchMatches()
      fetchAssignments()
    }
  }, [user, fetchJobPosts, fetchTalentProfiles, fetchPartners, fetchMatches, fetchAssignments])

  useEffect(() => {
    if (!user) return

    const userJobs = getJobsByUser(user.id)
    const userTalent = getTalentByUser(user.id)
    const userPartners = getPartnersByUser(user.id)
    const userMatches = getMatchesForUser(user.id)
    
    // Calculate monthly profit from completed assignments
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const monthlyAssignments = assignments.filter(assignment => 
      assignment.created_at.startsWith(currentMonth) && 
      assignment.status === 'completed'
    )
    const monthlyProfit = monthlyAssignments.reduce((total, assignment) => {
      return total + (assignment.profit_amount || 0)
    }, 0)

    setStats({
      totalJobs: jobPosts.filter(job => job.status === 'active').length,
      totalTalents: talentProfiles.filter(talent => talent.status === 'available').length,
      totalPartners: partners.length,
      totalMatches: matches.length,
      activeAssignments: assignments.filter(assignment => assignment.status === 'active').length,
      monthlyProfit,
      myJobs: userJobs.length,
      myTalents: userTalent ? 1 : 0,
      myPartners: userPartners.length,
      myMatches: userMatches.length,
    })
  }, [user, jobPosts, talentProfiles, partners, matches, assignments, getJobsByUser, getTalentByUser, getPartnersByUser, getMatchesForUser])

  const hotJobs = jobPosts.filter(job => job.is_hot).slice(0, 3)
  const hotTalents = talentProfiles.filter(talent => talent.is_hot).slice(0, 3)
  const unreadNotifications = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-kontext-blue to-kontext-blue-dark text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          こんにちは、{user?.name}さん
        </h1>
        <p className="text-blue-100">
          みんな営業頑張ろう！今日も素晴らしい案件と人材のマッチングを実現しましょう。
        </p>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kontext-card">
          <div className="flex items-center justify-between mb-2">
            <BriefcaseIcon className="w-8 h-8 text-kontext-blue" />
            <span className="text-xs text-mono-medium">アクティブ</span>
          </div>
          <p className="text-2xl font-bold text-mono-darkest">{stats.totalJobs}</p>
          <p className="text-sm text-mono-medium">案件</p>
        </div>

        <div className="kontext-card">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-kontext-blue" />
            <span className="text-xs text-mono-medium">利用可能</span>
          </div>
          <p className="text-2xl font-bold text-mono-darkest">{stats.totalTalents}</p>
          <p className="text-sm text-mono-medium">人材</p>
        </div>

        <div className="kontext-card">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-kontext-blue" />
            <span className="text-xs text-mono-medium">登録</span>
          </div>
          <p className="text-2xl font-bold text-mono-darkest">{stats.totalPartners}</p>
          <p className="text-sm text-mono-medium">パートナー</p>
        </div>

        <div className="kontext-card">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-kontext-blue" />
            <span className="text-xs text-mono-medium">全体</span>
          </div>
          <p className="text-2xl font-bold text-mono-darkest">{stats.totalMatches}</p>
          <p className="text-sm text-mono-medium">マッチング</p>
        </div>
      </div>

      {/* Personal Stats Grid */}
      <div className="kontext-card">
        <h2 className="text-lg font-semibold text-mono-darkest mb-4">あなたの活動状況</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-mono-darkest">{stats.myJobs}</p>
            <p className="text-sm text-mono-medium">投稿案件</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xl font-bold text-mono-darkest">{stats.myTalents}</p>
            <p className="text-sm text-mono-medium">登録人材</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-mono-darkest">{stats.myPartners}</p>
            <p className="text-sm text-mono-medium">登録企業</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-xl font-bold text-mono-darkest">{stats.myMatches}</p>
            <p className="text-sm text-mono-medium">マッチング</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-kontext-blue-light rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-kontext-blue" />
            </div>
            <p className="text-xl font-bold text-mono-darkest">
              ¥{stats.monthlyProfit.toLocaleString()}
            </p>
            <p className="text-sm text-mono-medium">今月利益</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="kontext-card">
        <h2 className="text-lg font-semibold text-mono-darkest mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-mono-lighter rounded-lg hover:border-kontext-blue hover:bg-kontext-blue-light transition-all"
          >
            <BriefcaseIcon className="w-5 h-5 mr-2 text-kontext-blue" />
            <span className="text-mono-dark">案件を投稿</span>
          </Link>

          <Link
            to="/talents/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-mono-lighter rounded-lg hover:border-kontext-blue hover:bg-kontext-blue-light transition-all"
          >
            <Users className="w-5 h-5 mr-2 text-kontext-blue" />
            <span className="text-mono-dark">人材を登録</span>
          </Link>

          <Link
            to="/partners/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-mono-lighter rounded-lg hover:border-kontext-blue hover:bg-kontext-blue-light transition-all"
          >
            <Building2 className="w-5 h-5 mr-2 text-kontext-blue" />
            <span className="text-mono-dark">パートナー企業を登録</span>
          </Link>
        </div>
      </div>

      {/* Hot Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hot Jobs */}
        <div className="kontext-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              ホット案件
            </h2>
            <Link to="/jobs" className="text-sm text-kontext-blue hover:underline">
              すべて見る
            </Link>
          </div>
          {hotJobs.length > 0 ? (
            <div className="space-y-3">
              {hotJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block p-3 border border-mono-lighter rounded-lg hover:border-kontext-blue transition-colors"
                >
                  <h3 className="font-medium text-mono-darkest mb-1">{job.title}</h3>
                  <p className="text-sm text-mono-medium">
                    予算: ¥{job.budget.toLocaleString()} / {job.work_days}日
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mono-medium">ホット案件はありません</p>
          )}
        </div>

        {/* Hot Talents */}
        <div className="kontext-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              ホット人材
            </h2>
            <Link to="/talents" className="text-sm text-kontext-blue hover:underline">
              すべて見る
            </Link>
          </div>
          {hotTalents.length > 0 ? (
            <div className="space-y-3">
              {hotTalents.map((talent) => (
                <Link
                  key={talent.id}
                  to={`/talents/${talent.id}`}
                  className="block p-3 border border-mono-lighter rounded-lg hover:border-kontext-blue transition-colors"
                >
                  <h3 className="font-medium text-mono-darkest mb-1">{talent.name}</h3>
                  <p className="text-sm text-mono-medium">
                    日額: ¥{talent.rate.toLocaleString()} / 経験: {talent.experience_years}年
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mono-medium">ホット人材はありません</p>
          )}
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity />

        {/* Matching Recommendations */}
        <MatchingRecommendations />
      </div>

      {/* Notifications Summary */}
      {unreadNotifications > 0 && (
        <Link to="/notifications" className="block">
          <div className="kontext-card bg-kontext-blue-light border-kontext-blue hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-kontext-blue" />
                <div>
                  <p className="font-medium text-mono-darkest">
                    {unreadNotifications}件の未読通知があります
                  </p>
                  <p className="text-sm text-mono-medium">クリックして確認</p>
                </div>
              </div>
              <MessageSquare className="w-5 h-5 text-kontext-blue" />
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}