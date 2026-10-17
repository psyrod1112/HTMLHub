import { Link } from 'react-router-dom'
import type { Project } from '../api/types'
import { compactCount, timeAgo } from '../lib/format'
import { Avatar } from './Header'

export default function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className={`card ${compact ? 'card-compact' : ''}`}>
      <Link to={`/p/${project.id}`} className="card-thumb">
        <img src={project.thumbnailUrl} alt="" loading="lazy" />
      </Link>
      <div className="card-body">
        {!compact && (
          <Link to={`/u/${project.owner.id}`} className="card-avatar">
            <Avatar name={project.owner.nickname} size={36} />
          </Link>
        )}
        <div className="card-meta">
          <Link to={`/p/${project.id}`} className="card-title">{project.title}</Link>
          <Link to={`/u/${project.owner.id}`} className="card-owner">{project.owner.nickname}</Link>
          <span className="card-stats">
            조회수 {compactCount(project.viewCount)}회 · {timeAgo(project.createdAt)}
          </span>
        </div>
      </div>
    </article>
  )
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  )
}
