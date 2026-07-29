const necklineArt: Record<string, React.ReactNode> = {
  round: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M16 28v4c0 4 2 10 10 14h20c8-4 10-10 10-14v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  "v-neck": (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M24 38 36 22l12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  boat: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M20 34h32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  sweetheart: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M30 34c0-6-2-12-6-12s-4 6-4 8 2 8 6 10 10-4 16-4 12 2 16 4 6-8 6-10-2-8-4-8-6 6-6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  mandarin: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M24 22v10h24V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  keyhole: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M31 30v8a5 5 0 1 0 10 0v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  halter: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M36 44V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 28 30 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 28 42 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <rect x="26" y="24" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  "off-shoulder": (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M16 24h40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 24c0-4 4-8 8-8h24c4 0 8 4 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "one-shoulder": (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M42 24h14l-56 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 28v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "queen-anne": (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M30 40v-8c0-4-2-10-6-10s-4 6-4 8 2 6 6 8 8-4 16-4c0 0 12 2 16 4 4 2 6-6 6-8s-2-8-4-8-6 6-6 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
};

const sleeveArt: Record<string, React.ReactNode> = {
  sleeveless: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M22 28a2 2 0 0 1 2-2h8l6 14 6-14h8a2 2 0 0 1 2 2v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 28v-6a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  cap: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M52 18c-2 6-2 16-2 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 18c2 6 2 16 2 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  short: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M54 18v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 34h-4m4 0h4m38 0h-4m4 0h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  elbow: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18v30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M54 18v30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 48h4m56 0h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  "three-quarter": (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18v38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M54 18v38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 56h4m56 0h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  full: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18v54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M54 18v54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 72h4m56 0h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18v44c0 4 6 8 10 8m26-52v44c0 4-6 8-10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  bishop: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18v30c0 8 6 12 10 12v10m26-52v30c0 8-6 12-10 12v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 68a4 4 0 0 0 4-4m10 4a4 4 0 0 1-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  puffed: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M20 18a8 10 0 0 1 8 10v4m16-14a8 10 0 0 0-8 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 36v16m16-16v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 52h4m16 0h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  "cold-shoulder": (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 24v4m36-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 32v26m36-26v26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 58h4m56 0h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
  ruffled: (
    <svg viewBox="0 0 72 72" fill="none" className="h-full w-full">
      <path d="M18 18q0 2-1 4t-1 4q0 2 1 4t1 4q0 2 1 4t1 4q0 2-1 4t-1 4m36-32q0 2 1 4t1 4q0 2-1 4t-1 4q0 2-1 4t-1 4q0 2 1 4t1 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18a14 14 0 1 1 28 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
};

export function getNecklineArt(id: string): React.ReactNode {
  return necklineArt[id] ?? null;
}

export function getSleeveArt(id: string): React.ReactNode {
  return sleeveArt[id] ?? null;
}
