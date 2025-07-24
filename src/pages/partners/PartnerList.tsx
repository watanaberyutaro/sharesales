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
  Building2,
  Users,
  Star,
  Heart,
  ExternalLink,
} from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'
import { COMPANY_SIZE_OPTIONS, SPECIALTY_OPTIONS, COMPANY_SIZE_COLORS } from '@/constants/partnerOptions'

export default function PartnerList() {
  const { user } = useSupabaseStore()
  const { partners, fetchPartners, toggleFavorite, getUserFavorites } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const favorites = getUserFavorites(user?.id || '', 'partner')

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSize = !selectedSize || partner.company_size === selectedSize
    
    const matchesSpecialties = selectedSpecialties.length === 0 ||
                              selectedSpecialties.some(specialty => partner.specialties.includes(specialty))

    return matchesSearch && matchesSize && matchesSpecialties
  })

  const handleToggleFavorite = (partnerId: string) => {
    if (user) {
      toggleFavorite(user.id, partnerId, 'partner')
    }
  }

  const isFavorite = (partnerId: string) => {
    return favorites.some(fav => fav.favoritable_id === partnerId)
  }

  const getCompanySizeLabel = (size: string) => {
    const option = COMPANY_SIZE_OPTIONS.find(opt => opt.value === size)
    return option ? option.label : size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">パートナー企業一覧</h1>
          <p className="text-mono-medium">信頼できるパートナー企業を見つけましょう</p>
        </div>
        <Link to="/partners/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            企業を登録
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
              placeholder="企業名、説明、所在地で検索..."
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
              {filteredPartners.length}社の企業
            </span>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-mono-lighter">
              {/* Company Size Filter */}
              <div>
                <label className="block text-sm font-medium text-mono-dark mb-2">企業規模</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                >
                  <option value="">すべて</option>
                  {COMPANY_SIZE_OPTIONS.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialties Filter */}
              <div>
                <label className="block text-sm font-medium text-mono-dark mb-2">得意分野</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSpecialties([...selectedSpecialties, specialty])
                          } else {
                            setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Partner List */}
      <div className="grid gap-4">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Logo/Icon */}
                <div className="w-16 h-16 bg-kontext-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-kontext-blue" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to={`/partners/${partner.id}`}
                      className="text-lg font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                    >
                      {partner.name}
                    </Link>
                    <Badge variant={COMPANY_SIZE_COLORS[partner.company_size as keyof typeof COMPANY_SIZE_COLORS] as any}>
                      {getCompanySizeLabel(partner.company_size)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-mono-medium mb-2">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {partner.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {partner.employee_count}名
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {partner.rating.toFixed(1)} ({partner.review_count}件)
                    </div>
                  </div>

                  <p className="text-mono-dark mb-3 line-clamp-2">
                    {partner.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {partner.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="primary">
                        {specialty}
                      </Badge>
                    ))}
                    {partner.specialties.length > 3 && (
                      <Badge variant="default">
                        +{partner.specialties.length - 3}個
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-mono-medium">
                        登録: {formatRelativeTime(partner.created_at)}
                      </div>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-kontext-blue hover:underline flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          サイト
                        </a>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleToggleFavorite(partner.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite(partner.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-mono-light hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(partner.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredPartners.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-mono-medium mb-4">該当する企業が見つかりませんでした</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedSize('')
                setSelectedSpecialties([])
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