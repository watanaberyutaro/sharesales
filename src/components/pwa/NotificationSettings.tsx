import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Bell,
  BellOff,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TestTube,
} from 'lucide-react'

export default function NotificationSettings() {
  const {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification
  } = useNotifications()

  const [loading, setLoading] = useState(false)

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            プッシュ通知
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-mono-medium">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>お使いのブラウザはプッシュ通知をサポートしていません</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge variant="success" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            許可済み
          </Badge>
        )
      case 'denied':
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            拒否
          </Badge>
        )
      default:
        return (
          <Badge variant="warning" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            未設定
          </Badge>
        )
    }
  }

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        await subscribeToNotifications()
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setLoading(true)
    try {
      await unsubscribeFromNotifications()
    } catch (error) {
      console.error('Failed to disable notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mono-darkest flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            プッシュ通知
          </h2>
          {getPermissionBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-4 bg-mono-lightest rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-mono-darkest">通知状態</span>
              <Badge variant={isSubscribed ? 'success' : 'outline'} className="text-xs">
                {isSubscribed ? '有効' : '無効'}
              </Badge>
            </div>
            <p className="text-sm text-mono-medium">
              {isSubscribed 
                ? '新しいマッチングやメッセージの通知を受け取ります'
                : 'プッシュ通知は無効になっています'
              }
            </p>
          </div>

          {/* Notification Types */}
          <div className="space-y-3">
            <h3 className="font-medium text-mono-darkest">通知の種類</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
                <div>
                  <p className="font-medium text-mono-darkest">新しいマッチング</p>
                  <p className="text-sm text-mono-medium">案件と人材のマッチングが成立した時</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={isSubscribed}
                  disabled={!isSubscribed}
                  className="w-4 h-4 text-kontext-blue"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
                <div>
                  <p className="font-medium text-mono-darkest">新しいメッセージ</p>
                  <p className="text-sm text-mono-medium">チャットで新しいメッセージを受信した時</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={isSubscribed}
                  disabled={!isSubscribed}
                  className="w-4 h-4 text-kontext-blue"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
                <div>
                  <p className="font-medium text-mono-darkest">案件の更新</p>
                  <p className="text-sm text-mono-medium">関心のある案件に更新があった時</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={isSubscribed}
                  disabled={!isSubscribed}
                  className="w-4 h-4 text-kontext-blue"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-mono-lighter rounded-lg">
                <div>
                  <p className="font-medium text-mono-darkest">システム通知</p>
                  <p className="text-sm text-mono-medium">重要なお知らせやアップデート情報</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={isSubscribed}
                  disabled={!isSubscribed}
                  className="w-4 h-4 text-kontext-blue"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {!isSubscribed ? (
              <Button
                onClick={handleEnableNotifications}
                disabled={loading}
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                {loading ? '設定中...' : 'プッシュ通知を有効にする'}
              </Button>
            ) : (
              <Button
                onClick={handleDisableNotifications}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <BellOff className="w-4 h-4 mr-2" />
                {loading ? '設定中...' : 'プッシュ通知を無効にする'}
              </Button>
            )}

            {isSubscribed && (
              <Button
                onClick={sendTestNotification}
                variant="outline"
                className="w-full"
              >
                <TestTube className="w-4 h-4 mr-2" />
                テスト通知を送信
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-mono-medium space-y-2">
            <p>
              <strong>ヒント:</strong> 通知を有効にすると、重要な更新を見逃さずに済みます。
            </p>
            {permission === 'denied' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  通知が拒否されています。ブラウザの設定から通知を許可してください。
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}