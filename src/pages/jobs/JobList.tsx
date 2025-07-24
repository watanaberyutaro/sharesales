import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Building2,
  Flame,
  Heart,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, getStatusLabel, getWorkTypeLabel } from '@/utils/formatters'
import { SKILL_OPTIONS, CARRIER_OPTIONS, WORK_TYPE_OPTIONS, STATUS_COLORS } from '@/constants/jobOptions'

export default function JobList() {
  const { user } = useSupabaseStore()
  const { jobPosts, fetchJobPosts, toggleFavorite, getUserFavorites } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [selectedWorkType, setSelectedWorkType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const favorites = getUserFavorites(user?.id || '', 'job')

  useEffect(() => {
    fetchJobPosts()
  }, [fetchJobPosts])

  const filteredJobs = jobPosts.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => job.skill_tags.includes(skill))
    
    const matchesCarriers = selectedCarriers.length === 0 ||
                           selectedCarriers.some(carrier => job.preferred_carrier.includes(carrier))
    
    const matchesWorkType = !selectedWorkType || job.work_type === selectedWorkType

    return matchesSearch && matchesSkills && matchesCarriers && matchesWorkType
  })

  const handleToggleFavorite = (jobId: string) => {
    if (user) {
      toggleFavorite(user.id, jobId, 'job')
    }
  }

  const isFavorite = (jobId: string) => {
    return favorites.some(fav => fav.favoritable_id === jobId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">案件一覧</h1>
          <p className="text-mono-medium">募集中の案件を探しましょう</p>
        </div>
        <Link to="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            案件を投稿
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mono-medium" />
            <input
              type="text"
              placeholder="案件名、説明、企業名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              フィルター
            </Button>
            <span className="text-sm text-mono-medium">
              {filteredJobs.length}件の案件
            </span>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-mono-lighter">
              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-mono-dark mb-2">スキル</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {SKILL_OPTIONS.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, skill])
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Carriers Filter */}
              <div>
                <label className="block text-sm font-medium text-mono-dark mb-2">キャリア</label>
                <div className="space-y-1">
                  {CARRIER_OPTIONS.map((carrier) => (
                    <label key={carrier} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCarriers.includes(carrier)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCarriers([...selectedCarriers, carrier])
                          } else {
                            setSelectedCarriers(selectedCarriers.filter(c => c !== carrier))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{carrier}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Type Filter */}
              <div>
                <label className="block text-sm font-medium text-mono-dark mb-2">勤務形態</label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                >
                  <option value="">すべて</option>
                  {WORK_TYPE_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Job List */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
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
                
                <div className="flex items-center gap-4 text-sm text-mono-medium mb-2">
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

                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skill_tags.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                  {job.skill_tags.length > 3 && (
                    <Badge variant="default">
                      +{job.skill_tags.length - 3}個
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-kontext-blue">
                      {formatCurrency(job.budget)}
                    </div>
                    <div className="text-sm text-mono-medium">
                      {job.work_days}日間 / {getWorkTypeLabel(job.work_type)}
                    </div>
                    {job.daily_rate && (
                      <div className="text-sm text-mono-medium">
                        日額: {formatCurrency(job.daily_rate)}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleToggleFavorite(job.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite(job.id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-mono-light hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(job.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-mono-medium mb-4">該当する案件が見つかりませんでした</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedSkills([])
                setSelectedCarriers([])
                setSelectedWorkType('')
              }}>
                フィルターをクリア
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}