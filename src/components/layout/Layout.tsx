import { Outlet } from 'react-router-dom'
import GlobalMenu from './GlobalMenu'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalMenu />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}