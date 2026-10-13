import React, { useRef, useEffect } from 'react';

export function PopulationChart({ history }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    if (!history || history.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Gathering population trend data...', w / 2, h / 2);
      return;
    }

    const padding = { top: 15, right: 15, bottom: 25, left: 35 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Compute max population for scaling (minimum max of 40)
    let maxPop = 40;
    for (let i = 0; i < history.length; i++) {
      if (history[i].rabbits > maxPop) maxPop = history[i].rabbits;
      if (history[i].foxes > maxPop) maxPop = history[i].foxes;
    }
    maxPop = Math.ceil(maxPop * 1.15); // Add 15% headroom

    // Draw horizontal grid lines
    ctx.strokeStyle = '#26382b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = Math.round((maxPop / gridLines) * i);
      const y = padding.top + chartH - (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(yVal.toString(), padding.left - 6, y + 3);
    }

    // Helper: draw single polyline
    const drawSeries = (getDataVal, color, lineWidth = 2) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      for (let i = 0; i < history.length; i++) {
        const x = padding.left + (i / (history.length - 1)) * chartW;
        const val = getDataVal(history[i]);
        const y = padding.top + chartH - (val / maxPop) * chartH;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    // 1. Draw Grass % (scaled: 100% -> maxPop)
    drawSeries((pt) => (pt.grass / 100) * maxPop, '#38a169', 1.5);

    // 2. Draw Rabbits
    drawSeries((pt) => pt.rabbits, '#e2e8f0', 2.2);

    // 3. Draw Foxes
    drawSeries((pt) => pt.foxes, '#f97316', 2.2);

    // Bottom time axis label
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('Live Timeline (past 60s)', padding.left + chartW / 2, h - 6);
  }, [history]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">📈 Real-Time Population Dynamics</span>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot rabbit-dot"></span> Rabbits</span>
          <span className="legend-item"><span className="legend-dot fox-dot"></span> Foxes</span>
          <span className="legend-item"><span className="legend-dot grass-dot"></span> Grass</span>
        </div>
      </div>
      <div className="chart-canvas-container">
        <canvas ref={canvasRef} className="population-canvas" />
      </div>
    </div>
  );
}
