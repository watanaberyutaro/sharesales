export const SKILL_OPTIONS = [
  'ドコモ経験',
  'au経験',
  'ソフトバンク経験',
  '楽天モバイル経験',
  'MVNO経験',
  '常勤スタッフ',
  'イベントクローザー',
  'イベントキャッチャー',
] as const

export const CARRIER_OPTIONS = [
  'ドコモ',
  'au',
  'ソフトバンク',
  '楽天モバイル',
  'MVNO',
  'その他',
] as const

export const WORK_TYPE_OPTIONS = [
  { value: 'fulltime', label: '常勤' },
  { value: 'event', label: 'イベント' },
  { value: 'retail', label: '店舗' },
  { value: 'any', label: '問わない' },
] as const

export const JOB_STATUS_OPTIONS = [
  { value: 'draft', label: '下書き' },
  { value: 'active', label: '募集中' },
  { value: 'closed', label: '募集終了' },
  { value: 'completed', label: '完了' },
  { value: 'assigned', label: 'アサイン済み' },
] as const

export const STATUS_COLORS = {
  draft: 'default',
  active: 'success',
  closed: 'warning',
  completed: 'primary',
  assigned: 'primary',
} as const