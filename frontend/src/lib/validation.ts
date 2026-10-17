// 클라이언트 검증은 UX용. 진짜 검증은 서버에서 다시 함 (설계 7번 업로드 검증)
export const LIMITS = {
  bundleBytes: 50 * 1024 * 1024,
  thumbnailBytes: 5 * 1024 * 1024,
  titleMax: 100,
  descriptionMax: 5000,
  commentMax: 1000,
  nicknameMin: 2,
  nicknameMax: 20,
  passwordMin: 8,
}

const THUMB_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : '이메일 형식이 맞지 않아요.'
}

export function validatePassword(v: string) {
  if (v.length < LIMITS.passwordMin) return `비밀번호는 ${LIMITS.passwordMin}자 이상이어야 해요.`
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return '영문과 숫자를 모두 포함해야 해요.'
  return null
}

export function validateNickname(v: string) {
  const t = v.trim()
  if (t.length < LIMITS.nicknameMin || t.length > LIMITS.nicknameMax)
    return `닉네임은 ${LIMITS.nicknameMin}~${LIMITS.nicknameMax}자여야 해요.`
  if (!/^[0-9A-Za-z가-힣_]+$/.test(t)) return '닉네임은 한글, 영문, 숫자, _만 쓸 수 있어요.'
  return null
}

export function validateBundle(f: File | null) {
  if (!f) return 'HTML 파일이나 zip 파일을 올려주세요.'
  const name = f.name.toLowerCase()
  if (!name.endsWith('.html') && !name.endsWith('.zip')) return '.html 또는 .zip 파일만 올릴 수 있어요.'
  if (f.size > LIMITS.bundleBytes) return '파일은 50MB 이하만 올릴 수 있어요.'
  return null
}

export function validateThumbnail(f: File | null) {
  if (!f) return '썸네일 이미지를 올려주세요.'
  if (!THUMB_TYPES.includes(f.type)) return 'PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요.'
  if (f.size > LIMITS.thumbnailBytes) return '썸네일은 5MB 이하만 올릴 수 있어요.'
  return null
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n}B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`
  return `${(n / 1024 / 1024).toFixed(1)}MB`
}
