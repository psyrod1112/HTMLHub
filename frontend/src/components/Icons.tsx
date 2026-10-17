import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const }

export const IconHome = (p: P) => <svg {...base} {...p}><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" /></svg>
export const IconSubs = (p: P) => <svg {...base} {...p}><path d="M4 5h16v11H4zM8 20h8M10 8l5 2.5-5 2.5z" /></svg>
export const IconUser = (p: P) => <svg {...base} {...p}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2l3-3h10l3 3v2" /></svg>
export const IconUpload = (p: P) => <svg {...base} {...p}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
export const IconMenu = (p: P) => <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
export const IconSun = (p: P) => <svg {...base} {...p}><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
export const IconMoon = (p: P) => <svg {...base} {...p}><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></svg>
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 21 3.5 12.5A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6.5z" /></svg>
export const IconCheck = (p: P) => <svg {...base} strokeWidth={3} {...p}><path d="M5 12l5 5 9-10" /></svg>
export const IconTrash = (p: P) => <svg {...base} {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
export const IconExpand = (p: P) => <svg {...base} {...p}><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" /></svg>
export const IconReload = (p: P) => <svg {...base} {...p}><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>
export const IconFile = (p: P) => <svg {...base} {...p}><path d="M6 2h9l5 5v15H6zM14 2v6h6" /></svg>
export const IconLogout = (p: P) => <svg {...base} {...p}><path d="M15 4h5v16h-5M10 8l-4 4 4 4M6 12h11" /></svg>
