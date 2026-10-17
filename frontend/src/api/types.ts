export interface UserSummary {
  id: number
  nickname: string
}

export interface User extends UserSummary {
  subscriberCount: number
  projectCount: number
  createdAt: string
  subscribedByMe: boolean
}

export interface Me extends UserSummary {
  email: string
  role: 'user' | 'admin'
}

export interface Project {
  id: number
  owner: UserSummary
  title: string
  description: string
  thumbnailUrl: string
  playUrl: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  likedByMe: boolean
}

export interface Comment {
  id: number
  projectId: number
  user: UserSummary
  content: string
  createdAt: string
}

export interface SubscribedChannel extends UserSummary {
  hasNew: boolean
}

export interface Page<T> {
  items: T[]
  hasMore: boolean
}

export type ProjectSort = 'latest' | 'popular'

export interface CreateProjectInput {
  title: string
  description: string
  thumbnail: File
  bundle: File
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
