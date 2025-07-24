import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Heart,
  BriefcaseIcon,
  Users,
  Building2,
  MapPin,
  DollarSign,
  Star,
  Trash2,
  Eye,
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export default function Favorites() {
  const { user } = useSupabaseStore()
  const { jobPosts, talentProfiles, partners } = useDataStore()
  const [favorites, setFavorites] = useState({
    jobs: [] as any[],
    talents: [] as any[],
    partners: [] as any[],
  })
  const [activeTab, setActiveTab] = useState<'jobs' | 'talents' | 'partners'>('jobs')

  useEffect(() => {
    // Mock favorite items - in real app, fetch from database
    const favoriteJobs = jobPosts.slice(0, 3).map(job => ({ ...job, favorited_at: new Date().toISOString() }))
    const favoriteTalents = talentProfiles.slice(0, 2).map(talent => ({ ...talent, favorited_at: new Date().toISOString() }))
    const favoritePartners = partners.slice(0, 2).map(partner => ({ ...partner, favorited_at: new Date().toISOString() }))

    setFavorites({
      jobs: favoriteJobs,
      talents: favoriteTalents,
      partners: favoritePartners,
    })
  }, [jobPosts, talentProfiles, partners])

  const handleRemoveFavorite = (type: 'jobs' | 'talents' | 'partners', id: string) => {
    setFavorites(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }))
  }

  const totalFavorites = Object.values(favorites).reduce((total, items) => total + items.length, 0)

  const tabs = [
    { key: 'jobs', label: '案件', icon: BriefcaseIcon, count: favorites.jobs.length },
    { key: 'talents', label: '人材', icon: Users, count: favorites.talents.length },
    { key: 'partners', label: 'パートナー', icon: Building2, count: favorites.partners.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Heart className="w-7 h-7 mr-3 text-red-500" />
            お気に入り
          </h1>
          <p className="text-gray-600 mt-1">保存した案件、人材、パートナー企業を管理できます</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalFavorites}</p>
          <p className="text-sm text-gray-500">総アイテム</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {favorites.jobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    お気に入りの案件がありません
                  </h3>
                  <p className="text-gray-500 mb-4">
                    気になる案件を見つけたら、ハートアイコンをクリックして保存しましょう
                  </p>
                  <Link to="/jobs">
                    <Button>案件を探す</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              favorites.jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          {job.is_hot && (
                            <Badge className="bg-red-100 text-red-800 border-red-300">
                              <Star className="w-3 h-3 mr-1" />
                              HOT
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatCurrency(job.budget)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {job.company_name || job.user?.name}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {job.skill_tags?.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link to={`/jobs/${job.id}`}>
                          <Button size="sm" variant="outline" title="詳細を見る">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFavorite('jobs', job.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          title="お気に入りから削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Talents Tab */}
        {activeTab === 'talents' && (
          <div className="space-y-4">
            {favorites.talents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    お気に入りの人材がありません
                  </h3>
                  <p className="text-gray-500 mb-4">
                    気になる人材を見つけたら、ハートアイコンをクリックして保存しましょう
                  </p>
                  <Link to="/talents">
                    <Button>人材を探す</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              favorites.talents.map((talent) => (
                <Card key={talent.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{talent.name}</h3>
                          {talent.is_hot && (
                            <Badge className="bg-red-100 text-red-800 border-red-300">
                              <Star className="w-3 h-3 mr-1" />
                              HOT
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{talent.bio}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatCurrency(talent.rate)}/日
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {talent.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {talent.experience_years}年経験
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {talent.skills?.slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link to={`/talents/${talent.id}`}>
                          <Button size="sm" variant="outline" title="詳細を見る">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFavorite('talents', talent.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          title="お気に入りから削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            {favorites.partners.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    お気に入りのパートナー企業がありません
                  </h3>
                  <p className="text-gray-500 mb-4">
                    気になるパートナー企業を見つけたら、ハートアイコンをクリックして保存しましょう
                  </p>
                  <Link to="/partners">
                    <Button>パートナー企業を探す</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              favorites.partners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{partner.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {partner.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {partner.employee_count}名
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {partner.rating?.toFixed(1)} ({partner.review_count}件)
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {partner.specialties?.slice(0, 3).map((specialty: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link to={`/partners/${partner.id}`}>
                          <Button size="sm" variant="outline" title="詳細を見る">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFavorite('partners', partner.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          title="お気に入りから削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}