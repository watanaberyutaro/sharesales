import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Users,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  Star,
  ExternalLink,
  Mail,
  User,
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/utils/formatters'
import { COMPANY_SIZE_COLORS } from '@/constants/partnerOptions'
import { Partner } from '@/types/database'

export default function PartnerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { partners, deletePartner, toggleFavorite, getUserFavorites } = useDataStore()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(false)

  const favorites = getUserFavorites(user?.id || '', 'partner')

  useEffect(() => {
    if (id) {
      const foundPartner = partners.find(p => p.id === id)
      setPartner(foundPartner || null)
    }
  }, [id, partners])

  const handleDelete = async () => {
    if (!partner || !window.confirm('この企業情報を削除してもよろしいですか？')) return

    setLoading(true)
    const result = await deletePartner(partner.id)
    
    if (result.success) {
      navigate('/partners')
    } else {
      alert('削除に失敗しました')
    }
    setLoading(false)
  }

  const handleToggleFavorite = () => {
    if (user && partner) {
      toggleFavorite(user.id, partner.id, 'partner')
    }
  }

  const isFavorite = partner ? favorites.some(fav => fav.favoritable_id === partner.id) : false
  const isOwner = user && partner && partner.user_id === user.id

  const getCompanySizeLabel = (size: string) => {
    const sizeLabels: Record<string, string> = {
      startup: 'スタートアップ（1-10名）',
      small: '小規模（11-50名）',
      medium: '中規模（51-200名）',
      large: '大規模（201名以上）',
    }
    return sizeLabels[size] || size
  }

  if (!partner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-mono-medium">企業が見つかりませんでした</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-mono-light hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          {isOwner && (
            <>
              <Link to={`/partners/${partner.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </>
          )}
          
          {!isOwner && (
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              メッセージ
            </Button>
          )}
        </div>
      </div>

      {/* Partner Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 bg-kontext-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-12 h-12 text-kontext-blue" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-mono-darkest">{partner.name}</h1>
                <Badge variant={COMPANY_SIZE_COLORS[partner.company_size as keyof typeof COMPANY_SIZE_COLORS] as any}>
                  {getCompanySizeLabel(partner.company_size)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-mono-medium mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {partner.rating.toFixed(1)} ({partner.review_count}件のレビュー)
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {partner.employee_count}名
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center text-mono-dark">
                <MapPin className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">所在地</div>
                  <div className="font-medium">{partner.location}</div>
                </div>
              </div>

              <div className="flex items-center text-mono-dark">
                <Users className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">従業員数</div>
                  <div className="font-medium">{partner.employee_count}名</div>
                </div>
              </div>

              {partner.contact_email && (
                <div className="flex items-center text-mono-dark">
                  <Mail className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">連絡先</div>
                    <div className="font-medium">{partner.contact_email}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {partner.website && (
                <div className="flex items-center text-mono-dark">
                  <ExternalLink className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">ウェブサイト</div>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-kontext-blue hover:underline"
                    >
                      {partner.website}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center text-mono-dark">
                <Calendar className="w-5 h-5 mr-3 text-mono-medium" />
                <div>
                  <div className="text-sm text-mono-medium">登録日</div>
                  <div className="font-medium">{formatDate(partner.created_at)}</div>
                  <div className="text-xs text-mono-medium">
                    {formatRelativeTime(partner.created_at)}
                  </div>
                </div>
              </div>

              {partner.user && (
                <div className="flex items-center text-mono-dark">
                  <User className="w-5 h-5 mr-3 text-mono-medium" />
                  <div>
                    <div className="text-sm text-mono-medium">登録者</div>
                    <div className="font-medium">{partner.user.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-mono-darkest mb-3">企業概要</h3>
            <div className="bg-mono-lightest rounded-lg p-4">
              <p className="text-mono-dark whitespace-pre-wrap">{partner.description}</p>
            </div>
          </div>

          {/* Specialties */}
          {partner.specialties.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-mono-darkest mb-3">得意分野</h3>
              <div className="flex flex-wrap gap-2">
                {partner.specialties.map((specialty) => (
                  <Badge key={specialty} variant="primary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rating & Reviews Section */}
          <div>
            <h3 className="text-lg font-semibold text-mono-darkest mb-3">評価・レビュー</h3>
            <div className="bg-mono-lightest rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-mono-darkest">
                    {partner.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-mono-medium">
                  {partner.review_count}件のレビュー
                </div>
              </div>
              
              {partner.review_count === 0 ? (
                <p className="text-mono-medium">まだレビューがありません</p>
              ) : (
                <div className="space-y-2">
                  {/* TODO: レビュー一覧の実装 */}
                  <p className="text-mono-medium">レビュー一覧は今後実装予定です</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}