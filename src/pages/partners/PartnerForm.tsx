import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { COMPANY_SIZE_OPTIONS, SPECIALTY_OPTIONS } from '@/constants/partnerOptions'
import { Partner } from '@/types/database'

interface PartnerFormData {
  name: string
  description: string
  location: string
  company_size: string
  employee_count: number
  specialties: string[]
  website?: string
  contact_email?: string
}

export default function PartnerForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { partners, addPartner, updatePartner } = useDataStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(id)
  const existingPartner = isEdit ? partners.find(p => p.id === id) : null

  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    description: '',
    location: '',
    company_size: 'small',
    employee_count: 0,
    specialties: [],
    website: '',
    contact_email: '',
  })

  useEffect(() => {
    if (existingPartner) {
      setFormData({
        name: existingPartner.name,
        description: existingPartner.description,
        location: existingPartner.location,
        company_size: existingPartner.company_size,
        employee_count: existingPartner.employee_count,
        specialties: existingPartner.specialties,
        website: existingPartner.website || '',
        contact_email: existingPartner.contact_email || '',
      })
    }
  }, [existingPartner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('ログインが必要です')
      return
    }

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('企業名と概要は必須です')
      return
    }

    if (formData.employee_count < 0) {
      setError('従業員数は0以上で入力してください')
      return
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      setError('ウェブサイトは正しいURL形式で入力してください')
      return
    }

    if (formData.contact_email && !formData.contact_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('連絡先メールアドレスの形式が正しくありません')
      return
    }

    setLoading(true)

    const partnerData = {
      ...formData,
      user_id: user.id,
      website: formData.website || null,
      contact_email: formData.contact_email || null,
    }

    const result = isEdit && existingPartner
      ? await updatePartner(existingPartner.id, partnerData)
      : await addPartner(partnerData)

    if (result.success) {
      navigate(isEdit ? `/partners/${existingPartner?.id}` : '/partners')
    } else {
      setError(result.error || '保存に失敗しました')
    }

    setLoading(false)
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
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
          {isEdit ? '企業情報を編集' : '新規企業登録'}
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
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-mono-dark mb-2">
                企業名 *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="例: 株式会社サンプル"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-mono-dark mb-2">
                所在地 *
              </label>
              <input
                id="location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="例: 東京都渋谷区"
              />
            </div>

            <div>
              <label htmlFor="company_size" className="block text-sm font-medium text-mono-dark mb-2">
                企業規模 *
              </label>
              <select
                id="company_size"
                required
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              >
                {COMPANY_SIZE_OPTIONS.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="employee_count" className="block text-sm font-medium text-mono-dark mb-2">
                従業員数 *
              </label>
              <input
                id="employee_count"
                type="number"
                required
                min="0"
                value={formData.employee_count || ''}
                onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="50"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-mono-dark mb-2">
                ウェブサイト
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-mono-dark mb-2">
                連絡先メール
              </label>
              <input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-mono-dark mb-2">
              企業概要 *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="企業の概要、事業内容、強みなどを詳しく記入してください..."
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-mono-dark mb-2">
              得意分野
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SPECIALTY_OPTIONS.map(specialty => (
                <label key={specialty} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyToggle(specialty)}
                    className="mr-2"
                  />
                  <span className="text-sm">{specialty}</span>
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