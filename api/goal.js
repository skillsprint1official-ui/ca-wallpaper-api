// Vercel Edge Function — returns PNG wallpaper image
// No external dependencies needed

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  const goal_date  = searchParams.get('goal_date')  || '2026-05-14';
  const start_date = searchParams.get('start_date') || '2025-03-11';
  const goal       = searchParams.get('goal')       || 'CA Foundation';

  const START = new Date(start_date); START.setUTCHours(0,0,0,0);
  const EXAM  = new Date(goal_date);  EXAM.setUTCHours(0,0,0,0);
  const TODAY = new Date();           TODAY.setUTCHours(0,0,0,0);

  const MS       = 86400000;
  const daysLeft = Math.max(0, Math.round((EXAM - TODAY) / MS));
  const total    = Math.round((EXAM - START) / MS);
  const gone     = Math.min(total, Math.max(0, Math.round((TODAY - START) / MS)));
  const pct      = total > 0 ? Math.round((gone / total) * 100) : 0;

  const DNAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const MNAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dateStr = `${DNAMES[TODAY.getUTCDay()]}, ${String(TODAY.getUTCDate()).padStart(2,'0')} ${MNAMES[TODAY.getUTCMonth()]}`;
  const examStr = `TARGET · ${MNAMES[EXAM.getUTCMonth()]} ${String(EXAM.getUTCDate()).padStart(2,'0')}, ${EXAM.getUTCFullYear()}`;

  function getStatus(d) {
    if(d<=0)  return 'EXAM DAY. JAI HO!';
    if(d<=3)  return 'LAST FEW DAYS. ALL IN.';
    if(d<=7)  return 'FINAL WEEK. LOCK IN.';
    if(d<=14) return 'TWO WEEKS. NO BREAKS.';
    if(d<=30) return 'LAST MONTH. GRIND.';
    if(d<=60) return 'GRIND SEASON.';
    if(d<=90) return 'BUILD THE HABIT NOW.';
    return 'EARLY START = BIG LEAD.';
  }

  const numColor = daysLeft<=7 ? '#e05555' : daysLeft<=30 ? '#e0a030' : '#c8a96e';

  // Build SVG circles
  const COLS = 16;
  const dotR = 18, dotG = 12;
  const gridW = COLS * (dotR*2 + dotG) - dotG;
  const startX = (1080 - gridW) / 2 + dotR;
  let cx = startX, cy = 1380;
  let circlesSVG = '';

  for(let i = 0; i < total; i++) {
    if(i > 0 && i % COLS === 0) { cy += dotR*2 + dotG; cx = startX; }
    const col   = i < gone ? '#c8a96e' : i === gone ? '#fff' : '#1a1a1a';
    const glow  = i === gone ? ` filter="url(#gw)"` : '';
    circlesSVG += `<circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="${dotR}" fill="${col}"${glow}/>`;
    cx += dotR*2 + dotG;
  }

  const lastCY   = cy;
  const barY     = lastCY + 60;
  const barW     = 560;
  const barX     = (1080 - barW) / 2;
  const fillW    = Math.round(barW * pct / 100);

  // Number font size — shrink if 3 digits
  const numFS = daysLeft >= 100 ? 520 : 620;

  const svg = `<svg width="1080" height="2340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="gw" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ng" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- BG -->
  <rect width="1080" height="2340" fill="#000"/>

  <!-- DATE -->
  <text x="540" y="200" text-anchor="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-size="56" font-weight="900" fill="#1e1e1e" letter-spacing="12">${dateStr}</text>

  <!-- GOAL -->
  <text x="540" y="280" text-anchor="middle"
    font-family="Arial, sans-serif"
    font-size="36" fill="#141414" letter-spacing="8">${goal.toUpperCase()}</text>

  <!-- LABEL -->
  <text x="540" y="560" text-anchor="middle"
    font-family="Courier New, monospace"
    font-size="32" fill="#1a1a1a" letter-spacing="10">DAYS REMAINING</text>

  <!-- BIG NUMBER -->
  <text x="540" y="1080" text-anchor="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-size="${numFS}" font-weight="900"
    fill="${numColor}" letter-spacing="-8"
    filter="url(#ng)">${daysLeft}</text>

  <!-- STATUS -->
  <text x="540" y="1175" text-anchor="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-size="44" font-weight="900" fill="#1e1e1e" letter-spacing="6">${getStatus(daysLeft)}</text>

  <!-- DIVIDER -->
  <line x1="200" y1="1240" x2="880" y2="1240" stroke="#0d0d0d" stroke-width="1"/>

  <!-- CIRCLES -->
  ${circlesSVG}

  <!-- PROGRESS BG -->
  <rect x="${barX}" y="${barY}" width="${barW}" height="4" rx="2" fill="#111"/>
  <!-- PROGRESS FILL -->
  <rect x="${barX}" y="${barY}" width="${fillW}" height="4" rx="2" fill="#c8a96e"/>

  <!-- PCT -->
  <text x="540" y="${barY + 46}" text-anchor="middle"
    font-family="Courier New, monospace"
    font-size="26" fill="#1a1a1a" letter-spacing="4">${pct}% PREP DONE</text>

  <!-- EXAM TAG -->
  <text x="540" y="2260" text-anchor="middle"
    font-family="Courier New, monospace"
    font-size="28" fill="#111" letter-spacing="5">${examStr}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type':        'image/svg+xml',
      'Cache-Control':       'no-cache, no-store, must-revalidate',
      'Content-Disposition': 'inline; filename="ca-wallpaper.svg"',
    }
  });
}
