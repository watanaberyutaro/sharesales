export const COMPANY_SIZE_OPTIONS = [
  { value: 'startup', label: 'スタートアップ（1-10名）' },
  { value: 'small', label: '小規模（11-50名）' },
  { value: 'medium', label: '中規模（51-200名）' },
  { value: 'large', label: '大規模（201名以上）' },
] as const

export const SPECIALTY_OPTIONS = [
  'ドコモ',
  'au',
  'ソフトバンク',
  '楽天モバイル',
  'MVNO',
  '店舗運営',
  '販売代理',
  'カスタマーサポート',
  '法人営業',
  '個人営業',
  'システム開発',
  'マーケティング',
  '研修・教育',
  'コンサルティング',
] as const

export const COMPANY_SIZE_COLORS = {
  startup: 'success',
  small: 'primary',
  medium: 'warning',
  large: 'error',
} as const