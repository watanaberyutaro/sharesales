import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/utils/formatters'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  created_at: string
  last_login?: string
  job_posts_count: number
  talent_profiles_count: number
  partner_companies_count: number
}

export default function UserManagement() {
  const { user } = useSupabaseStore()
  const { 
    allUsers,
    jobPosts, 
    talentProfiles, 
    partners,
    fetchAllUsers,
    fetchUserProfiles,
    fetchJobPosts,
    fetchTalentProfiles,
    fetchPartners,
    updateUserStatus,
    updateUserRole,
    deleteUser
  } = useDataStore()

  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllUsers()
      fetchUserProfiles()
      fetchJobPosts()
      fetchTalentProfiles()
      fetchPartners()
    }
  }, [user, fetchAllUsers, fetchUserProfiles, fetchJobPosts, fetchTalentProfiles, fetchPartners])

  useEffect(() => {
    console.log('Raw allUsers data:', allUsers)
    console.log('jobPosts:', jobPosts.length)
    console.log('talentProfiles:', talentProfiles.length)
    console.log('partners:', partners.length)

    // Transform users data from Supabase profiles and add activity counts
    const transformedUsers: User[] = allUsers.map(profileData => {
      const userId = profileData.user_id || profileData.id
      const userJobs = jobPosts.filter(job => job.user_id === userId)
      const userTalents = talentProfiles.filter(talent => talent.user_id === userId)
      const userPartners = partners.filter(partner => partner.user_id === userId)

      return {
        id: userId,
        name: profileData.name || profileData.email?.split('@')[0] || 'Unknown',
        email: profileData.email || 'Unknown',
        role: profileData.role || 'user',
        status: profileData.status || 'pending',
        created_at: profileData.created_at,
        last_login: profileData.last_sign_in_at,
        job_posts_count: userJobs.length,
        talent_profiles_count: userTalents.length,
        partner_companies_count: userPartners.length,
      }
    })

    console.log('Transformed users:', transformedUsers)
    setUsers(transformedUsers)
  }, [allUsers, jobPosts, talentProfiles, partners])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleUserAction = async (userId: string, action: 'approve' | 'suspend' | 'reject' | 'delete') => {
    setLoading(true)
    
    try {
      let result = { success: false, error: '' }
      
      switch (action) {
        case 'approve':
          result = await updateUserStatus(userId, 'approved')
          break
        case 'suspend':
          result = await updateUserStatus(userId, 'suspended')
          break
        case 'reject':
          result = await updateUserStatus(userId, 'rejected')
          break
        case 'delete':
          result = await deleteUser(userId)
          break
      }
      
      if (result.success) {
        const actionMessages = {
          approve: '承認しました。ユーザーはシステムを利用できます。',
          suspend: '一時停止しました。ユーザーのアクセスは制限されます。',
          reject: '却下しました。ユーザーに通知が送信されます。',
          delete: '削除しました。この操作は取り消しできません。'
        }
        alert(`ユーザー "${users.find(u => u.id === userId)?.name}" を${actionMessages[action as keyof typeof actionMessages]}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('User action error:', error)
      alert(`操作に失敗しました: ${error.message || 'しばらくしてから再度お試しください。'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    console.log('🎯 Role change requested:', { userId, newRole })
    setLoading(true)
    
    try {
      const result = await updateUserRole(userId, newRole)
      console.log('🔍 Role change result:', result)
      
      if (result.success) {
        const roleNames = {
          admin: '管理者',
          sales_squad1: '営業1番隊',
          sales_squad2: '営業2番隊', 
          sales_squad3: '営業3番隊',
          sales_squad1_captain: '営業1番隊隊長',
          sales_squad2_captain: '営業2番隊隊長',
          sales_squad3_captain: '営業3番隊隊長'
        }
        alert(`ユーザー "${users.find(u => u.id === userId)?.name}" の権限を「${roleNames[newRole as keyof typeof roleNames]}」に変更しました。`)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Role change error:', error)
      alert(`権限変更に失敗しました: ${error.message || 'しばらくしてから再度お試しください。'}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs font-medium">承認済み</Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs font-medium animate-pulse">承認待ち</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs font-medium">停止中</Badge>
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 text-xs font-medium">却下</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs font-bold">管理者</Badge>
      case 'sales_squad1_captain':
        return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs font-bold">営業1番隊隊長</Badge>
      case 'sales_squad2_captain':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs font-bold">営業2番隊隊長</Badge>
      case 'sales_squad3_captain':
        return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs font-bold">営業3番隊隊長</Badge>
      case 'sales_squad1':
        return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">営業1番隊</Badge>
      case 'sales_squad2':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">営業2番隊</Badge>
      case 'sales_squad3':
        return <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">営業3番隊</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">未配属</Badge>
    }
  }

  const getRoleSelect = (userId: string, currentRole: string) => {
    return (
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(userId, e.target.value)}
        disabled={loading}
        className="text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kontext-blue"
      >
        <option value="admin">管理者</option>
        <optgroup label="営業隊長">
          <option value="sales_squad1_captain">営業1番隊隊長</option>
          <option value="sales_squad2_captain">営業2番隊隊長</option>
          <option value="sales_squad3_captain">営業3番隊隊長</option>
        </optgroup>
        <optgroup label="営業隊員">
          <option value="sales_squad1">営業1番隊</option>
          <option value="sales_squad2">営業2番隊</option>
          <option value="sales_squad3">営業3番隊</option>
        </optgroup>
      </select>
    )
  }

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-mono-darkest mb-2">
              アクセス権限がありません
            </h2>
            <p className="text-mono-medium">
              この機能は管理者のみ利用できます。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mono-darkest">ユーザー管理</h1>
          <p className="text-mono-medium">ユーザーの承認・管理を行います</p>
        </div>
      </div>

      {/* Stats - Modern Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-10 h-10 text-green-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'approved').length}
                </p>
                <p className="text-sm text-green-600 font-medium">承認済み</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="w-4 h-4 mr-1" />
              <span>アクティブ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-orange-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'pending').length}
                </p>
                <p className="text-sm text-orange-600 font-medium">承認待ち</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>要対応</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <UserX className="w-10 h-10 text-red-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
                <p className="text-sm text-red-600 font-medium">停止中</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <XCircle className="w-4 h-4 mr-1" />
              <span>非アクティブ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-blue-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-blue-600 font-medium">総ユーザー</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>継続成長</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mono-medium" />
              <input
                type="text"
                placeholder="名前またはメールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue"
            >
              <option value="all">すべてのステータス</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="suspended">停止中</option>
              <option value="rejected">却下</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-mono-lighter rounded-lg focus:outline-none focus:ring-2 focus:ring-kontext-blue"
            >
              <option value="all">すべての権限</option>
              <option value="admin">管理者</option>
              <optgroup label="営業隊長">
                <option value="sales_squad1_captain">営業1番隊隊長</option>
                <option value="sales_squad2_captain">営業2番隊隊長</option>
                <option value="sales_squad3_captain">営業3番隊隊長</option>
              </optgroup>
              <optgroup label="営業隊員">
                <option value="sales_squad1">営業1番隊</option>
                <option value="sales_squad2">営業2番隊</option>
                <option value="sales_squad3">営業3番隊</option>
              </optgroup>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-mono-darkest">
            ユーザー一覧 ({filteredUsers.length}件)
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mono-lighter">
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">ユーザー</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">権限</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">ステータス</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">活動</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">登録日</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mono-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="border-b border-mono-lighter hover:bg-mono-lightest">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-mono-darkest">{userData.name}</p>
                        <p className="text-sm text-mono-medium">{userData.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col gap-1">
                        {getRoleBadge(userData.role)}
                        {getRoleSelect(userData.user_id || userData.id, userData.role)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(userData.status)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm text-mono-medium">
                        <p>案件: {userData.job_posts_count}</p>
                        <p>人材: {userData.talent_profiles_count}</p>
                        <p>企業: {userData.partner_companies_count}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        <p className="text-mono-darkest">{formatDate(userData.created_at)}</p>
                        <p className="text-mono-medium">{formatRelativeTime(userData.created_at)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {userData.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(userData.user_id || userData.id, 'approve')}
                              disabled={loading}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 transition-all"
                              title="ユーザーを承認します"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(userData.user_id || userData.id, 'reject')}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all"
                              title="ユーザーを却下します"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert(`ユーザーにメッセージを送信: ${userData.name}`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 transition-all"
                              title="メッセージを送信"
                            >
                              <Mail className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        
                        {userData.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(userData.user_id || userData.id, 'suspend')}
                            disabled={loading}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 transition-all"
                            title="ユーザーを一時停止します"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {userData.status === 'suspended' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(userData.user_id || userData.id, 'approve')}
                            disabled={loading}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 transition-all"
                            title="ユーザーの停止を解除します"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`ユーザー詳細情報:\n名前: ${userData.name}\nメール: ${userData.email}\n登録日: ${formatDate(userData.created_at)}\n権限: ${userData.role}\n活動統計:\n- 投稿案件: ${userData.job_posts_count}\n- 登録人材: ${userData.talent_profiles_count}\n- 登録企業: ${userData.partner_companies_count}`)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 transition-all"
                          title="ユーザー詳細を表示"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`本当にユーザー "${userData.name}" を削除しますか？\nこの操作は取り消しできません。`)) {
                              handleUserAction(userData.user_id || userData.id, 'delete')
                            }
                          }}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all"
                          title="ユーザーを完全に削除します"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-mono-light mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mono-darkest mb-2">
                ユーザーが見つかりませんでした
              </h3>
              <p className="text-mono-medium">
                検索条件を変更して再度お試しください
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}