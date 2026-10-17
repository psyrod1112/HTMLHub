## 아이디어
1. 뭘 만들건지?
HTML 기반 앱/게임 등록 웹 (HTML Hub)

## 기획
1. 얼마나 많은 사람들이 쓸건지
동접자 수 약 100명
2. 주요 타겟층은 누구인지
10대 20대 남자
3. 어떤 기능까지만 넣을지(MVP)
- 무료 HTML5 게임/앱 등록 (단일 HTML 또는 리소스 포함 zip 업로드), 썸네일 사진 등록
- 게임화면 옆에 유튜브처럼 추천 게임 목록 (MVP는 최신순/인기순)
- 게임화면 아래 댓글, 좋아요, 구독 (걍 유튜브랑 똑같은데 영상 화면 자리에 HTML 게임 넣는다 생각하면 됨)
- 마이페이지: 좋아요 목록, 구독 목록, 내 게임 리스트, 내 프로젝트 삭제
- 로그인 / 회원가입 / 비밀번호 찾기(이메일) / 회원탈퇴
4. 추후에 어떤 기능을 넣고싶은지(ver2)
유료 게임 등록 가능(결제 서비스 까지), 카테고리별 분류(태그 형식 - 나의 조회 및 단기간 조회폭등 그 조회한 게임의 태그관련으로 유사도 측정 후 알고리즘 추천), 메인화면에 유튜브처럼 알고리즘으로 추천 형식, 프로필 수정기능, 프로필사진 이미지 등록 가능, 대댓글, 댓글 좋아요, 프로젝트 새 버전 업로드, 신고 기능 + 관리자 신고 처리 페이지(설계 8번 참고)
5. 이 앱의 핵심 기능은 무엇인지
HTML 기반 게임의 알고리즘화 - 수익은 광고형
6. 기존 앱에 비슷한건 뭐가 있는지
스팀, 쥬니버네이버, itch.io 등
7. 이 앱의 차별점은 무엇인지
기존 쥬니버네이버와 달리, 깔끔한 UI와 어린이 겨냥 X 어른들이 즐기기 좋은 게임도 등록 가능
게임 뿐만 아니라 어떠한 다른 기능을 하는 HTML도 가능
그리고 스팀과 달리, 다운로드 부담 절감
유튜브 친화적 UI로 거부감 절감

## 설계
1. 화면 스타일은 어떻게 할지(테마)
HTML의 상징 색인 하얀색(다크모드 가능) 배경에 주황색 UI들. 기존 유튜브의 둥글둥글한 느낌보다는 각진 느낌 선호, HTML Hub를 상징하는 멋진 아이콘(./HTMLHub_logo.png)

2. 사용자 시나리오
- 회원가입(닉네임, 이메일, 비번, 비번확인) -> 로그인(이메일, 비번) -> 메인화면
- 메인화면에 사람들이 올려둔 HTML 앱들이 있음. 하나 누르면 조회수 증가(아래 조회수 규칙), 그 화면에서 앱을 바로 즐길 수 있음
- 좋아요 누르면 즉시반영(한 사람당 1번, 다시 누르면 취소), 댓글 쓰면 즉시반영
- 구독하면 왼쪽 사이드바에 구독한 사람이 뜨고, 새 HTML 올리면 "주황색 체크 표시"로 표시. 그걸로 구독한 사람의 새 HTML을 볼 수 있음
- HTML 등록 버튼 -> 제목 + 설명 + 썸네일 + (HTML 파일 or zip) 업로드 -> 검증 후 등록 -> 메인화면에서 내 것 확인
- 프로젝트 수정 불가, 삭제만 가능 (삭제 시 댓글/좋아요/R2 파일 같이 삭제)
- 회원탈퇴 -> 연계된 모든 데이터(프로젝트, 댓글, 좋아요, 구독, R2 파일) 자동 삭제
- 비밀번호 찾기 -> 이메일 입력 -> Resend로 재설정 링크 발송(30분 유효, 1회용) -> 새 비번 설정
- 댓글 대댓글 불가, 댓글 좋아요 불가, 신고 불가 (전부 Ver2)

3. 데이터 테이블 (Neon / PostgreSQL)
- users: id, nickname(유니크), email(유니크), password_hash, role(user/admin), status(active/suspended), created_at
  - 구독자 수, 프로젝트 수는 컬럼으로 저장 안 함 -> COUNT로 계산 (필요하면 Upstash에 캐싱). 숫자 어긋날 일 없음
