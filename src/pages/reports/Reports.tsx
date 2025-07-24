import { useState } from 'react'
import { BarChart3, TrendingUp, Download, Calendar, Users, Target, Activity, PieChart } from 'lucide-react'

interface ReportData {
  period: string
  revenue: number
  matches: number
  assignments: number
  newClients: number
}

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [reportType, setReportType] = useState('overview')
  
  const [reportData] = useState<ReportData[]>([
    { period: '2024-01', revenue: 12500000, matches: 45, assignments: 32, newClients: 8 },
    { period: '2024-02', revenue: 15200000, matches: 52, assignments: 38, newClients: 12 },
    { period: '2024-03', revenue: 13800000, matches: 48, assignments: 35, newClients: 10 },
    { period: '2024-04', revenue: 16900000, matches: 58, assignments: 42, newClients: 15 }
  ])

  const currentData = reportData[reportData.length - 1]
  const previousData = reportData[reportData.length - 2]

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const revenueGrowth = calculateGrowth(currentData.revenue, previousData.revenue)
  const matchesGrowth = calculateGrowth(currentData.matches, previousData.matches)
  const assignmentsGrowth = calculateGrowth(currentData.assignments, previousData.assignments)
  const clientsGrowth = calculateGrowth(currentData.newClients, previousData.newClients)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">レポート</h1>
            <p className="text-gray-600 mt-2">業績データと分析結果を確認できます</p>
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
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'overview', label: '概要', icon: BarChart3 },
              { key: 'revenue', label: '売上分析', icon: TrendingUp },
              { key: 'performance', label: 'パフォーマンス', icon: Target },
              { key: 'clients', label: 'クライアント', icon: Users }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setReportType(tab.key)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  reportType === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Report */}
        {reportType === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">売上高</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(currentData.revenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className={`${parseFloat(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}%
                  </span>
                  <span className="text-gray-500 ml-1">前月比</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">マッチング数</p>
                    <p className="text-2xl font-bold text-gray-900">{currentData.matches}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className={`${parseFloat(matchesGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(matchesGrowth) >= 0 ? '+' : ''}{matchesGrowth}%
                  </span>
                  <span className="text-gray-500 ml-1">前月比</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">アサイン数</p>
                    <p className="text-2xl font-bold text-gray-900">{currentData.assignments}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className={`${parseFloat(assignmentsGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(assignmentsGrowth) >= 0 ? '+' : ''}{assignmentsGrowth}%
                  </span>
                  <span className="text-gray-500 ml-1">前月比</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">新規クライアント</p>
                    <p className="text-2xl font-bold text-gray-900">{currentData.newClients}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className={`${parseFloat(clientsGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(clientsGrowth) >= 0 ? '+' : ''}{clientsGrowth}%
                  </span>
                  <span className="text-gray-500 ml-1">前月比</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">売上推移</h3>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-64 flex items-end space-x-2">
                  {reportData.map((data, index) => (
                    <div key={data.period} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{
                          height: `${(data.revenue / Math.max(...reportData.map(d => d.revenue))) * 200}px`
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{data.period.split('-')[1]}月</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">業務分布</h3>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3" />
                      <span className="text-sm text-gray-700">案件マッチング</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-3" />
                      <span className="text-sm text-gray-700">人材アサイン</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-3" />
                      <span className="text-sm text-gray-700">新規開拓</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">最近の活動</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { type: '成約', description: 'React開発案件が成約しました', time: '2時間前', amount: '800,000円' },
                    { type: 'マッチング', description: '新しいマッチングが作成されました', time: '4時間前' },
                    { type: 'アサイン', description: 'AIエンジニアのアサインが完了しました', time: '6時間前', amount: '1,200,000円' },
                    { type: '新規', description: '新規クライアントが登録されました', time: '1日前' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {activity.type}
                          </span>
                          {activity.amount && (
                            <span className="text-sm font-medium text-green-600">
                              {activity.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Other report types would be implemented similarly */}
        {reportType !== 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {reportType === 'revenue' && '売上分析レポート'}
              {reportType === 'performance' && 'パフォーマンスレポート'}
              {reportType === 'clients' && 'クライアントレポート'}
            </h3>
            <p className="text-gray-500">このレポートは開発中です。</p>
          </div>
        )}
      </div>
    </div>
  )
}