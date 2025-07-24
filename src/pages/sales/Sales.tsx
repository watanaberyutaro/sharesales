import { useState } from 'react'
import { TrendingUp, Users, Target, Calendar, Plus, Filter, BarChart3, PieChart, Activity } from 'lucide-react'

interface SalesActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'proposal'
  title: string
  client: string
  status: 'completed' | 'scheduled' | 'pending'
  amount?: number
  date: string
  notes?: string
}

interface SalesStats {
  totalRevenue: number
  activeDeals: number
  conversionRate: number
  monthlyGrowth: number
}

export default function Sales() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list')
  
  const [stats] = useState<SalesStats>({
    totalRevenue: 12500000,
    activeDeals: 24,
    conversionRate: 32.5,
    monthlyGrowth: 15.2
  })

  const [activities] = useState<SalesActivity[]>([
    {
      id: '1',
      type: 'meeting',
      title: 'React開発案件の商談',
      client: '株式会社テックソリューション',
      status: 'completed',
      amount: 800000,
      date: '2024-01-15',
      notes: '要件定義について詳細打ち合わせ。来週提案書提出予定。'
    },
    {
      id: '2',
      type: 'proposal',
      title: 'AIエンジニア案件の提案',
      client: '株式会社AIイノベーション',
      status: 'pending',
      amount: 1200000,
      date: '2024-01-14',
      notes: '機械学習エンジニア3名のアサイン提案書を送付。'
    },
    {
      id: '3',
      type: 'call',
      title: 'フォローアップコール',
      client: '株式会社モバイルテック',
      status: 'scheduled',
      date: '2024-01-16',
      notes: '前回の提案についてフィードバック確認。'
    },
    {
      id: '4',
      type: 'email',
      title: '新規案件の問い合わせ対応',
      client: '株式会社ウェブサービス',
      status: 'completed',
      amount: 600000,
      date: '2024-01-13',
      notes: 'フロントエンドエンジニアの案件について初回ヒアリング完了。'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞'
      case 'email': return '📧'
      case 'meeting': return '🤝'
      case 'proposal': return '📋'
      default: return '📝'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">完了</span>
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">予定</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">保留</span>
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">営業活動</h1>
            <p className="text-gray-600 mt-2">営業案件と活動状況を管理します</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">今週</option>
              <option value="month">今月</option>
              <option value="quarter">今四半期</option>
              <option value="year">今年</option>
            </select>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              新規活動
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総売上</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-green-600">+{stats.monthlyGrowth}%</span>
              <span className="text-gray-500 ml-1">前月比</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">進行中案件</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-blue-600">8件</span>
              <span className="text-gray-500 ml-1">今週追加</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成約率</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-purple-600">+2.3%</span>
              <span className="text-gray-500 ml-1">前月比</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ顧客</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-orange-600">+12</span>
              <span className="text-gray-500 ml-1">今月</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2 inline" />
                  活動一覧
                </button>
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'pipeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PieChart className="w-4 h-4 mr-2 inline" />
                  パイプライン
                </button>
              </div>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              フィルター
            </button>
          </div>
        </div>

        {/* Activities List */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">営業活動履歴</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                        {getStatusBadge(activity.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{activity.client}</span>
                        <span>{activity.date}</span>
                        {activity.amount && (
                          <span className="font-medium text-green-600">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                      </div>
                      
                      {activity.notes && (
                        <p className="text-gray-600 text-sm">{activity.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['リード', '商談中', '提案済み', '成約'].map((stage, index) => (
              <div key={stage} className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">{stage}</h3>
                  <p className="text-sm text-gray-500">
                    {Math.floor(Math.random() * 10) + 1}件
                  </p>
                </div>
                
                <div className="p-4 space-y-3">
                  {activities.slice(0, 2).map((activity) => (
                    <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600">{activity.client}</p>
                      {activity.amount && (
                        <p className="text-xs font-medium text-green-600 mt-1">
                          {formatCurrency(activity.amount)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}