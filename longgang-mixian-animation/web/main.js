// 主控：依時間軸組合場景、鏡頭、轉場與字幕
let TL = null, CAM = { z: 1, x: 0, y: 0 };
function layer(depth, s) {
  const z = 1 + (CAM.z - 1) * depth;
  return `<g transform="translate(${f1(W / 2 + CAM.x * depth)} ${f1(H / 2 + CAM.y * depth)}) scale(${(z).toFixed(4)}) translate(${-W / 2} ${-H / 2})">${s}</g>`;
}
function sceneLines(sc) {
  return TL.subs.filter(u => u.key.startsWith(sc.id + '_')).map(u => ({ s: u.start - sc.start, e: u.end - sc.start }));
}
function camAt(def, lt, dur, L) {
  if (def.camFn) return def.camFn(lt, dur, L);
  const c = def.cam, u = Math.sin(clamp(lt / dur) * Math.PI / 2 - Math.PI / 2) + 1; // 緩起
  const e = lerp(clamp(lt / dur), u, .5);
  return { z: lerp(c.z0, c.z1, e), x: lerp(c.x0, c.x1, e), y: lerp(c.y0, c.y1, e) };
}
window.setTimeline = tl => { TL = tl; };
window.renderFrame = fi => {
  const t = fi / TL.fps;
  G.t = t; G.f = fi; G.boil = Math.floor(fi / 4);
  const act = TL.scenes.filter(s => t >= s.start && t < s.start + s.dur);
  let out = '', bg0 = null;
  act.forEach((sc, idx) => {
    const def = SC[sc.id]; P = PAL[def.mode]; SID = 0;
    const lt = t - sc.start; G.lt = lt;
    const L = sceneLines(sc);
    CAM = camAt(def, lt, sc.dur, L);
    const first = sc === TL.scenes[0];
    const a = first ? 1 : ease(clamp(lt / TL.xf));
    if (bg0 === null) bg0 = P.bg;
    const body = def.draw(lt, sc.dur, L);
    out += `<g${a < 1 ? ` opacity="${a.toFixed(3)}"` : ''}><rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="${P.bg}"/>${body}</g>`;
  });
  document.getElementById('stage').style.background = bg0 || PAL.day.bg;
  document.getElementById('root').innerHTML = out;
  // 字幕
  const sb = document.getElementById('sub');
  const cur = TL.subs.find(u => t >= u.start - .15 && t <= u.end + .4);
  if (cur) {
    const a = Math.min(clamp((t - cur.start + .15) / .2), clamp((cur.end + .4 - t) / .2));
    sb.querySelector('.zh').textContent = cur.zh; sb.querySelector('.en').textContent = cur.en;
    sb.style.opacity = a.toFixed(3);
  } else sb.style.opacity = 0;
  return document.getElementById('root').childElementCount;
};
window.getCues = () => {
  const out = [];
  TL.scenes.forEach(sc => {
    const def = SC[sc.id]; P = PAL[def.mode];
    (def.cues ? def.cues(sc.dur, sceneLines(sc)) : []).forEach(c => out.push({ t: sc.start + c[0], type: c[1], gain: c[2] ?? 1, pan: c[3] ?? 0, dur: c[4] ?? 0, scene: sc.id }));
  });
  return out;
};
