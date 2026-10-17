// 화면이 쓰는 API 함수 모음. 지금은 mockDb로 동작하고,
// 과제 4(연동)에서 함수 시그니처는 그대로 두고 내부만 fetch로 교체한다.
import { db, nextId, save } from './mockDb'
import {
  ApiError,
  type Comment,
  type CreateProjectInput,
  type Me,
  type Page,
  type Project,
  type ProjectSort,
  type SubscribedChannel,
  type User,
  type UserSummary,
} from './types'

const PAGE_SIZE = 8
const NEW_WINDOW = 3 * 86_400_000

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function requireMe() {
  const me = db.users.find((u) => u.id === db.sessionUserId)
  if (!me) throw new ApiError(401, '로그인이 필요해요.')
  return me
}

function summary(userId: number): UserSummary {
  const u = db.users.find((x) => x.id === userId)
  return { id: userId, nickname: u?.nickname ?? '(탈퇴한 유저)' }
}

function toProject(p: (typeof db.projects)[number]): Project {
  return {
    id: p.id,
    owner: summary(p.ownerId),
    title: p.title,
    description: p.description,
    thumbnailUrl: p.thumbnailUrl,
    playUrl: p.playUrl,
    viewCount: p.viewCount,
    likeCount: db.likes.filter((l) => l.projectId === p.id).length,
    commentCount: db.comments.filter((c) => c.projectId === p.id).length,
    createdAt: p.createdAt,
    likedByMe: db.likes.some((l) => l.projectId === p.id && l.userId === db.sessionUserId),
  }
}

function paginate<T>(all: T[], page: number): Page<T> {
  const start = page * PAGE_SIZE
  return { items: all.slice(start, start + PAGE_SIZE), hasMore: start + PAGE_SIZE < all.length }
}

function byLatest(a: { createdAt: string }, b: { createdAt: string }) {
  return b.createdAt.localeCompare(a.createdAt)
}

// ---------- Auth ----------

export async function signup(input: { nickname: string; email: string; password: string }) {
  if (db.users.some((u) => u.email === input.email)) throw new ApiError(409, '이미 가입된 이메일이에요.')
  if (db.users.some((u) => u.nickname === input.nickname)) throw new ApiError(409, '이미 사용 중인 닉네임이에요.')
  db.users.push({ id: nextId(), ...input, role: 'user', createdAt: new Date().toISOString() })
  save()
  return delay(undefined)
}

export async function login(input: { email: string; password: string }): Promise<Me> {
  const u = db.users.find((x) => x.email === input.email && x.password === input.password)
  if (!u) throw new ApiError(401, '이메일 또는 비밀번호가 맞지 않아요.')
  db.sessionUserId = u.id
  save()
  return delay({ id: u.id, nickname: u.nickname, email: u.email, role: u.role })
}

export async function logout() {
  db.sessionUserId = null
  save()
  return delay(undefined, 50)
}

export async function getMe(): Promise<Me | null> {
  const u = db.users.find((x) => x.id === db.sessionUserId)
  return delay(u ? { id: u.id, nickname: u.nickname, email: u.email, role: u.role } : null, 50)
}

export async function requestPasswordReset(_email: string) {
  // 실제로는 Resend로 메일 발송. 가입 여부와 상관없이 같은 응답 (이메일 존재 여부 노출 방지)
  return delay(undefined, 400)
}

export async function resetPassword(token: string, _password: string) {
  if (!token) throw new ApiError(400, '링크가 만료되었거나 잘못되었어요.')
  return delay(undefined, 400)
}

export async function deleteAccount() {
  const me = requireMe()
  const myProjectIds = new Set(db.projects.filter((p) => p.ownerId === me.id).map((p) => p.id))
  db.users = db.users.filter((u) => u.id !== me.id)
  db.projects = db.projects.filter((p) => p.ownerId !== me.id)
  db.comments = db.comments.filter((c) => c.userId !== me.id && !myProjectIds.has(c.projectId))
  db.likes = db.likes.filter((l) => l.userId !== me.id && !myProjectIds.has(l.projectId))
  db.subscriptions = db.subscriptions.filter((s) => s.subscriberId !== me.id && s.targetId !== me.id)
  db.sessionUserId = null
  save()
  return delay(undefined, 400)
}

// ---------- Users / Subscriptions ----------

export async function getUser(id: number): Promise<User> {
  const u = db.users.find((x) => x.id === id)
  if (!u) throw new ApiError(404, '존재하지 않는 유저예요.')
  return delay({
    id: u.id,
    nickname: u.nickname,
    createdAt: u.createdAt,
    subscriberCount: db.subscriptions.filter((s) => s.targetId === id).length,
    projectCount: db.projects.filter((p) => p.ownerId === id).length,
    subscribedByMe: db.subscriptions.some((s) => s.targetId === id && s.subscriberId === db.sessionUserId),
  })
}

export async function getUserProjects(id: number): Promise<Project[]> {
  return delay(db.projects.filter((p) => p.ownerId === id).sort(byLatest).map(toProject))
}

export async function getMyLikes(): Promise<Project[]> {
  const me = requireMe()
  const ids = new Set(db.likes.filter((l) => l.userId === me.id).map((l) => l.projectId))
  return delay(db.projects.filter((p) => ids.has(p.id)).sort(byLatest).map(toProject))
}

export async function getMySubscriptions(): Promise<SubscribedChannel[]> {
  const me = db.users.find((x) => x.id === db.sessionUserId)
  if (!me) return delay([], 50)
  const list = db.subscriptions
    .filter((s) => s.subscriberId === me.id)
    .map((s) => {
      const seen = db.seenChannels.find((x) => x.userId === me.id && x.targetId === s.targetId)?.seenAt
      const latest = db.projects.filter((p) => p.ownerId === s.targetId).sort(byLatest)[0]?.createdAt
      const hasNew = !!latest && Date.now() - Date.parse(latest) < NEW_WINDOW && (!seen || latest > seen)
      return { ...summary(s.targetId), hasNew }
    })
  return delay(list, 50)
}

