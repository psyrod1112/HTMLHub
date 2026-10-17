import { useEffect, useState, type DragEvent, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../api'
import { IconFile, IconUpload } from '../components/Icons'
import { formatBytes, LIMITS, validateBundle, validateThumbnail } from '../lib/validation'

export default function Upload() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [bundle, setBundle] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!thumbnail) return setPreview('')
    const url = URL.createObjectURL(thumbnail)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnail])

  const pickBundle = (f: File | null) => {
    setBundle(f)
    setErrors((e) => ({ ...e, bundle: (f && validateBundle(f)) || '' }))
  }
  const pickThumb = (f: File | null) => {
    setThumbnail(f)
    setErrors((e) => ({ ...e, thumbnail: (f && validateThumbnail(f)) || '' }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = '제목을 입력해주세요.'
    const b = validateBundle(bundle)
    if (b) next.bundle = b
    const t = validateThumbnail(thumbnail)
    if (t) next.thumbnail = t
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      const p = await api.createProject({ title: title.trim(), description: description.trim(), bundle: bundle!, thumbnail: thumbnail! })
      navigate(`/p/${p.id}`)
    } catch (err) {
      setErrors({ form: (err as Error).message })
      setSubmitting(false)
    }
  }

  return (
    <div className="page narrow">
      <h1 className="page-title">HTML 등록</h1>
      <p className="muted">등록한 프로젝트는 수정할 수 없어요. 삭제 후 다시 올려야 해요.</p>
      <form className="form" onSubmit={submit} noValidate>
        <label className="field">
          <span>제목 *</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={LIMITS.titleMax} placeholder="예) 네온 스네이크" />
          {errors.title && <em className="form-error">{errors.title}</em>}
        </label>
        <label className="field">
          <span>설명</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={LIMITS.descriptionMax} rows={5} placeholder="조작법, 소개 등을 적어주세요." />
          <small className="muted">{description.length}/{LIMITS.descriptionMax}</small>
        </label>

        <div className="field">
          <span>HTML 파일 또는 zip *</span>
          <DropZone accept=".html,.zip" onFile={pickBundle}>
            {bundle ? (
              <div className="file-chip">
                <IconFile />
                <div>
                  <strong>{bundle.name}</strong>
                  <span className="muted small">{formatBytes(bundle.size)}</span>
                </div>
              </div>
            ) : (
              <>
                <IconUpload width={28} height={28} />
                <strong>파일을 끌어다 놓거나 클릭</strong>
                <span className="muted small">단일 .html 또는 리소스 포함 .zip (루트에 index.html 필수) · 최대 50MB</span>
              </>
            )}
          </DropZone>
          {errors.bundle && <em className="form-error">{errors.bundle}</em>}
        </div>

        <div className="field">
          <span>썸네일 *</span>
          <DropZone accept="image/png,image/jpeg,image/webp,image/gif" onFile={pickThumb} className="thumb-drop">
            {preview ? (
              <img src={preview} alt="썸네일 미리보기" className="thumb-preview" />
            ) : (
              <>
                <IconUpload width={28} height={28} />
                <strong>썸네일 이미지 (16:9 권장)</strong>
                <span className="muted small">PNG, JPG, WEBP, GIF · 최대 5MB</span>
              </>
            )}
          </DropZone>
          {errors.thumbnail && <em className="form-error">{errors.thumbnail}</em>}
        </div>

        {errors.form && <p className="form-error">{errors.form}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>취소</button>
          <button className="btn btn-primary" disabled={submitting}>{submitting ? '업로드 중...' : '등록하기'}</button>
        </div>
      </form>
    </div>
  )
}

function DropZone({ accept, onFile, children, className = '' }: { accept: string; onFile: (f: File | null) => void; children: ReactNode; className?: string }) {
  const [over, setOver] = useState(false)
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    onFile(e.dataTransfer.files[0] ?? null)
  }
  return (
    <label
      className={`dropzone ${over ? 'over' : ''} ${className}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <input type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {children}
    </label>
  )
}
