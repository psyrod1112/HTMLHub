import { useEffect, useState } from 'react'
import * as api from '../api'
import type { Project, ProjectSort } from '../api/types'
import { ProjectGrid } from '../components/ProjectCard'

export default function Home() {
  const [sort, setSort] = useState<ProjectSort>('latest')
  const [items, setItems] = useState<Project[] | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setItems(null)
    setPage(0)
    api.listProjects(sort, 0).then((r) => {
      setItems(r.items)
      setHasMore(r.hasMore)
    })
  }, [sort])

  const more = async () => {
    setLoadingMore(true)
    const r = await api.listProjects(sort, page + 1)
    setItems((prev) => [...(prev ?? []), ...r.items])
    setHasMore(r.hasMore)
    setPage(page + 1)
    setLoadingMore(false)
  }

  return (
    <div className="page">
      <div className="chips">
        {(['latest', 'popular'] as const).map((s) => (
          <button key={s} className={`chip ${sort === s ? 'active' : ''}`} onClick={() => setSort(s)}>
            {s === 'latest' ? '최신' : '인기'}
          </button>
        ))}
      </div>
      {items === null ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <p className="page-msg">아직 등록된 HTML이 없어요. 첫 번째로 올려보세요!</p>
      ) : (
        <>
          <ProjectGrid projects={items} />
          {hasMore && (
            <div className="center">
              <button className="btn btn-outline" onClick={more} disabled={loadingMore}>
                {loadingMore ? '불러오는 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div className="grid">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="card skeleton">
          <div className="card-thumb" />
          <div className="sk-line" />
          <div className="sk-line short" />
        </div>
      ))}
    </div>
  )
}
