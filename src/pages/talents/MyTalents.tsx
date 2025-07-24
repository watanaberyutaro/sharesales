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
  User,
  DollarSign,
  Flame,
  TrendingUp,
  Users,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, getStatusLabel, getWorkTypeLabel } from '@/utils/formatters'
import { STATUS_COLORS } from '@/constants/talentOptions'

export default function MyTalents() {
  const { user } = useSupabaseStore()
  const { talentProfiles, fetchTalentProfiles, deleteTalentProfile, getTalentByUser } = useDataStore()
  const [loading, setLoading] = useState<string | null>(null)

  const myTalent = getTalentByUser(user?.id || '')

  useEffect(() => {
    fetchTalentProfiles()
  }, [fetchTalentProfiles])

  const handleDelete = async (talentId: string, talentName: string) => {
    if (!window.confirm(`「${talentName}」のプロフィールを削除してもよろしいですか？`)) return

    setLoading(talentId)
    const result = await deleteTalentProfile(talentId)
    
    if (!result.success) {
      alert('削除に失敗しました')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">登録した人材</h1>
          <p className="text-mono-medium">あなたが登録した人材プロフィールの管理</p>
        </div>
        {!myTalent && (
          <Link to="/talents/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              人材を登録
            </Button>
          </Link>
        )}
      </div>

      {/* Talent Profile */}
      {myTalent ? (
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-kontext-blue-light rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-kontext-blue" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/talents/${myTalent.id}`}
                  className="text-xl font-semibold text-mono-darkest hover:text-kontext-blue transition-colors"
                >
                  {myTalent.name}
                </Link>
                {myTalent.is_hot && <Flame className="w-5 h-5 text-orange-500" />}
                <Badge variant={STATUS_COLORS[myTalent.status as keyof typeof STATUS_COLORS] as any}>
                  {getStatusLabel(myTalent.status)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-mono-medium mb-3">
                {myTalent.company_name && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {myTalent.company_name}
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {myTalent.location}
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {myTalent.experience_years}年経験
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatRelativeTime(myTalent.created_at)}
                </div>
              </div>

              <p className="text-mono-dark mb-4 line-clamp-3">
                {myTalent.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {myTalent.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
                {myTalent.skills.length > 5 && (
                  <Badge variant="default">
                    +{myTalent.skills.length - 5}個
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-lg font-bold text-kontext-blue">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {formatCurrency(myTalent.rate)}
                  </div>
                  <div className="text-sm text-mono-medium">
                    日額 / {getWorkTypeLabel(myTalent.work_type)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/talents/${myTalent.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      詳細
                    </Button>
                  </Link>
                  <Link to={`/talents/${myTalent.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(myTalent.id, myTalent.name)}
                    disabled={loading === myTalent.id}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    削除
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="mb-4">
              <Users className="w-12 h-12 text-mono-light mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-mono-darkest mb-2">
              まだ人材プロフィールを登録していません
            </h3>
            <p className="text-mono-medium mb-4">
              プロフィールを登録して、素晴らしい案件とマッチングしましょう
            </p>
            <Link to="/talents/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                人材を登録
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Note */}
      {myTalent && (
        <div className="bg-kontext-blue-light border border-kontext-blue rounded-lg p-4">
          <p className="text-sm text-kontext-blue">
            <strong>ご注意:</strong> 1つのアカウントにつき1つの人材プロフィールのみ登録可能です。
            新しいプロフィールを登録したい場合は、既存のプロフィールを削除してから登録してください。
          </p>
        </div>
      )}
    </div>
  )
}