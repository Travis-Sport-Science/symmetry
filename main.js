
function styleVal(data, id, fallback) {
  try {
    const v = data && data.style && data.style[id];
    if (v == null || v.value == null) return fallback;
    return v.value;
  } catch (e) { return fallback; }
}

function valueToAngle(val, minV, maxV) {
  const clamped = Math.max(minV, Math.min(maxV, val));
  const t = (clamped - minV) / (maxV - minV);
  return 180 - (180 * t);
}

function draw(data) {
  const root = document.getElementById('root');
  root.innerHTML = '';

  let val = 0;
  try {
    const rows = data.tables.DEFAULT || [];
    if (rows.length && rows[0].metrics && rows[0].metrics[0] != null) {
      val = parseFloat(rows[0].metrics[0]);
    }
  } catch (e) {}

  const leftLabel = styleVal(data, 'leftLabel', 'Left');
  const rightLabel = styleVal(data, 'rightLabel', 'Right');
  const fontFamily = styleVal(data, 'fontFamily', 'Inter, Roboto, Arial, sans-serif');
  const needleColor = styleVal(data, 'needleColor', '#1f77b4');
  const gaugeColor = styleVal(data, 'gaugeColor', '#333');
  const tickColor = styleVal(data, 'tickColor', '#333');
  const bandColor = styleVal(data, 'bandColor', '#ddd');
  const minVal = parseFloat(styleVal(data, 'minVal', -100));
  const maxVal = parseFloat(styleVal(data, 'maxVal', 100));
  const tickStep = parseFloat(styleVal(data, 'tickStep', 20));
  const balanceBand = Math.abs(parseFloat(styleVal(data, 'balanceBand', 5)));

  const w = root.clientWidth || 600;
  const h = root.clientHeight || 400;
  const cx = w/2, cy = h*0.85;
  const rOuter = Math.min(w, h*1.8) * 0.48;
  const rInner = rOuter * 0.82;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.style.fontFamily = fontFamily;
  root.appendChild(svg);

  function arcPath(cx, cy, r, startDeg, endDeg) {
    const rad = Math.PI/180;
    const start = { x: cx + r*Math.cos(startDeg*rad), y: cy + r*Math.sin(startDeg*rad) };
    const end   = { x: cx + r*Math.cos(endDeg*rad),   y: cy + r*Math.sin(endDeg*rad) };
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg > startDeg ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
  }

  const outer = document.createElementNS(svgNS,'path');
  outer.setAttribute('d', arcPath(cx, cy, rOuter, 180, 0));
  outer.setAttribute('fill', 'none');
  outer.setAttribute('stroke', gaugeColor);
  outer.setAttribute('stroke-width', 6);
  svg.appendChild(outer);

  const inner = document.createElementNS(svgNS,'path');
  inner.setAttribute('d', arcPath(cx, cy, rInner, 180, 0));
  inner.setAttribute('fill', 'none');
  inner.setAttribute('stroke', gaugeColor);
  inner.setAttribute('stroke-width', 2);
  svg.appendChild(inner);

  if (balanceBand > 0) {
    const bandMinA = valueToAngle(-balanceBand, minVal, maxVal);
    const bandMaxA = valueToAngle(+balanceBand, minVal, maxVal);
    const band = document.createElementNS(svgNS, 'path');
    const path = [
      arcPath(cx, cy, rOuter*0.99, bandMinA, bandMaxA),
      arcPath(cx, cy, rInner*1.01, bandMaxA, bandMinA)
    ].join(' ');
    band.setAttribute('d', path);
    band.setAttribute('fill', bandColor);
    band.setAttribute('opacity', 0.35);
    band.setAttribute('stroke', 'none');
    svg.appendChild(band);
  }

  const start = Math.ceil(minVal / tickStep) * tickStep;
  for (let t = start; t <= maxVal; t += tickStep) {
    const ang = valueToAngle(t, minVal, maxVal) * Math.PI/180;
    const x1 = cx + rInner * Math.cos(ang);
    const y1 = cy + rInner * Math.sin(ang);
    const x2 = cx + rOuter * Math.cos(ang);
    const y2 = cy + rOuter * Math.sin(ang);

    const tick = document.createElementNS(svgNS,'line');
    tick.setAttribute('x1', x1);
    tick.setAttribute('y1', y1);
    tick.setAttribute('x2', x2);
    tick.setAttribute('y2', y2);
    tick.setAttribute('stroke', tickColor);
    tick.setAttribute('stroke-width', 2);
    svg.appendChild(tick);

    const lx = cx + (rOuter + 16) * Math.cos(ang);
    const ly = cy + (rOuter + 16) * Math.sin(ang);
    const lbl = document.createElementNS(svgNS,'text');
    lbl.setAttribute('x', lx);
    lbl.setAttribute('y', ly);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('dominant-baseline', 'central');
    lbl.setAttribute('fill', tickColor);
    lbl.style.fontSize = '12px';
    lbl.textContent = String(t);
    svg.appendChild(lbl);
  }

  const leftT = document.createElementNS(svgNS,'text');
  leftT.setAttribute('x', cx - rOuter - 12);
  leftT.setAttribute('y', cy + 8);
  leftT.setAttribute('text-anchor', 'end');
  leftT.setAttribute('fill', tickColor);
  leftT.style.fontSize = '14px';
  leftT.textContent = leftLabel;
  svg.appendChild(leftT);

  const rightT = document.createElementNS(svgNS,'text');
  rightT.setAttribute('x', cx + rOuter + 12);
  rightT.setAttribute('y', cy + 8);
  rightT.setAttribute('text-anchor', 'start');
  rightT.setAttribute('fill', tickColor);
  rightT.style.fontSize = '14px';
  rightT.textContent = rightLabel;
  svg.appendChild(rightT);

  const angV = valueToAngle(val, minVal, maxVal) * Math.PI/180;
  const nx = cx + (rOuter * 0.95) * Math.cos(angV);
  const ny = cy + (rOuter * 0.95) * Math.sin(angV);

  const needle = document.createElementNS(svgNS,'line');
  needle.setAttribute('x1', cx);
  needle.setAttribute('y1', cy);
  needle.setAttribute('x2', nx);
  needle.setAttribute('y2', ny);
  needle.setAttribute('stroke', needleColor);
  needle.setAttribute('stroke-width', 6);
  svg.appendChild(needle);

  const hub = document.createElementNS(svgNS,'circle');
  hub.setAttribute('cx', cx);
  hub.setAttribute('cy', cy);
  hub.setAttribute('r', 8);
  hub.setAttribute('fill', needleColor);
  svg.appendChild(hub);

  const vText = document.createElementNS(svgNS,'text');
  vText.setAttribute('x', cx);
  vText.setAttribute('y', cy - rOuter*0.35);
  vText.setAttribute('text-anchor', 'middle');
  vText.setAttribute('fill', tickColor);
  vText.style.fontSize = '16px';
  vText.textContent = `Imbalance: ${val >= 0 ? '+' : ''}${(val).toFixed(1)}%`;
  svg.appendChild(vText);
}

if (window.dscc) {
  dscc.subscribeToData(draw, {transform: dscc.tableTransform});
} else {
  draw({ tables: { DEFAULT: [{ metrics: [ 3 ] }] }, style: {} });
}
