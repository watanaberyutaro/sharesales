import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ApprovalPending from './pages/auth/ApprovalPending'
import Dashboard from './pages/Dashboard'
import JobList from './pages/jobs/JobList'
import JobDetail from './pages/jobs/JobDetail'
import JobForm from './pages/jobs/JobForm'
import MyJobs from './pages/jobs/MyJobs'
import TalentList from './pages/talents/TalentList'
import TalentDetail from './pages/talents/TalentDetail'
import TalentForm from './pages/talents/TalentForm'
import MyTalents from './pages/talents/MyTalents'
import PartnerList from './pages/partners/PartnerList'
import PartnerDetail from './pages/partners/PartnerDetail'
import PartnerForm from './pages/partners/PartnerForm'
import MyPartners from './pages/partners/MyPartners'
import MatchList from './pages/matches/MatchList'
import MatchDetail from './pages/matches/MatchDetail'
import AssignmentList from './pages/assignments/AssignmentList'
import MessageList from './pages/messages/MessageList'
import MessageChat from './pages/messages/MessageChat'
import Timeline from './pages/timeline/Timeline'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ContentManagement from './pages/admin/ContentManagement'
import Settings from './pages/settings/Settings'
import Favorites from './pages/favorites/Favorites'
import Notifications from './pages/notifications/Notifications'
import Search from './pages/search/Search'
import Sales from './pages/sales/Sales'
import Reports from './pages/reports/Reports'
import ChatRooms from './pages/chat-rooms/ChatRooms'
import { useSupabaseStore } from './stores/supabaseStore'

function AppRoutes() {
  const { isAuthenticated, loading } = useSupabaseStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kontext-blue"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route path="/approval-pending" element={<ApprovalPending />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          
          {/* Job Routes */}
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/new" element={<JobForm />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/edit" element={<JobForm />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          
          {/* Talent Routes */}
          <Route path="/talents" element={<TalentList />} />
          <Route path="/talents/new" element={<TalentForm />} />
          <Route path="/talents/:id" element={<TalentDetail />} />
          <Route path="/talents/:id/edit" element={<TalentForm />} />
          <Route path="/my-talents" element={<MyTalents />} />
          
          {/* Partner Routes */}
          <Route path="/partners" element={<PartnerList />} />
          <Route path="/partners/new" element={<PartnerForm />} />
          <Route path="/partners/:id" element={<PartnerDetail />} />
          <Route path="/partners/:id/edit" element={<PartnerForm />} />
          <Route path="/my-partners" element={<MyPartners />} />
          
          {/* Match & Assignment Routes */}
          <Route path="/matches" element={<MatchList />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/assignments" element={<AssignmentList />} />
          
          {/* Message Routes */}
          <Route path="/messages" element={<MessageList />} />
          <Route path="/messages/:id" element={<MessageChat />} />
          
          {/* Timeline Route */}
          <Route path="/timeline" element={<Timeline />} />
          
          {/* Notifications Route */}
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Search Route */}
          <Route path="/search" element={<Search />} />
          
          {/* Sales Route */}
          <Route path="/sales" element={<Sales />} />
          
          {/* Reports Route */}
          <Route path="/reports" element={<Reports />} />
          
          {/* Chat Rooms Route */}
          <Route path="/chat-rooms" element={<ChatRooms />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/content" element={<ContentManagement />} />
          
          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Favorites Route */}
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes