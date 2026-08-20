/** 日记元数据选项：天气 / 心情 */

export interface MetaOption {
  id: string
  label: string
  icon: string
}

export const WEATHER_OPTIONS: MetaOption[] = [
  { id: 'sunny', label: '晴', icon: '☀' },
  { id: 'cloudy', label: '多云', icon: '⛅' },
  { id: 'overcast', label: '阴', icon: '☁' },
  { id: 'rain', label: '雨', icon: '🌧' },
  { id: 'snow', label: '雪', icon: '❄' },
  { id: 'wind', label: '风', icon: '🌬' }
]

export const MOOD_OPTIONS: MetaOption[] = [
  { id: 'happy', label: '开心', icon: '😄' },
  { id: 'calm', label: '平静', icon: '😌' },
  { id: 'sad', label: '难过', icon: '😢' },
  { id: 'angry', label: '生气', icon: '😠' },
  { id: 'tired', label: '疲惫', icon: '😪' },
  { id: 'excited', label: '兴奋', icon: '🤩' }
]

export function metaBy(options: MetaOption[], id?: string): MetaOption | undefined {
  return options.find((o) => o.id === id)
}
