import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Download,
  X,
  Smartphone,
  Monitor,
  Wifi,
  Zap,
} from 'lucide-react'

export default function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(true)
  const { isInstallable, installApp } = usePWA()

  if (!isInstallable || !isVisible) {
    return null
  }

  const handleInstall = async () => {
    try {
      await installApp()
      setIsVisible(false)
    } catch (error) {
      console.error('Failed to install app:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-kontext-blue shadow-lg md:left-auto md:right-4 md:w-96">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-kontext-blue-light rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-kontext-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-mono-darkest">
                アプリをインストール
              </h3>
              <p className="text-sm text-mono-medium">
                より快適にご利用いただけます
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-mono-medium hover:text-mono-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-mono-medium">
            <Smartphone className="w-4 h-4 text-kontext-blue" />
            <span>ホーム画面に追加</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-mono-medium">
            <Monitor className="w-4 h-4 text-kontext-blue" />
            <span>フルスクリーン表示</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-mono-medium">
            <Wifi className="w-4 h-4 text-kontext-blue" />
            <span>オフライン対応</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-mono-medium">
            <Zap className="w-4 h-4 text-kontext-blue" />
            <span>高速起動</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            インストール
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="px-3"
          >
            後で
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}