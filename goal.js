const { createCanvas } = require('canvas');

module.exports = async (req, res) => {
  try {
    const {
      goal = 'CA Foundation',
      goal_date = '2026-05-14',
      start_date = '2025-03-11',
      width = 1080,
      height = 2340,
    } = req.query;

    const W = parseInt(width);
    const H = parseInt(height);

    const START = new Date(start_date); START.setHours(0,0,0,0);
    const EXAM  = new Date(goal_date);  EXAM.setHours(0,0,0,0);
    const TODAY = new Date();           TODAY.setHours(0,0,0,0);

    const MS       = 86400000;
    const daysLeft = Math.max(0, Math.round((EXAM - TODAY) / MS));
    const total    = Math.round((EXAM - START) / MS);
    const gone     = Math.min(total, Math.max(0, Math.round((TODAY - START) / MS)));
    const pct      = total > 0 ? Math.round((gone / total) * 100) : 0;

    const DNAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const MNAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const dateStr = DNAMES[TODAY.getDay()] + ', ' +
                    String(TODAY.getDate()).padStart(2,'0') + ' ' +
                    MNAMES[TODAY.getMonth()];

    const examStr = MNAMES[EXAM.getMonth()] + ' ' +
                    String(EXAM.getDate()).padStart(2,'0') + ', ' +
                    EXAM.getFullYear();

    function getStatus(d) {
      if(d <= 0)  return 'EXAM DAY. JAI HO!';
      if(d <= 3)  return 'LAST FEW DAYS. ALL IN.';
      if(d <= 7)  return 'FINAL WEEK. LOCK IN.';
      if(d <= 14) return 'TWO WEEKS. NO BREAKS.';
      if(d <= 30) return 'LAST MONTH. GRIND.';
      if(d <= 60) return 'GRIND SEASON.';
      if(d <= 90) return 'BUILD THE HABIT NOW.';
      return 'EARLY START = BIG LEAD.';
    }

    const numColor = daysLeft <= 7 ? '#e05555' : daysLeft <= 30 ? '#e0a030' : '#c8a96e';

    // ── CREATE CANVAS ──
    const canvas = createCanvas(W, H);
    const ctx    = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Subtle noise
    for(let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.012})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    ctx.textAlign = 'center';

    // ── DATE ──
    ctx.font = 'bold 58px sans-serif';
    ctx.fillStyle = '#1e1e1e';
    ctx.fillText(dateStr, W/2, H * 0.09);

    // ── GOAL NAME ──
    ctx.font = 'bold 52px sans-serif';
    ctx.fillStyle = '#c8a96e33';
    ctx.fillText(goal.toUpperCase(), W/2, H * 0.14);

    // ── DAYS REMAINING LABEL ──
    ctx.font = '400 32px sans-serif';
    ctx.fillStyle = '#1c1c1c';
    ctx.fillText('DAYS  REMAINING', W/2, H * 0.25);

    // ── BIG NUMBER ──
    const numSize = W * 0.62;
    ctx.font = `bold ${numSize}px sans-serif`;
    ctx.fillStyle = numColor;
    ctx.shadowColor = numColor;
    ctx.shadowBlur = 60;
    ctx.fillText(String(daysLeft), W/2, H * 0.52);
    ctx.shadowBlur = 0;

    // ── STATUS ──
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText(getStatus(daysLeft), W/2, H * 0.55);

    // ── DIVIDER ──
    ctx.strokeStyle = '#0e0e0e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, H * 0.57);
    ctx.lineTo(W * 0.8, H * 0.57);
    ctx.stroke();

    // ── CIRCLES GRID ──
    const cols   = 18;
    const dotR   = Math.floor((W * 0.82) / (cols * 2 + cols - 1) / 2);
    const gapDot = dotR;
    const gridW  = cols * (dotR * 2 + gapDot) - gapDot;
    let   cx     = (W - gridW) / 2 + dotR;
    let   cy     = H * 0.615;

    for(let i = 0; i < total; i++) {
      if(i > 0 && i % cols === 0) {
        cy += dotR * 2 + gapDot;
        cx = (W - gridW) / 2 + dotR;
      }
      if(i < gone) {
        ctx.fillStyle = '#c8a96e';
      } else if(i === gone) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
      } else {
        ctx.fillStyle = '#191919';
      }
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      cx += dotR * 2 + gapDot;
    }

    // ── PROGRESS BAR ──
    const barY = cy + dotR + 60;
    const barW = W * 0.55;
    const barH = 4;
    const barX = (W - barW) / 2;

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 2);
    ctx.fill();

    ctx.fillStyle = '#c8a96e';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * (pct/100), barH, 2);
    ctx.fill();

    ctx.font = '400 26px sans-serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(pct + '% PREP DONE', W/2, barY + 46);

    // ── EXAM TAG ──
    ctx.font = '400 28px sans-serif';
    ctx.fillStyle = '#111';
    ctx.fillText('TARGET · ' + examStr, W/2, H - 90);

    // ── SEND PNG ──
    const buffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Disposition', 'inline; filename="ca-wallpaper.png"');
    res.status(200).send(buffer);

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
