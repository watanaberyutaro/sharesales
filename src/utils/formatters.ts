import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'yyyy年MM月dd日', { locale: ja })
}

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'yyyy年MM月dd日 HH:mm', { locale: ja })
}

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja })
}

export const formatCurrency = (amount: number) => {
  return `¥${amount.toLocaleString()}`
}

export const formatWorkDays = (days: number) => {
  return `${days}日間`
}

export const getStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    draft: '下書き',
    active: '募集中',
    closed: '募集終了',
    completed: '完了',
    assigned: 'アサイン済み',
    available: '利用可能',
    busy: '多忙',
    unavailable: '利用不可',
    pending: '承認待ち',
    accepted: '承認済み',
    rejected: '却下',
    contracted: '契約済み',
  }
  return statusLabels[status] || status
}

export const getWorkTypeLabel = (type: string) => {
  const typeLabels: Record<string, string> = {
    fulltime: '常勤',
    event: 'イベント',
    retail: '店舗',
    any: '問わない',
  }
  return typeLabels[type] || type
}