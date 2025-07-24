import { usePWA } from '@/hooks/usePWA'
import { Badge } from '@/components/ui/Badge'
import {
  WifiOff,
  Wifi,
} from 'lucide-react'

export default function OfflineIndicator() {
  const { isOffline } = usePWA()

  if (!isOffline) {
    return null
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
      <Badge 
        variant="destructive" 
        className="flex items-center gap-2 px-3 py-2 shadow-lg animate-fade-in"
      >
        <WifiOff className="w-4 h-4" />
        <span>オフライン</span>
      </Badge>
    </div>
  )
}