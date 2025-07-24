import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SKILL_OPTIONS, CARRIER_OPTIONS, WORK_TYPE_OPTIONS, TALENT_STATUS_OPTIONS } from '@/constants/talentOptions'
import { TalentProfile } from '@/types/database'

interface TalentFormData {
  name: string
  bio: string
  skills: string[]
  rate: number
  location: string
  experience_years: number
  work_type: string
  preferred_carrier: string[]
  status: string
  portfolio?: string
  company_name?: string
}

export default function TalentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { talentProfiles, addTalentProfile, updateTalentProfile } = useDataStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(id)
  const existingTalent = isEdit ? talentProfiles.find(t => t.id === id) : null

  const [formData, setFormData] = useState<TalentFormData>({
    name: '',
    bio: '',
    skills: [],
    rate: 0,
    location: 'リモート可',
    experience_years: 0,
    work_type: 'any',
    preferred_carrier: [],
    status: 'available',
    portfolio: '',
    company_name: '',
  })

  useEffect(() => {
    if (existingTalent) {
      setFormData({
        name: existingTalent.name,
        bio: existingTalent.bio,
        skills: existingTalent.skills,
        rate: existingTalent.rate,
        location: existingTalent.location,
        experience_years: existingTalent.experience_years,
        work_type: existingTalent.work_type,
        preferred_carrier: existingTalent.preferred_carrier,
        status: existingTalent.status,
        portfolio: existingTalent.portfolio || '',
        company_name: existingTalent.company_name || '',
      })
    }
  }, [existingTalent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('ログインが必要です')
      return
    }

    if (!formData.name.trim() || !formData.bio.trim()) {
      setError('名前と自己紹介は必須です')
      return
    }

    if (formData.rate <= 0 || formData.experience_years < 0) {
      setError('日額は1以上、経験年数は0以上で入力してください')
      return
    }

    setLoading(true)

    const talentData = {
      ...formData,
      user_id: user.id,
      portfolio: formData.portfolio || null,
      company_name: formData.company_name || null,
    }

    const result = isEdit && existingTalent
      ? await updateTalentProfile(existingTalent.id, talentData)
      : await addTalentProfile(talentData)

    if (result.success) {
      navigate(isEdit ? `/talents/${existingTalent?.id}` : '/talents')
    } else {
      setError(result.error || '保存に失敗しました')
    }

    setLoading(false)
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleCarrierToggle = (carrier: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_carrier: prev.preferred_carrier.includes(carrier)
        ? prev.preferred_carrier.filter(c => c !== carrier)
        : [...prev.preferred_carrier, carrier]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-2xl font-bold text-mono-darkest">
          {isEdit ? '人材プロフィールを編集' : '新規人材登録'}
        </h1>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-mono-dark mb-2">
                名前 *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="例: 田中太郎"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-mono-dark mb-2">
                所属企業
              </label>
              <input
                id="company_name"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="企業名を入力"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-mono-dark mb-2">
                勤務可能地域
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="例: 東京都内、リモート可"
              />
            </div>

            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-mono-dark mb-2">
                希望日額 (円) *
              </label>
              <input
                id="rate"
                type="number"
                required
                min="1"
                value={formData.rate || ''}
                onChange={(e) => setFormData({ ...formData, rate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="15000"
              />
            </div>

            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-mono-dark mb-2">
                経験年数 *
              </label>
              <input
                id="experience_years"
                type="number"
                required
                min="0"
                value={formData.experience_years || ''}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="3"
              />
            </div>

            <div>
              <label htmlFor="work_type" className="block text-sm font-medium text-mono-dark mb-2">
                希望勤務形態
              </label>
              <select
                id="work_type"
                value={formData.work_type}
                onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              >
                {WORK_TYPE_OPTIONS.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-mono-dark mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              >
                {TALENT_STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-mono-dark mb-2">
                ポートフォリオURL
              </label>
              <input
                id="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="https://example.com/portfolio"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-mono-dark mb-2">
              自己紹介 *
            </label>
            <textarea
              id="bio"
              required
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="あなたの経験、スキル、強みなどを詳しく記入してください..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-mono-dark mb-2">
              スキル・経験
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SKILL_OPTIONS.map(skill => (
                <label key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="mr-2"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Carriers */}
          <div>
            <label className="block text-sm font-medium text-mono-dark mb-2">
              希望キャリア
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CARRIER_OPTIONS.map(carrier => (
                <label key={carrier} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferred_carrier.includes(carrier)}
                    onChange={() => handleCarrierToggle(carrier)}
                    className="mr-2"
                  />
                  <span className="text-sm">{carrier}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                isEdit ? '更新' : '登録'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}