export async function markChannelSeen(targetId: number) {
  const me = db.users.find((x) => x.id === db.sessionUserId)
  if (!me) return
  db.seenChannels = db.seenChannels.filter((x) => !(x.userId === me.id && x.targetId === targetId))
  db.seenChannels.push({ userId: me.id, targetId, seenAt: new Date().toISOString() })
  save()
}

export async function subscribe(targetId: number) {
  const me = requireMe()
  if (me.id === targetId) throw new ApiError(400, '자기 자신은 구독할 수 없어요.')
  if (!db.subscriptions.some((s) => s.subscriberId === me.id && s.targetId === targetId)) {
    db.subscriptions.push({ subscriberId: me.id, targetId })
    save()
  }
  return delay(undefined, 100)
}

export async function unsubscribe(targetId: number) {
  const me = requireMe()
  db.subscriptions = db.subscriptions.filter((s) => !(s.subscriberId === me.id && s.targetId === targetId))
  save()
  return delay(undefined, 100)
}

export async function getSubscriptionFeed(page = 0): Promise<Page<Project>> {
  const me = requireMe()
  const targets = new Set(db.subscriptions.filter((s) => s.subscriberId === me.id).map((s) => s.targetId))
  const all = db.projects.filter((p) => targets.has(p.ownerId)).sort(byLatest).map(toProject)
  return delay(paginate(all, page))
}

// ---------- Projects ----------

export async function listProjects(sort: ProjectSort, page = 0): Promise<Page<Project>> {
  const all = [...db.projects]
  if (sort === 'latest') all.sort(byLatest)
  else all.sort((a, b) => b.viewCount - a.viewCount)
  return delay(paginate(all.map(toProject), page))
}

export async function getProject(id: number): Promise<Project> {
  const p = db.projects.find((x) => x.id === id)
  if (!p) throw new ApiError(404, '존재하지 않거나 삭제된 프로젝트예요.')
  return delay(toProject(p))
}

export async function getRecommendations(id: number): Promise<Project[]> {
  // MVP: 현재 프로젝트 제외 인기순. Ver2에서 태그 유사도 알고리즘으로 교체
  const list = db.projects
    .filter((p) => p.id !== id)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10)
    .map(toProject)
  return delay(list)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const me = requireMe()
  const isHtml = input.bundle.name.toLowerCase().endsWith('.html')
  const p = {
    id: nextId(),
    ownerId: me.id,
    title: input.title,
    description: input.description,
    // mock: 브라우저 메모리 URL이라 새로고침하면 깨짐. 실제로는 R2 경로
    thumbnailUrl: URL.createObjectURL(input.thumbnail),
    playUrl: isHtml ? URL.createObjectURL(input.bundle) : '/mock-games/zip-pending.html',
    viewCount: 0,
    createdAt: new Date().toISOString(),
  }
  db.projects.push(p)
  save()
  return delay(toProject(p), 800)
}

export async function deleteProject(id: number) {
  const me = requireMe()
  const p = db.projects.find((x) => x.id === id)
  if (!p) throw new ApiError(404, '존재하지 않는 프로젝트예요.')
  if (p.ownerId !== me.id && me.role !== 'admin') throw new ApiError(403, '삭제 권한이 없어요.')
  db.projects = db.projects.filter((x) => x.id !== id)
  db.comments = db.comments.filter((c) => c.projectId !== id)
  db.likes = db.likes.filter((l) => l.projectId !== id)
  save()
  return delay(undefined, 300)
}

export async function recordView(id: number) {
  // 2배수 규칙은 서버(Upstash)에서 판단. mock은 무조건 +1
  const p = db.projects.find((x) => x.id === id)
  if (p) {
    p.viewCount += 1
    save()
  }
  return delay(undefined, 50)
}

// ---------- Likes ----------

export async function likeProject(id: number) {
  const me = requireMe()
  if (!db.likes.some((l) => l.userId === me.id && l.projectId === id)) {
    db.likes.push({ userId: me.id, projectId: id })
    save()
  }
  return delay(undefined, 100)
}

export async function unlikeProject(id: number) {
  const me = requireMe()
  db.likes = db.likes.filter((l) => !(l.userId === me.id && l.projectId === id))
  save()
  return delay(undefined, 100)
}

// ---------- Comments ----------

export async function listComments(projectId: number): Promise<Comment[]> {
  const list = db.comments
    .filter((c) => c.projectId === projectId)
    .sort(byLatest)
    .map((c) => ({ id: c.id, projectId: c.projectId, user: summary(c.userId), content: c.content, createdAt: c.createdAt }))
  return delay(list)
}

export async function createComment(projectId: number, content: string): Promise<Comment> {
  const me = requireMe()
  const c = { id: nextId(), projectId, userId: me.id, content, createdAt: new Date().toISOString() }
  db.comments.push(c)
  save()
  return delay({ ...c, user: summary(me.id) }, 150)
}

export async function deleteComment(id: number) {
  const me = requireMe()
  const c = db.comments.find((x) => x.id === id)
  if (!c) throw new ApiError(404, '이미 삭제된 댓글이에요.')
  if (c.userId !== me.id && me.role !== 'admin') throw new ApiError(403, '삭제 권한이 없어요.')
  db.comments = db.comments.filter((x) => x.id !== id)
  save()
  return delay(undefined, 100)
}
