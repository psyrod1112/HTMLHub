import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-msg">
      <h1 className="big-404">404</h1>
      <p>페이지를 찾을 수 없어요.</p>
      <Link to="/" className="btn btn-primary">홈으로</Link>
    </div>
  )
}
