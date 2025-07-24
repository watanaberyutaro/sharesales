import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Building2,
  Users,
  Star,
  ExternalLink,
} from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'
import { COMPANY_SIZE_COLORS } from '@/constants/partnerOptions'

export default function MyPartners() {
  const { user } = useSupabaseStore()
  const { partners, fetchPartners, deletePartner, getPartnersByUser } = useDataStore()
  const [loading, setLoading] = useState<string | null>(null)

  const myPartners = getPartnersByUser(user?.id || '')

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleDelete = async (partnerId: string, partnerName: string) => {
    if (!window.confirm(`「${partnerName}」を削除してもよろしいですか？`)) return

    setLoading(partnerId)
    const result = await deletePartner(partnerId)
    
    if (!result.success) {
      alert('削除に失敗しました')
    }
    setLoading(null)
  }

  const getCompanySizeLabel = (size: string) => {
    const sizeLabels: Record<string, string> = {
      startup: 'スタートアップ',
      small: '小規模',
      medium: '中規模',
      large: '大規模',
    }
    return sizeLabels[size] || size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">登録した企業</h1>
          <p className="text-mono-medium">あなたが登録したパートナー企業の管理</p>
        </div>
        <Link to="/partners/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            企業を登録
          </Button>
        </Link>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        {myPartners.length > 0 ? (
          myPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
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

                    <div className="flex items-center gap-4 text-sm text-mono-medium mb-3">
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
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatRelativeTime(partner.created_at)}
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
                        {partner.contact_email && (
                          <div className="text-sm text-mono-medium">
                            {partner.contact_email}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/partners/${partner.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            詳細
                          </Button>
                        </Link>
                        <Link to={`/partners/${partner.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            編集
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(partner.id, partner.name)}
                          disabled={loading === partner.id}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="mb-4">
                <Building2 className="w-12 h-12 text-mono-light mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-mono-darkest mb-2">
                まだ企業を登録していません
              </h3>
              <p className="text-mono-medium mb-4">
                パートナー企業を登録して、ネットワークを拡大しましょう
              </p>
              <Link to="/partners/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  企業を登録
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}