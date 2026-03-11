import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  
  const goal       = searchParams.get('goal')       || 'CA Foundation';
  const goal_date  = searchParams.get('goal_date')  || '2026-05-14';
  const start_date = searchParams.get('start_date') || '2025-03-11';
  const W          = parseInt(searchParams.get('width')  || '1080');
  const H          = parseInt(searchParams.get('height') || '2340');

  const START = new Date(start_date); START.setUTCHours(0,0,0,0);
  const EXAM  = new Date(goal_date);  EXAM.setUTCHours(0,0,0,0);
  const TODAY = new Date();
  TODAY.setUTCHours(0,0,0,0);

  const MS       = 86400000;
  const daysLeft = Math.max(0, Math.round((EXAM - TODAY) / MS));
  const total    = Math.round((EXAM - START) / MS);
  const gone     = Math.min(total, Math.max(0, Math.round((TODAY - START) / MS)));
  const pct      = total > 0 ? Math.round((gone / total) * 100) : 0;

  const DNAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const MNAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dateStr = `${DNAMES[TODAY.getUTCDay()]}, ${String(TODAY.getUTCDate()).padStart(2,'0')} ${MNAMES[TODAY.getUTCMonth()]}`;
  const examStr = `${MNAMES[EXAM.getUTCMonth()]} ${String(EXAM.getUTCDate()).padStart(2,'0')}, ${EXAM.getUTCFullYear()}`;

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

  // Build circle rows — 18 per row
  const COLS = 18;
  const dotSize = 24;
  const dotGap  = 8;
  const rows = [];
  for(let i = 0; i < total; i += COLS) {
    rows.push(Array.from({length: Math.min(COLS, total-i)}, (_,j) => {
      const idx = i+j;
      return {
        color:   idx < gone ? '#c8a96e' : idx === gone ? '#ffffff' : '#1e1e1e',
        isToday: idx === gone,
      };
    }));
  }

  const scale = W / 1080;

  return new ImageResponse(
    <div style={{
      width: `${W}px`, height: `${H}px`,
      background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: `${120*scale}px ${40*scale}px ${100*scale}px`,
    }}>

      {/* DATE */}
      <div style={{
        fontSize: 58*scale, color: '#222', fontWeight: 900,
        letterSpacing: 14*scale,
      }}>
        {dateStr}
      </div>

      {/* CENTER — big number */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <div style={{
          fontSize: 26*scale, color: '#181818',
          letterSpacing: 12*scale, marginBottom: 20*scale,
        }}>
          DAYS REMAINING
        </div>
        <div style={{
          fontSize: 580*scale, color: numColor,
          fontWeight: 900, lineHeight: 0.85,
          letterSpacing: -8*scale,
        }}>
          {daysLeft}
        </div>
        <div style={{
          fontSize: 42*scale, color: '#1e1e1e',
          fontWeight: 900, letterSpacing: 6*scale,
          marginTop: 20*scale,
        }}>
          {getStatus(daysLeft)}
        </div>
      </div>

      {/* CIRCLES */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: `${dotGap*scale}px`}}>
        <div style={{fontSize: 18*scale, color:'#141414', letterSpacing: 5*scale, marginBottom: 8*scale}}>
          ● GONE  ◉ TODAY  ○ LEFT
        </div>
        {rows.map((row, ri) => (
          <div key={ri} style={{display:'flex', flexDirection:'row', gap:`${dotGap*scale}px`}}>
            {row.map((c, ci) => (
              <div key={ci} style={{
                width:  `${dotSize*scale}px`,
                height: `${dotSize*scale}px`,
                borderRadius: '50%',
                background: c.color,
                boxShadow: c.isToday ? `0 0 ${12*scale}px #fff` : 'none',
              }}/>
            ))}
          </div>
        ))}
      </div>

      {/* PROGRESS + TARGET */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:`${10*scale}px`, width:'100%'}}>
        {/* bar */}
        <div style={{width:`${560*scale}px`, height:`${4*scale}px`, background:'#111', borderRadius:`${2*scale}px`}}>
          <div style={{width:`${pct}%`, height:'100%', background:'#c8a96e', borderRadius:`${2*scale}px`}}/>
        </div>
        <div style={{fontSize: 22*scale, color:'#1a1a1a', letterSpacing: 4*scale}}>
          {pct}% PREP DONE
        </div>
        <div style={{fontSize: 24*scale, color:'#111', letterSpacing: 6*scale, marginTop: 10*scale}}>
          TARGET · {examStr}
        </div>
      </div>

    </div>,
    {
      width: W,
      height: H,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Disposition': 'inline; filename="ca-wallpaper.png"',
      }
    }
  );
}