- subscriptions: subscriber_id(구독한 사람), target_id(구독 당한 사람), created_at
  - PK(subscriber_id, target_id), 자기 자신 구독 불가
- projects: id, owner_id, title, description, thumbnail_key(R2 경로), bundle_prefix(R2 폴더 경로), entry_file(기본 index.html), size_bytes, view_count(디폴트 0), status(active/hidden), created_at
  - 좋아요 수, 댓글 수는 COUNT로 계산 (likes, comments 테이블 기준)
- likes: user_id, project_id, created_at
  - PK(user_id, project_id) -> 중복 좋아요 원천 차단
- comments: id, project_id, user_id, content, status(active/hidden), created_at
- 비밀번호 재설정 토큰, 조회수 기록, 로그인 시도 횟수 -> DB 말고 Upstash(TTL 자동 만료)에 저장

4. 데이터 관계
- user 1:N project, user 1:N comment
- user N:M user (subscriptions)
- user N:M project (likes)
- project 1:N comment
- 모든 FK는 ON DELETE CASCADE -> 회원탈퇴/프로젝트 삭제 시 자동 정리 (R2 파일은 서버에서 별도 삭제)

5. API 설계
- Auth
  - POST /auth/signup -> DB저장 -> 로그인 화면
  - POST /auth/login -> 로그인 검사 -> 토큰을 httpOnly 쿠키로 줌 -> 메인화면
  - POST /auth/logout
  - POST /auth/password/forgot -> Resend로 메일 발송
  - POST /auth/password/reset
  - DELETE /users/me (회원탈퇴)
- 유저 / 구독
  - GET /users/me, GET /users/{id}, GET /users/{id}/projects
  - GET /users/me/likes, GET /users/me/subscriptions
  - POST /users/{id}/subscribe, DELETE /users/{id}/subscribe
  - GET /feed/subscriptions (구독한 사람들의 새 프로젝트)
- 프로젝트
  - GET /projects (메인 목록, 페이지네이션)
  - GET /projects/{id}
  - GET /projects/{id}/recommendations
  - POST /projects (multipart: 제목, 설명, 썸네일, HTML or zip) -> 본인 검사 + 파일 검증 -> R2 업로드 -> DB저장
  - DELETE /projects/{id} (본인 or 관리자만)
  - POST /projects/{id}/view (조회수 규칙 적용)
- 좋아요 / 댓글
  - POST /projects/{id}/like, DELETE /projects/{id}/like
  - GET /projects/{id}/comments, POST /projects/{id}/comments
  - DELETE /comments/{id} (본인 or 관리자만)
- 공통: Upstash로 rate limit (로그인 5회/분, 업로드 10회/시간, 댓글 10회/분 등)

6. 조회수 규칙 (2배수 법칙)
- 같은 사람이 같은 프로젝트를 볼 때, 직전 카운팅 이후 2분 -> 4분 -> 8분 -> 16분 -> 32분이 지나야 다음 카운팅
- 첫 조회는 바로 카운팅, 32분 이후로는 계속 32분 간격
- 24시간 동안 안 보면 단계 초기화
- Upstash 키: view:{project_id}:{viewer} = {step, last_counted_at}, TTL 24시간
- viewer = 로그인 유저면 user_id, 비로그인이면 IP+UserAgent 해시

7. XSS 방어 설계 (itch.io 방식)
- 게임 격리: 유저가 올린 HTML은 메인 도메인과 완전히 다른 도메인에서 서빙
  - 메인: htmlhub.com (예시) / 게임: htmlhub-play.com (예시, 서브도메인 X - 아예 다른 도메인이어야 쿠키 공유 안 됨)
  - 게임 경로: htmlhub-play.com/p/{project_id}/index.html (R2 커스텀 도메인)
  - 메인 페이지에서 <iframe sandbox="allow-scripts allow-same-origin allow-pointer-lock" allow="fullscreen; autoplay">로 띄움
  - allow-top-navigation 안 줌 -> 게임이 메인 페이지를 다른 사이트로 못 넘김
  - 게임 도메인 응답에 CSP frame-ancestors htmlhub.com -> 다른 사이트에서 우리 게임 퍼가기 차단
