import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Target,
  Star,
  BriefcaseIcon,
  Users,
  MapPin,
  DollarSign,
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { calculateMatchScore } from '@/utils/matchUtils'

export default function MatchingRecommendations() {
  const { user } = useSupabaseStore()
  const { 
    jobPosts, 
    talentProfiles, 
    getJobsByUser,
    getTalentByUser 
  } = useDataStore()

  const recommendations = useMemo(() => {
    if (!user) return []

    const userJobs = getJobsByUser(user.id).filter(job => job.status === 'active')
    const userTalent = getTalentByUser(user.id)
    const allRecommendations = []

    // Job recommendations for user's talent
    if (userTalent && userTalent.status === 'available') {
      const jobRecommendations = jobPosts
        .filter(job => 
          job.status === 'active' && 
          job.user_id !== user.id
        )
        .map(job => ({
          type: 'job_for_talent',
          score: calculateMatchScore(job, userTalent),
          job,
          talent: userTalent,
        }))
        .filter(rec => rec.score >= 60)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      allRecommendations.push(...jobRecommendations)
    }

    // Talent recommendations for user's jobs
    userJobs.forEach(job => {
      const talentRecommendations = talentProfiles
        .filter(talent => 
          talent.status === 'available' && 
          talent.user_id !== user.id
        )
        .map(talent => ({
          type: 'talent_for_job',
          score: calculateMatchScore(job, talent),
          job,
          talent,
        }))
        .filter(rec => rec.score >= 60)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)

      allRecommendations.push(...talentRecommendations)
    })

    return allRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [user, jobPosts, talentProfiles, getJobsByUser, getTalentByUser])

  if (!user || recommendations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            おすすめマッチング
          </h2>
          <Link to="/matches" className="text-sm text-kontext-blue hover:underline">
            マッチング一覧
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={`${rec.type}-${rec.job.id}-${rec.talent.id}-${index}`}
              className="p-4 border border-mono-lighter rounded-lg hover:border-kontext-blue transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-mono-darkest">
                      {rec.score}%マッチ
                    </span>
                  </div>
                  <Badge 
                    variant={rec.type === 'job_for_talent' ? 'primary' : 'success'}
                    className="text-xs"
                  >
                    {rec.type === 'job_for_talent' ? '案件推奨' : '人材推奨'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/jobs/${rec.job.id}`}
                      className="font-medium text-mono-darkest hover:text-kontext-blue transition-colors line-clamp-1"
                    >
                      {rec.job.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-sm text-mono-medium">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(rec.job.budget)}
                      <MapPin className="w-3 h-3 ml-2" />
                      {rec.job.location}
                    </div>
                  </div>
                </div>

                {/* Talent Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/talents/${rec.talent.id}`}
                      className="font-medium text-mono-darkest hover:text-kontext-blue transition-colors line-clamp-1"
                    >
                      {rec.talent.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-sm text-mono-medium">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(rec.talent.rate)}/日
                      <span className="ml-2">
                        {rec.talent.experience_years}年経験
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <Link to={`/matches/new?job=${rec.job.id}&talent=${rec.talent.id}`}>
                  <Button size="sm" variant="outline">
                    マッチング提案
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}