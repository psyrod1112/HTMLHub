export function timeAgo(iso: string) {
  const sec = Math.max(0, (Date.now() - Date.parse(iso)) / 1000)
  if (sec < 60) return '방금 전'
  const units: [number, string][] = [
    [60, '분'], [24, '시간'], [7, '일'], [4.345, '주'], [12, '개월'], [Infinity, '년'],
  ]
  let v = sec / 60
  for (const [size, label] of units) {
    if (v < size) return `${Math.floor(v)}${label} 전`
    v /= size
  }
  return ''
}

export function compactCount(n: number) {
  if (n < 1000) return String(n)
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천`
  if (n < 100_000_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}만`
  return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`
}
