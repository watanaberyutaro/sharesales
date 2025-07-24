import { Navigate, Outlet } from 'react-router-dom'
import { useSupabaseStore } from '@/stores/supabaseStore'
import { useDataStore } from '@/stores/dataStore'
import { useEffect, useState } from 'react'

export const ProtectedRoute = () => {
  const { isAuthenticated, user, loading } = useSupabaseStore()
  const { isUserApproved, fetchApprovedUsers, approvedUsers, getUserStatusFromStorage } = useDataStore()
  const [approvalLoading, setApprovalLoading] = useState(true)

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (user && user.id) {
        console.log('🔍 Checking approval status for user:', user.id)
        
        // Fetch approved users if not already loaded
        if (approvedUsers.length === 0) {
          console.log('📋 Fetching approved users...')
          await fetchApprovedUsers()
        }
        
        // Check localStorage status
        const localStatus = getUserStatusFromStorage(user.id)
        console.log('💾 Local status from localStorage:', localStatus)
        
        // Check if user is in approved users table
        const isApproved = isUserApproved(user.id)
        console.log('✅ Is user approved in database:', isApproved)
        console.log('👥 Total approved users:', approvedUsers.length)
        
        setApprovalLoading(false)
      } else {
        setApprovalLoading(false)
      }
    }

    if (!loading && isAuthenticated) {
      checkApprovalStatus()
    } else {
      setApprovalLoading(false)
    }
  }, [user, loading, isAuthenticated, fetchApprovedUsers, isUserApproved, approvedUsers.length, getUserStatusFromStorage])

  if (loading || approvalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kontext-blue"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && user.role !== 'admin') {
    const localStatus = getUserStatusFromStorage(user.id)
    const isApprovedInDB = isUserApproved(user.id)
    
    console.log('🎯 Final approval check:', {
      userId: user.id,
      role: user.role,
      localStatus,
      isApprovedInDB,
      shouldAllow: localStatus === 'approved' || isApprovedInDB
    })
    
    // Allow access if user is approved in localStorage OR in approved_users table
    if (localStatus !== 'approved' && !isApprovedInDB) {
      console.log('❌ User not approved, redirecting to approval pending')
      return <Navigate to="/approval-pending" replace />
    }
  }

  console.log('✅ User has access to protected routes')
  return <Outlet />
}