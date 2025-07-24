import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  BriefcaseIcon,
  Users,
  Building2,
  Search,
  Filter,
  Shield,
  Eye,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  Flame,
  AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters'

type ContentType = 'jobs' | 'talents' | 'partners'

export default function ContentManagement() {
  const { user } = useSupabaseStore()
  const { 
    jobPosts, 
    talentProfiles, 
    partners,
    fetchJobPosts,
    fetchTalentProfiles,
    fetchPartners,
    setHotStatus
  } = useDataStore()

  const [activeTab, setActiveTab] = useState<ContentType>('jobs')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchJobPosts()
      fetchTalentProfiles()
      fetchPartners()
    }
  }, [user, fetchJobPosts, fetchTalentProfiles, fetchPartners])

  const handleContentAction = async (
    type: ContentType, 
    id: string, 
    action: 'approve' | 'reject' | 'delete' | 'hot' | 'unhot'
  ) => {
    setLoading(true)
    
    try {
      if (action === 'hot' || action === 'unhot') {
        const itemType = type === 'jobs' ? 'job' : 'talent'
        await setHotStatus(itemType, id, action === 'hot')
        alert(`${action === 'hot' ? 'ホット設定' : 'ホット解除'}しました`)
      } else {
        // TODO: Implement other content management actions
        console.log(`${action} ${type} ${id}`)
        alert(`コンテンツを${action === 'approve' ? '承認' : action === 'reject' ? '却下' : '削除'}しました`)
      }
    } catch (error) {
      alert('操作に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredContent = () => {
    let content: any[] = []
    
    switch (activeTab) {
      case 'jobs':
        content = jobPosts
        break
      case 'talents':
        content = talentProfiles
        break
      case 'partners':
        content = partners
        break
    }

    return content.filter(item => {
      const searchText = activeTab === 'jobs' ? item.title :
                        activeTab === 'talents' ? item.name :
                        item.company_name
      
      const matchesSearch = searchText.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return <Badge variant="success" className="text-xs">アクティブ</Badge>
      case 'inactive':
      case 'unavailable':
        return <Badge variant="outline" className="text-xs">非アクティブ</Badge>
      case 'pending':
        return <Badge variant="warning" className="text-xs">承認待ち</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">却下</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getContentStats = () => {
    return {
      jobs: {
        total: jobPosts.length,
        active: jobPosts.filter(job => job.status === 'active').length,
        pending: jobPosts.filter(job => job.status === 'pending').length,
        hot: jobPosts.filter(job => job.is_hot).length,
      },
      talents: {
        total: talentProfiles.length,
        active: talentProfiles.filter(talent => talent.status === 'available').length,
        pending: talentProfiles.filter(talent => talent.status === 'pending').length,
        hot: talentProfiles.filter(talent => talent.is_hot).length,
      },
      partners: {
        total: partners.length,
        active: partners.filter(partner => partner.status === 'active').length,
        pending: partners.filter(partner => partner.status === 'pending').length,
        hot: 0, // Partners don't have hot status
      }
    }
  }

  const stats = getContentStats()
  const filteredContent = getFilteredContent()

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
          <h1 className="text-2xl font-bold text-mono-darkest">コンテンツ管理</h1>
          <p className="text-mono-medium">案件・人材・企業の管理を行います</p>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-kontext-blue text-white'
                  : 'text-mono-medium hover:text-kontext-blue hover:bg-kontext-blue-light'
              }`}
            >
              <BriefcaseIcon className="w-4 h-4 inline mr-2" />
              案件 ({stats.jobs.total})
            </button>
            <button
              onClick={() => setActiveTab('talents')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'talents'
                  ? 'bg-kontext-blue text-white'
                  : 'text-mono-medium hover:text-kontext-blue hover:bg-kontext-blue-light'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              人材 ({stats.talents.total})
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'partners'
                  ? 'bg-kontext-blue text-white'
                  : 'text-mono-medium hover:text-kontext-blue hover:bg-kontext-blue-light'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              企業 ({stats.partners.total})
            </button>
          </div>

          {/* Stats for active tab */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="kontext-card">
              <p className="text-2xl font-bold text-mono-darkest">
                {stats[activeTab].total}
              </p>
              <p className="text-sm text-mono-medium">総数</p>
            </div>
            <div className="kontext-card">
              <p className="text-2xl font-bold text-green-600">
                {stats[activeTab].active}
              </p>
              <p className="text-sm text-mono-medium">アクティブ</p>
            </div>
            <div className="kontext-card">
              <p className="text-2xl font-bold text-orange-500">
                {stats[activeTab].pending}
              </p>
              <p className="text-sm text-mono-medium">承認待ち</p>
            </div>
            <div className="kontext-card">
              <p className="text-2xl font-bold text-red-500">
                {stats[activeTab].hot}
              </p>
              <p className="text-sm text-mono-medium">ホット</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mono-medium" />
              <input
                type="text"
                placeholder={`${activeTab === 'jobs' ? '案件名' : activeTab === 'talents' ? '人材名' : '企業名'}で検索...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue"
            >
              <option value="all">すべてのステータス</option>
              <option value={activeTab === 'jobs' ? 'active' : 'available'}>アクティブ</option>
              <option value="pending">承認待ち</option>
              <option value={activeTab === 'jobs' ? 'inactive' : 'unavailable'}>非アクティブ</option>
              <option value="rejected">却下</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-mono-darkest">
            {activeTab === 'jobs' ? '案件' : activeTab === 'talents' ? '人材' : '企業'}一覧 ({filteredContent.length}件)
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mono-lighter">
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">
                    {activeTab === 'jobs' ? '案件名' : activeTab === 'talents' ? '人材名' : '企業名'}
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">投稿者</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">ステータス</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">
                    {activeTab === 'jobs' ? '予算' : activeTab === 'talents' ? '希望日額' : '業界'}
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">作成日</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr key={item.id} className="border-b border-mono-lighter hover:bg-mono-lightest">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-mono-darkest">
                            {activeTab === 'jobs' ? item.title : 
                             activeTab === 'talents' ? item.name : 
                             item.company_name}
                          </p>
                          <p className="text-sm text-mono-medium line-clamp-1">
                            {activeTab === 'jobs' ? item.location :
                             activeTab === 'talents' ? `${item.experience_years}年経験 • ${item.location}` :
                             item.description}
                          </p>
                        </div>
                        {item.is_hot && (
                          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm text-mono-darkest">{item.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-mono-medium">{item.user?.email || 'Unknown'}</p>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm font-medium text-mono-darkest">
                        {activeTab === 'jobs' ? formatCurrency(item.budget) :
                         activeTab === 'talents' ? `${formatCurrency(item.rate)}/日` :
                         item.industry || '未設定'}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        <p className="text-mono-darkest">{formatDate(item.created_at)}</p>
                        <p className="text-mono-medium">{formatRelativeTime(item.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {/* Hot/Unhot toggle (only for jobs and talents) */}
                        {activeTab !== 'partners' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContentAction(
                              activeTab, 
                              item.id, 
                              item.is_hot ? 'unhot' : 'hot'
                            )}
                            disabled={loading}
                            className={item.is_hot 
                              ? "text-orange-600 hover:text-orange-700 border-orange-200" 
                              : "text-mono-medium hover:text-orange-500 border-mono-lighter"
                            }
                            title={item.is_hot ? 'ホット解除' : 'ホット設定'}
                          >
                            <Flame className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {/* View */}
                        <Link 
                          to={`/${activeTab}/${item.id}`}
                          className="inline-block"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-kontext-blue hover:text-kontext-blue-dark border-kontext-blue-light"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                        
                        {/* Approve (if pending) */}
                        {item.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContentAction(activeTab, item.id, 'approve')}
                            disabled={loading}
                            className="text-green-600 hover:text-green-700 border-green-200"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {/* Flag/Report */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`${activeTab === 'jobs' ? '案件' : activeTab === 'talents' ? '人材' : '企業'}を報告しました`)}
                          className="text-yellow-600 hover:text-yellow-700 border-yellow-200"
                        >
                          <Flag className="w-3 h-3" />
                        </Button>
                        
                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContentAction(activeTab, item.id, 'delete')}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-8">
              {activeTab === 'jobs' ? (
                <BriefcaseIcon className="w-12 h-12 text-mono-light mx-auto mb-4" />
              ) : activeTab === 'talents' ? (
                <Users className="w-12 h-12 text-mono-light mx-auto mb-4" />
              ) : (
                <Building2 className="w-12 h-12 text-mono-light mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-mono-darkest mb-2">
                {activeTab === 'jobs' ? '案件' : activeTab === 'talents' ? '人材' : '企業'}が見つかりませんでした
              </h3>
              <p className="text-mono-medium">
                検索条件を変更して再度お試しください
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}