- 메인 사이트 방어
  - 로그인 토큰은 httpOnly + Secure + SameSite=Lax 쿠키 -> JS로 못 훔침
  - 제목/설명/댓글/닉네임은 전부 이스케이프 출력 (innerHTML, dangerouslySetInnerHTML 금지)
  - 메인 도메인 CSP: script-src 'self', frame-src htmlhub-play.com
- 업로드 검증
  - 용량 제한: zip 50MB, 압축 해제 후 200MB, 파일 1000개 이하 (zip 폭탄 방지)
  - 경로 검사: ../ 나 절대경로 들어간 파일 거부 (path traversal 방지)
  - 확장자 화이트리스트: html, css, js, json, png, jpg, gif, webp, svg, mp3, ogg, wav, woff2, wasm 등
  - 루트에 index.html 필수
  - R2 업로드 시 확장자 기준으로 Content-Type 직접 지정
  - 썸네일은 이미지 형식 검사 + 리사이즈

8. 신고 처리 (Ver2 - 실제 서비스 방식 참고)
- 테이블 reports: id, reporter_id, target_type(project/comment/user), target_id, reason, detail, status(pending/resolved/dismissed), action(none/hide/delete/warn/suspend), handled_by, handled_at, created_at
  - UNIQUE(reporter_id, target_type, target_id)
- API: POST /reports, GET /admin/reports, PATCH /admin/reports/{id} (관리자만)
- 신고 사유 선택형: 스팸/광고, 선정적, 폭력/혐오, 악성코드/피싱, 저작권 침해, 기타(직접 입력)
- 같은 사람이 같은 대상 중복 신고 불가
- 자동 임시조치: 서로 다른 유저 신고가 N건(예: 5건) 쌓이면 자동 숨김(hidden) -> 관리자 확인 대기
  - 악성코드/피싱 사유는 1~2건만으로도 우선 숨김 (피해가 크니까)
- 관리자 큐: 신고 수 많은 순 / 사유 심각도 순으로 정렬해서 처리
- 처리 결과: 기각(dismiss) / 숨김 / 삭제 / 경고 / 계정 정지
- 누적 제재: 경고 3회 -> 정지 같은 단계 규칙
- 허위 신고 반복하는 유저는 신고 기능 제한
- 신고자/피신고자에게 처리 결과 알림, 이의제기

## 개발
- 과제형 코드 -> AI외주 이외에는 사전에 개념+예시코드를 AI가 주면, 내가 직접 과제형으로 구현
- 각 과제는 큰 단위로 개발(총 과제가 10개가 넘으면 안됨, 규모가 클 수록 과제 단위가 커지는 구조)
- 과제별로 커밋 + pr + merge
1. 웹/ 앱 화면 개발(AI외주)
2. 백엔드(API, DB, CRUD) 기초 + Auth 개발(로그인, 회원가입, 비밀번호 찾기 등)
3. 업로드 파이프라인 (zip 검증, R2 업로드, 게임 도메인 + iframe 샌드박스)
4. 프론트엔드 + 백엔드 연동 개발
5. 조회수 규칙 + rate limit

## 테스트
- 실제로 서버가 많이 죽고, 서버가 털리고, 의도와 다르게 동작하는 등의 문제를 낱낱히 발견(모든 공격은 AI)
- 과제형 코드 -> 문제점들을 방어하는 코드를 AI가 주면, 내가 직접 과제형으로 구현
1. 보안 취약점 공격 (XSS, 샌드박스 탈출, zip 폭탄, path traversal 포함)
2. 모든 네트워킹 병목점 테스트
3. (트래픽 등)부하 테스트
4. 데이터, 메모리, 디스크 부하 테스트
5. 에러 테스트

## 배포 및 출시
1. 배포 규모설정(배포타입, 서버위치, DB 등)
- DB: Neon (PostgreSQL)
- 캐싱 / rate limit / 조회수 기록: Upstash (Redis)
- 도메인 + 서버 노출: Cloudflare Tunnel (메인 도메인)
- 파일 저장: Cloudflare R2 (게임 번들, 썸네일) + 게임 전용 도메인 연결
- 이메일: Resend (비밀번호 찾기, 추후 알림)
2. 자동화 배포 설정 유무
3. 공개 출시 설정(App Store, 도메인 등록 등)
- 도메인 2개 필요 (메인용, 게임 서빙용)
4. 각종 버그/장애 대응 유지보수
