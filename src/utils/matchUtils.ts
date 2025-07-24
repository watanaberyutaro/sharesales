import { JobPost, TalentProfile } from '@/types/database'

export const generateMatchId = (jobPostId: string, talentProfileId: string): string => {
  return `${jobPostId}-${talentProfileId}`
}

export const calculateProfit = (jobBudget: number, talentRate: number, workDays: number): number => {
  const totalTalentCost = talentRate * workDays
  return Math.max(0, jobBudget - totalTalentCost)
}

export const calculateEachProfit = (totalProfit: number): number => {
  return Math.round(totalProfit / 2) // 50/50で分配
}

export const isSkillMatch = (jobSkills: string[], talentSkills: string[]): boolean => {
  return jobSkills.some(skill => talentSkills.includes(skill))
}

export const isCarrierMatch = (jobCarriers: string[], talentCarriers: string[]): boolean => {
  if (jobCarriers.length === 0 || talentCarriers.length === 0) return true
  return jobCarriers.some(carrier => talentCarriers.includes(carrier))
}

export const isWorkTypeMatch = (jobWorkType: string, talentWorkType: string): boolean => {
  if (jobWorkType === 'any' || talentWorkType === 'any') return true
  return jobWorkType === talentWorkType
}

export const calculateMatchScore = (job: JobPost, talent: TalentProfile): number => {
  let score = 0
  
  // スキルマッチ (40%)
  const skillMatches = job.skill_tags.filter(skill => talent.skills.includes(skill)).length
  const skillScore = skillMatches > 0 ? (skillMatches / Math.max(job.skill_tags.length, 1)) * 40 : 0
  score += skillScore
  
  // キャリアマッチ (20%)
  const carrierMatches = job.preferred_carrier.filter(carrier => talent.preferred_carrier.includes(carrier)).length
  const carrierScore = carrierMatches > 0 ? (carrierMatches / Math.max(job.preferred_carrier.length, 1)) * 20 : 0
  score += carrierScore
  
  // 勤務形態マッチ (20%)
  const workTypeScore = isWorkTypeMatch(job.work_type, talent.work_type) ? 20 : 0
  score += workTypeScore
  
  // 予算と希望日額の適合性 (20%)
  const dailyBudget = job.daily_rate || (job.budget / job.work_days)
  const rateRatio = Math.min(dailyBudget / talent.rate, 1)
  const budgetScore = rateRatio * 20
  score += budgetScore
  
  return Math.round(score)
}

export const getMatchScoreLabel = (score: number): string => {
  if (score >= 80) return '最適'
  if (score >= 60) return '良好'
  if (score >= 40) return '普通'
  return '要検討'
}

export const getMatchScoreColor = (score: number): 'success' | 'primary' | 'warning' | 'error' => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'primary'
  if (score >= 40) return 'warning'
  return 'error'
}