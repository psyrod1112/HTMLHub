import { useRef, useState } from 'react'
import { IconExpand, IconReload } from './Icons'

// 유저 HTML은 메인과 다른 도메인(게임 전용 도메인)에서 서빙되고 sandbox iframe으로만 실행된다. (설계 7번)
// - allow-top-navigation 없음: 게임이 메인 페이지를 다른 곳으로 이동시키지 못함
// - allow-same-origin: 게임 자체 도메인 기준이라 localStorage 세이브 가능, 메인 쿠키엔 접근 불가
const SANDBOX = 'allow-scripts allow-same-origin allow-pointer-lock'

export default function GamePlayer({ src, title }: { src: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [nonce, setNonce] = useState(0)

  return (
    <div className="player" ref={wrapRef}>
      <iframe
        key={nonce}
        src={src}
        title={title}
        sandbox={SANDBOX}
        allow="fullscreen; autoplay; gamepad"
        referrerPolicy="no-referrer"
        loading="eager"
      />
      <div className="player-bar">
        <button className="icon-btn" onClick={() => setNonce((n) => n + 1)} aria-label="다시 시작" title="다시 시작">
          <IconReload width={18} />
        </button>
        <button className="icon-btn" onClick={() => wrapRef.current?.requestFullscreen()} aria-label="전체 화면" title="전체 화면">
          <IconExpand width={18} />
        </button>
      </div>
    </div>
  )
}
