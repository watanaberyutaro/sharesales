import { useState } from 'react'
import { Search as SearchIcon, Filter, MapPin, Calendar, Building2, User, Briefcase } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'job' | 'talent' | 'partner'
  title: string
  description: string
  location?: string
  company?: string
  skills?: string[]
  salary?: string
  createdAt: string
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'job' | 'talent' | 'partner'>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const [results] = useState<SearchResult[]>([
    {
      id: '1',
      type: 'job',
      title: 'React フロントエンドエンジニア募集',
      description: '大手ECサイトのフロントエンド開発を担当していただきます。モダンな技術スタックでの開発経験を積めます。',
      location: '東京都渋谷区',
      company: '株式会社テックソリューション',
      skills: ['React', 'TypeScript', 'Next.js'],
      salary: '月額60-80万円',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      type: 'talent',
      title: '田中 太郎（フルスタックエンジニア）',
      description: '5年間のWebアプリケーション開発経験。フロントエンドからバックエンドまで幅広く対応可能。',
      location: '東京都新宿区',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      type: 'partner',
      title: '株式会社イノベーションラボ',
      description: 'AI・機械学習分野に特化したソフトウェア開発会社。優秀なエンジニアチームを有しています。',
      location: '大阪府大阪市',
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      type: 'job',
      title: 'Python バックエンドエンジニア',
      description: 'AI機能を活用したWebサービスのバックエンド開発。最新技術に触れながら成長できる環境です。',
      location: '東京都港区',
      company: '株式会社AIテック',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      salary: '月額70-90万円',
      createdAt: '2024-01-12'
    }
  ])

  const filteredResults = results.filter(result => {
    const matchesType = selectedType === 'all' || result.type === selectedType
    const matchesQuery = searchQuery === '' || 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesType && matchesQuery
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="w-5 h-5 text-blue-600" />
      case 'talent': return <User className="w-5 h-5 text-green-600" />
      case 'partner': return <Building2 className="w-5 h-5 text-purple-600" />
      default: return <SearchIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'job':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">案件</span>
      case 'talent':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">人材</span>
      case 'partner':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">パートナー</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">検索</h1>
          <p className="text-gray-600">案件・人材・パートナー企業を検索できます</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="キーワードを入力してください（技術スタック、職種、会社名など）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Type Filters */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">検索対象:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'すべて' },
                  { key: 'job', label: '案件' },
                  { key: 'talent', label: '人材' },
                  { key: 'partner', label: 'パートナー' }
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedType === type.key
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}        
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                詳細フィルター
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">詳細フィルター</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">勤務地</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">すべて</option>
                  <option value="tokyo">東京都</option>
                  <option value="osaka">大阪府</option>
                  <option value="remote">リモート</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">技術スタック</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">すべて</option>
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">報酬範囲</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">すべて</option>
                  <option value="0-50">～50万円</option>
                  <option value="50-80">50-80万円</option>
                  <option value="80+">80万円～</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                検索結果 ({filteredResults.length}件)
              </h2>
              <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="newest">新着順</option>
                <option value="relevant">関連度順</option>
                <option value="salary">報酬順</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredResults.length === 0 ? (
              <div className="p-12 text-center">
                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりません</h3>
                <p className="text-gray-500">別のキーワードで検索してみてください。</p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <div key={result.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeBadge(result.type)}
                        <span className="text-sm text-gray-500">{result.createdAt}</span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {result.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{result.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {result.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {result.location}
                          </div>
                        )}
                        
                        {result.company && (
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {result.company}
                          </div>
                        )}
                        
                        {result.salary && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {result.salary}
                          </div>
                        )}
                      </div>
                      
                      {result.skills && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {result.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}