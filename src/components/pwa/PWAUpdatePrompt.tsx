import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  RefreshCw,
  X,
  Download,
  Sparkles,
} from 'lucide-react'

export default function PWAUpdatePrompt() {
  const [isVisible, setIsVisible] = useState(true)
  const { isUpdateAvailable, updateApp } = usePWA()

  if (!isUpdateAvailable || !isVisible) {
    return null
  }

  const handleUpdate = () => {
    updateApp()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-green-500 shadow-lg md:left-auto md:right-4 md:w-96">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-mono-darkest">
                アップデート利用可能
              </h3>
              <p className="text-sm text-mono-medium">
                新しいバージョンが利用できます
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

        <div className="flex items-start gap-2 mb-4 p-3 bg-green-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">新機能とバグ修正</p>
            <ul className="text-xs space-y-1">
              <li>• パフォーマンスの向上</li>
              <li>• 新しいマッチング機能</li>
              <li>• セキュリティの強化</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            今すぐ更新
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="px-3"
          >
            後で
          </Button>
        </div>

        <p className="text-xs text-mono-medium mt-2 text-center">
          更新後にページが再読み込みされます
        </p>
      </CardContent>
    </Card>
  )
}