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

export const TALENT_STATUS_OPTIONS = [
  { value: 'available', label: '利用可能' },
  { value: 'busy', label: '多忙' },
  { value: 'unavailable', label: '利用不可' },
  { value: 'assigned', label: 'アサイン済み' },
] as const

export const STATUS_COLORS = {
  available: 'success',
  busy: 'warning',
  unavailable: 'error',
  assigned: 'primary',
} as const