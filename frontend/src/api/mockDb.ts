// 과제 4(연동)에서 삭제될 mock 데이터 저장소. localStorage에 저장해서 새로고침해도 유지됨.

interface DbUser {
  id: number
  nickname: string
  email: string
  password: string
  role: 'user' | 'admin'
  createdAt: string
}

interface DbProject {
  id: number
  ownerId: number
  title: string
  description: string
  thumbnailUrl: string
  playUrl: string
  viewCount: number
  createdAt: string
}

interface DbComment {
  id: number
  projectId: number
  userId: number
  content: string
  createdAt: string
}

export interface Db {
  users: DbUser[]
  projects: DbProject[]
  comments: DbComment[]
  likes: { userId: number; projectId: number }[]
  subscriptions: { subscriberId: number; targetId: number }[]
  seenChannels: { userId: number; targetId: number; seenAt: string }[]
  sessionUserId: number | null
  seq: number
}

const KEY = 'htmlhub:mockdb:v1'
const DAY = 86_400_000

function ago(ms: number) {
  return new Date(Date.now() - ms).toISOString()
}

function thumb(title: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 85% 55%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 80% 30%)"/></linearGradient></defs>
<rect width="640" height="360" fill="url(#g)"/>
<path d="M0 300 L640 220 L640 360 L0 360Z" fill="rgba(0,0,0,.18)"/>
<text x="40" y="200" font-family="system-ui,sans-serif" font-size="54" font-weight="800" font-style="italic" fill="#fff">${title}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function seed(): Db {
  const users: DbUser[] = [
    { id: 1, nickname: '데모유저', email: 'demo@htmlhub.dev', password: 'password123', role: 'admin', createdAt: ago(90 * DAY) },
    { id: 2, nickname: '픽셀장인', email: 'pixel@htmlhub.dev', password: 'password123', role: 'user', createdAt: ago(80 * DAY) },
    { id: 3, nickname: '캔버스러버', email: 'canvas@htmlhub.dev', password: 'password123', role: 'user', createdAt: ago(60 * DAY) },
    { id: 4, nickname: 'JS마법사', email: 'js@htmlhub.dev', password: 'password123', role: 'user', createdAt: ago(40 * DAY) },
    { id: 5, nickname: '야근개발자', email: 'night@htmlhub.dev', password: 'password123', role: 'user', createdAt: ago(20 * DAY) },
  ]
  const games = ['snake', 'reaction', 'clicker', 'paint']
  const titles: [string, number, string][] = [
    ['네온 스네이크', 2, '고전 스네이크를 네온 감성으로. 방향키로 조작하고 최고 점수에 도전하세요.'],
    ['반응속도 측정기', 3, '화면이 주황색으로 바뀌는 순간 클릭! 당신의 반응속도는 몇 ms?'],
    ['무한 클리커', 4, '클릭하고, 업그레이드하고, 또 클릭하는 그 게임.'],
    ['픽셀 그림판', 2, '게임만 되는 게 아님. 브라우저에서 바로 쓰는 미니 그림판.'],
    ['스네이크 하드모드', 5, '속도 두 배. 손가락 풀고 오세요.'],
    ['0.2초의 승부', 4, '친구랑 번갈아 하면서 반응속도 내기하기 좋은 게임.'],
    ['쿠키 공장 Lite', 3, '클리커 장르의 정석을 아주 가볍게.'],
    ['낙서 캔버스', 5, '마우스로 쓱쓱. 저장은 안 됩니다 ㅎㅎ'],
    ['레트로 뱀', 3, '8비트 감성 스네이크.'],
    ['집중력 테스트', 2, '기다리고, 기다리고, 클릭.'],
    ['클릭 마라톤', 1, '데모유저가 올린 첫 번째 게임!'],
    ['스케치북', 4, '심심할 때 켜두는 그림판.'],
  ]
  const projects: DbProject[] = titles.map(([title, ownerId, description], i) => ({
    id: i + 1,
    ownerId,
    title,
    description,
    thumbnailUrl: thumb(title, (i * 37 + 15) % 360),
    playUrl: `/mock-games/${games[i % games.length]}.html`,
    viewCount: Math.round(50 + ((i * 7919) % 9000)),
    createdAt: ago((i * 2.3 + 0.2) * DAY),
  }))
  const comments: DbComment[] = [
    { id: 1, projectId: 1, userId: 3, content: '최고점 87점 찍었습니다 ㅋㅋ', createdAt: ago(0.1 * DAY) },
    { id: 2, projectId: 1, userId: 4, content: '방향키 반응 좋네요. 모바일도 되면 좋겠다', createdAt: ago(0.5 * DAY) },
    { id: 3, projectId: 2, userId: 5, content: '213ms 나옴.. 늙었나', createdAt: ago(1 * DAY) },
  ]
  const likes = [
    { userId: 1, projectId: 1 }, { userId: 3, projectId: 1 }, { userId: 4, projectId: 1 },
    { userId: 1, projectId: 2 }, { userId: 2, projectId: 3 },
  ]
  const subscriptions = [
    { subscriberId: 1, targetId: 2 }, { subscriberId: 1, targetId: 3 },
    { subscriberId: 3, targetId: 2 }, { subscriberId: 4, targetId: 2 },
  ]
  return {
    users, projects, comments, likes, subscriptions,
    seenChannels: [{ userId: 1, targetId: 3, seenAt: ago(0) }],
    sessionUserId: null,
    seq: 1000,
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    // localStorage 사용 불가 → seed로 시작
  }
  return seed()
}

export const db: Db = load()

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // 용량 초과 등은 무시 (mock)
  }
}

export function nextId() {
  db.seq += 1
  return db.seq
}
