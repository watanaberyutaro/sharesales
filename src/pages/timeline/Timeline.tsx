import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  BriefcaseIcon,
  Users,
  Building2,
  Target,
  TrendingUp,
  Calendar,
  User,
} from 'lucide-react'
import { formatRelativeTime, formatCurrency } from '@/utils/formatters'

interface TimelinePost {
  id: string
  type: 'job_posted' | 'talent_registered' | 'partner_added' | 'match_accepted' | 'assignment_completed' | 'user_post'
  userId: string
  userName: string
  content: string
  timestamp: string
  data?: any
  likes: number
  comments: number
  isLiked: boolean
}

export default function Timeline() {
  const { user } = useSupabaseStore()
  const { 
    jobPosts, 
    talentProfiles, 
    partners, 
    matches, 
    assignments,
    fetchJobPosts,
    fetchTalentProfiles,
    fetchPartners,
    fetchMatches,
    fetchAssignments
  } = useDataStore()
  
  const [posts, setPosts] = useState<TimelinePost[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchJobPosts()
      fetchTalentProfiles()
      fetchPartners()
      fetchMatches()
      fetchAssignments()
    }
  }, [user, fetchJobPosts, fetchTalentProfiles, fetchPartners, fetchMatches, fetchAssignments])

  useEffect(() => {
    // Generate timeline posts from system activities
    const timelinePosts: TimelinePost[] = []

    // Job posts
    jobPosts.slice(0, 10).forEach(job => {
      timelinePosts.push({
        id: `job-${job.id}`,
        type: 'job_posted',
        userId: job.user_id,
        userName: job.user?.name || 'Unknown User',
        content: `新しい案件「${job.title}」を投稿しました`,
        timestamp: job.created_at,
        data: job,
        likes: Math.floor(Math.random() * 10),
        comments: Math.floor(Math.random() * 5),
        isLiked: Math.random() > 0.7,
      })
    })

    // Talent registrations
    talentProfiles.slice(0, 8).forEach(talent => {
      timelinePosts.push({
        id: `talent-${talent.id}`,
        type: 'talent_registered',
        userId: talent.user_id,
        userName: talent.user?.name || 'Unknown User',
        content: `人材「${talent.name}」を登録しました`,
        timestamp: talent.created_at,
        data: talent,
        likes: Math.floor(Math.random() * 8),
        comments: Math.floor(Math.random() * 3),
        isLiked: Math.random() > 0.8,
      })
    })

    // Partner additions
    partners.slice(0, 5).forEach(partner => {
      timelinePosts.push({
        id: `partner-${partner.id}`,
        type: 'partner_added',
        userId: partner.user_id,
        userName: partner.user?.name || 'Unknown User',
        content: `パートナー企業「${partner.company_name}」を登録しました`,
        timestamp: partner.created_at,
        data: partner,
        likes: Math.floor(Math.random() * 6),
        comments: Math.floor(Math.random() * 2),
        isLiked: Math.random() > 0.8,
      })
    })

    // Match acceptances
    matches.filter(match => match.status === 'accepted').slice(0, 6).forEach(match => {
      timelinePosts.push({
        id: `match-${match.id}`,
        type: 'match_accepted',
        userId: match.proposer_id,
        userName: match.proposer?.name || 'Unknown User',
        content: `マッチングが成立しました！案件「${match.job_post?.title}」× 人材「${match.talent_profile?.name}」`,
        timestamp: match.updated_at || match.created_at,
        data: match,
        likes: Math.floor(Math.random() * 15),
        comments: Math.floor(Math.random() * 8),
        isLiked: Math.random() > 0.6,
      })
    })

    // Assignment completions
    assignments.filter(assignment => assignment.status === 'completed').slice(0, 4).forEach(assignment => {
      timelinePosts.push({
        id: `assignment-${assignment.id}`,
        type: 'assignment_completed',
        userId: assignment.match?.proposer_id || '',
        userName: assignment.match?.proposer?.name || 'Unknown User',
        content: `契約が完了しました！${assignment.profit_amount ? `利益: ${formatCurrency(assignment.profit_amount)}` : ''}`,
        timestamp: assignment.updated_at || assignment.created_at,
        data: assignment,
        likes: Math.floor(Math.random() * 12),
        comments: Math.floor(Math.random() * 6),
        isLiked: Math.random() > 0.7,
      })
    })

    // Sort by timestamp (newest first)
    const sortedPosts = timelinePosts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    setPosts(sortedPosts)
  }, [jobPosts, talentProfiles, partners, matches, assignments])

  const handlePost = async () => {
    if (!newPost.trim() || !user) return

    setLoading(true)
    
    // TODO: Implement actual post creation
    const userPost: TimelinePost = {
      id: `user-post-${Date.now()}`,
      type: 'user_post',
      userId: user.id,
      userName: user.name,
      content: newPost.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
    }

    setPosts(prev => [userPost, ...prev])
    setNewPost('')
    setLoading(false)
  }

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ))
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'job_posted': return BriefcaseIcon
      case 'talent_registered': return Users
      case 'partner_added': return Building2
      case 'match_accepted': return Target
      case 'assignment_completed': return TrendingUp
      default: return MessageSquare
    }
  }

  const getPostColor = (type: string) => {
    switch (type) {
      case 'job_posted': return 'bg-blue-100 text-blue-600'
      case 'talent_registered': return 'bg-green-100 text-green-600'
      case 'partner_added': return 'bg-purple-100 text-purple-600'
      case 'match_accepted': return 'bg-orange-100 text-orange-600'
      case 'assignment_completed': return 'bg-kontext-blue-light text-kontext-blue'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-mono-darkest">タイムライン</h1>
        <p className="text-mono-medium">みんなの活動をチェックして、営業活動のヒントを得よう</p>
      </div>

      {/* Post Creation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-kontext-blue-light rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-kontext-blue" />
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="今日の営業活動や気づきをシェアしましょう..."
                className="w-full p-3 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handlePost}
                  disabled={loading || !newPost.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  投稿
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Posts */}
      <div className="space-y-4">
        {posts.map((post) => {
          const IconComponent = getPostIcon(post.type)
          return (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getPostColor(post.type)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-mono-darkest">{post.userName}</span>
                      <span className="text-sm text-mono-medium">
                        {formatRelativeTime(post.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-mono-dark mb-3">{post.content}</p>

                    {/* Post Data Display */}
                    {post.data && post.type === 'job_posted' && (
                      <div className="bg-mono-lightest rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-mono-darkest">{post.data.title}</p>
                            <p className="text-sm text-mono-medium">{post.data.location}</p>
                          </div>
                          <Badge variant="primary">
                            {formatCurrency(post.data.budget)}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {post.data && post.type === 'talent_registered' && (
                      <div className="bg-mono-lightest rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-mono-darkest">{post.data.name}</p>
                            <p className="text-sm text-mono-medium">
                              {post.data.experience_years}年経験 • {post.data.location}
                            </p>
                          </div>
                          <Badge variant="success">
                            {formatCurrency(post.data.rate)}/日
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          post.isLiked 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-mono-medium hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </button>
                      
                      <button className="flex items-center gap-1 text-mono-medium hover:text-kontext-blue transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments}
                      </button>
                      
                      <button className="flex items-center gap-1 text-mono-medium hover:text-kontext-blue transition-colors">
                        <Share2 className="w-4 h-4" />
                        シェア
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {posts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-mono-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mono-darkest mb-2">
              まだ投稿がありません
            </h3>
            <p className="text-mono-medium mb-4">
              最初の投稿をして、コミュニティを盛り上げましょう！
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}