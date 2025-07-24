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
  MapPin,
  User,
  TrendingUp,
  Flame,
  Heart,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, getStatusLabel, getWorkTypeLabel } from '@/utils/formatters'
import { SKILL_OPTIONS, CARRIER_OPTIONS, WORK_TYPE_OPTIONS, STATUS_COLORS } from '@/constants/talentOptions'

export default function TalentList() {
  const { user } = useSupabaseStore()
  const { talentProfiles, fetchTalentProfiles, toggleFavorite, getUserFavorites } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [selectedWorkType, setSelectedWorkType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const favorites = getUserFavorites(user?.id || '', 'talent')

  useEffect(() => {
    fetchTalentProfiles()
  }, [fetchTalentProfiles])

  const filteredTalents = talentProfiles.filter((talent) => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (talent.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => talent.skills.includes(skill))
    
    const matchesCarriers = selectedCarriers.length === 0 ||
                           selectedCarriers.some(carrier => talent.preferred_carrier.includes(carrier))
    
    const matchesWorkType = !selectedWorkType || talent.work_type === selectedWorkType

    return matchesSearch && matchesSkills && matchesCarriers && matchesWorkType
  })

  const handleToggleFavorite = (talentId: string) => {
    if (user) {
      toggleFavorite(user.id, talentId, 'talent')
    }
  }

  const isFavorite = (talentId: string) => {
    return favorites.some(fav => fav.favoritable_id === talentId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">人材一覧</h1>
          <p className="text-mono-medium">優秀な人材を見つけましょう</p>
        </div>
        <Link to="/talents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            人材を登録
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
              placeholder="名前、自己紹介、企業名で検索..."
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
              {filteredTalents.length}名の人材
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

      {/* Talent List */}
      <div className="grid gap-4">
        {filteredTalents.map((talent) => (
          <Card key={talent.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <div className="w-16 h-16 bg-kontext-blue-light rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-kontext-blue" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to={`/talents/${talent.id}`}
                      className="text-lg font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                    >
                      {talent.name}
                    </Link>
                    {talent.is_hot && <Flame className="w-4 h-4 text-orange-500" />}
                    <Badge variant={STATUS_COLORS[talent.status as keyof typeof STATUS_COLORS] as any}>
                      {getStatusLabel(talent.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-mono-medium mb-2">
                    {talent.company_name && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {talent.company_name}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {talent.location}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {talent.experience_years}年経験
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatRelativeTime(talent.created_at)}
                    </div>
                  </div>

                  <p className="text-mono-dark mb-3 line-clamp-2">
                    {talent.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {talent.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="primary">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 3 && (
                      <Badge variant="default">
                        +{talent.skills.length - 3}個
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-lg font-bold text-kontext-blue">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(talent.rate)}
                      </div>
                      <div className="text-sm text-mono-medium">
                        日額 / {getWorkTypeLabel(talent.work_type)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleFavorite(talent.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite(talent.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-mono-light hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(talent.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredTalents.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-mono-medium mb-4">該当する人材が見つかりませんでした</p>
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