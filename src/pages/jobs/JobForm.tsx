import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SKILL_OPTIONS, CARRIER_OPTIONS, WORK_TYPE_OPTIONS, JOB_STATUS_OPTIONS } from '@/constants/jobOptions'
import { JobPost } from '@/types/database'

interface JobFormData {
  title: string
  description: string
  budget: number
  daily_rate?: number
  work_days: number
  location: string
  skill_tags: string[]
  work_type: string
  preferred_carrier: string[]
  status: string
  company_name: string
  work_dates?: string
}

export default function JobForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSupabaseStore()
  const { jobPosts, partners, addJobPost, updateJobPost, fetchPartners } = useDataStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(id)
  const existingJob = isEdit ? jobPosts.find(j => j.id === id) : null

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    budget: 0,
    daily_rate: undefined,
    work_days: 1,
    location: 'リモート可',
    skill_tags: [],
    work_type: 'any',
    preferred_carrier: [],
    status: 'active',
    company_name: '',
    work_dates: '',
  })

  const userPartners = partners.filter(p => p.user_id === user?.id)

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  useEffect(() => {
    if (existingJob) {
      setFormData({
        title: existingJob.title,
        description: existingJob.description,
        budget: existingJob.budget,
        daily_rate: existingJob.daily_rate || undefined,
        work_days: existingJob.work_days,
        location: existingJob.location,
        skill_tags: existingJob.skill_tags,
        work_type: existingJob.work_type,
        preferred_carrier: existingJob.preferred_carrier,
        status: existingJob.status,
        company_name: existingJob.company_name || '',
        work_dates: typeof existingJob.work_dates === 'string' ? existingJob.work_dates : '',
      })
    }
  }, [existingJob])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('ログインが必要です')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('タイトルと説明は必須です')
      return
    }

    if (formData.budget <= 0 || formData.work_days <= 0) {
      setError('予算と稼働日数は1以上で入力してください')
      return
    }

    setLoading(true)

    const jobData = {
      ...formData,
      user_id: user.id,
      company_id: userPartners.find(p => p.name === formData.company_name)?.id,
      work_dates: formData.work_dates || null,
    }

    const result = isEdit && existingJob
      ? await updateJobPost(existingJob.id, jobData)
      : await addJobPost(jobData)

    if (result.success) {
      navigate(isEdit ? `/jobs/${existingJob?.id}` : '/jobs')
    } else {
      setError(result.error || '保存に失敗しました')
    }

    setLoading(false)
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skill_tags: prev.skill_tags.includes(skill)
        ? prev.skill_tags.filter(s => s !== skill)
        : [...prev.skill_tags, skill]
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
          {isEdit ? '案件を編集' : '新規案件投稿'}
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
              <label htmlFor="title" className="block text-sm font-medium text-mono-dark mb-2">
                案件名 *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="例: ドコモショップでの販売スタッフ募集"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-mono-dark mb-2">
                企業名
              </label>
              <input
                id="company_name"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="企業名を入力"
                list="partner-companies"
              />
              <datalist id="partner-companies">
                {userPartners.map(partner => (
                  <option key={partner.id} value={partner.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-mono-dark mb-2">
                勤務地
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="例: 東京都渋谷区、リモート可"
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-mono-dark mb-2">
                予算 (円) *
              </label>
              <input
                id="budget"
                type="number"
                required
                min="1"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="300000"
              />
            </div>

            <div>
              <label htmlFor="daily_rate" className="block text-sm font-medium text-mono-dark mb-2">
                日額 (円)
              </label>
              <input
                id="daily_rate"
                type="number"
                min="1"
                value={formData.daily_rate || ''}
                onChange={(e) => setFormData({ ...formData, daily_rate: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="15000"
              />
            </div>

            <div>
              <label htmlFor="work_days" className="block text-sm font-medium text-mono-dark mb-2">
                稼働日数 *
              </label>
              <input
                id="work_days"
                type="number"
                required
                min="1"
                value={formData.work_days || ''}
                onChange={(e) => setFormData({ ...formData, work_days: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
                placeholder="20"
              />
            </div>

            <div>
              <label htmlFor="work_type" className="block text-sm font-medium text-mono-dark mb-2">
                勤務形態
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
                {JOB_STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-mono-dark mb-2">
              案件詳細 *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="案件の詳細な説明を入力してください..."
            />
          </div>

          {/* Work Dates */}
          <div>
            <label htmlFor="work_dates" className="block text-sm font-medium text-mono-dark mb-2">
              稼働予定日
            </label>
            <textarea
              id="work_dates"
              rows={3}
              value={formData.work_dates}
              onChange={(e) => setFormData({ ...formData, work_dates: e.target.value })}
              className="w-full px-3 py-2 border border-mono-lighter rounded-md focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              placeholder="例: 2024年4月1日〜4月30日の平日、週3日程度"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-mono-dark mb-2">
              必要スキル
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SKILL_OPTIONS.map(skill => (
                <label key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.skill_tags.includes(skill)}
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
                isEdit ? '更新' : '投稿'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}