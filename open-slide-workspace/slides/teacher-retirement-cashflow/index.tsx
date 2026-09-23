import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 教師退休現金流工作坊｜3 小時講座（國高中輔導／綜合領域教師）
// 視覺：財經週刊 — 米紙底、墨綠、黃銅金、重點紅；帳本細線與襯線數字
// ─────────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#F2ECE1', text: '#1E2420', accent: '#0F3B30' },
  fonts: {
    display: '"Noto Serif TC", "Songti TC", serif',
    body: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
  },
  typeScale: { hero: 150, body: 34 },
  radius: 6,
};

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600;900&display=swap';
const FONT_LINK_ID = 'osd-webfont-teacher-retirement-cashflow';
if (typeof document !== 'undefined' && !document.getElementById(FONT_LINK_ID)) {
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONT_HREF;
  document.head.appendChild(link);
}

// 延伸色（不在 DesignSystem 內）
const paper2 = '#E8DFCF';
const green2 = '#174A3D';
const gold = '#B0833A';
const goldSoft = '#D8C197';
const red = '#B4432E';
const muted = '#6B685C';
const rule = '#CDBFA6';
const cream = '#F2ECE1';

const NUM = '"DM Serif Display", "Noto Serif TC", serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

// ─── 共用骨架 ────────────────────────────────────────────────

const PageNo = ({ dark }: { dark?: boolean }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <span style={{ fontFamily: NUM, fontSize: 26, color: dark ? goldSoft : muted }}>
      {String(current).padStart(2, '0')}
      <span style={{ opacity: 0.5 }}> / {String(total).padStart(2, '0')}</span>
    </span>
  );
};

const Sheet = ({
  section,
  dark,
  children,
}: {
  section?: string;
  dark?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: dark ? 'var(--osd-accent)' : 'var(--osd-bg)',
      color: dark ? cream : 'var(--osd-text)',
      fontFamily: 'var(--osd-font-body)',
    }}
  >
    {/* 頁首：帳本抬頭 */}
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        top: 52,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingBottom: 18,
        borderBottom: `1px solid ${dark ? 'rgba(216,193,151,0.35)' : rule}`,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.18em', color: dark ? goldSoft : gold }}>
        THE TEACHER'S RETIREMENT LEDGER
      </span>
      <span style={{ fontSize: 22, letterSpacing: '0.12em', color: dark ? goldSoft : muted }}>{section}</span>
    </div>
    <div style={{ position: 'absolute', left: 120, right: 120, top: 150, bottom: 120 }}>{children}</div>
    {/* 頁尾 */}
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 44,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      <span style={{ fontSize: 20, letterSpacing: '0.1em', color: dark ? 'rgba(242,236,225,0.55)' : muted }}>
        教師退休現金流工作坊 · 從法規到自己的數字
      </span>
      <PageNo dark={dark} />
    </div>
  </div>
);

const Eyebrow = ({ children, color = gold }: { children: ReactNode; color?: string }) => (
  <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.2em', color, marginBottom: 20 }}>{children}</div>
);

const H = ({ children, size = 72, style }: { children: ReactNode; size?: number; style?: CSSProperties }) => (
  <h2
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.2,
      margin: 0,
      letterSpacing: '0.02em',
      ...style,
    }}
  >
    {children}
  </h2>
);

const Lead = ({ children, color = muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <p style={{ fontSize: 34, lineHeight: 1.6, color, margin: '28px 0 0', ...style }}>{children}</p>
);

const Mark = ({ children }: { children: ReactNode }) => <span style={{ color: red, fontWeight: 700 }}>{children}</span>;

// 帳本列：左標籤、右數字
const LedgerRow = ({
  label,
  value,
  note,
  strong,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: '18px 0',
      borderBottom: `1px solid ${rule}`,
      borderTop: strong ? `3px double ${'#1E2420'}` : undefined,
    }}
  >
    <span style={{ fontSize: 32, fontWeight: strong ? 700 : 400 }}>
      {label}
      {note && <span style={{ fontSize: 24, color: muted, marginLeft: 16 }}>{note}</span>}
    </span>
    <span style={{ fontFamily: NUM, fontSize: strong ? 56 : 44, color: strong ? red : 'var(--osd-text)' }}>{value}</span>
  </div>
);

// ─── 01 封面 ─────────────────────────────────────────────────

const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'var(--osd-accent)',
      color: cream,
      fontFamily: 'var(--osd-font-body)',
      position: 'relative',
      display: 'flex',
    }}
  >
    {/* 左：主標 */}
    <div style={{ flex: 1, padding: '140px 0 120px 140px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.24em', color: goldSoft }}>
        TEACHER'S RETIREMENT LEDGER · 3H WORKSHOP
      </div>
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontWeight: 900,
          fontSize: 'var(--osd-size-hero)',
          lineHeight: 1.12,
          margin: '72px 0 0',
          letterSpacing: '0.02em',
        }}
      >
        退休不是
        <br />
        一個<span style={{ color: goldSoft }}>日期</span>，
        <br />
        是一條<span style={{ color: goldSoft }}>現金流</span>
      </h1>
      <div style={{ marginTop: 'auto', fontSize: 32, lineHeight: 1.6, color: 'rgba(242,236,225,0.8)' }}>
        教師退休制度 × 退休金試算 × 退休缺口 × 簡單投資
      </div>
    </div>
    {/* 右：帳本收據 */}
    <div
      style={{
        width: 560,
        margin: '120px 140px 120px 0',
        background: cream,
        color: '#1E2420',
        padding: '56px 52px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.2em', color: gold }}>MY RETIREMENT EQUATION</div>
      <div style={{ borderBottom: `1px solid ${rule}`, padding: '28px 0 18px', fontSize: 30 }}>
        月退休金 <span style={{ float: 'right', fontFamily: NUM, fontSize: 36 }}>B</span>
      </div>
      <div style={{ borderBottom: `1px solid ${rule}`, padding: '28px 0 18px', fontSize: 30 }}>
        ＋ 投資現金流 <span style={{ float: 'right', fontFamily: NUM, fontSize: 36 }}>E</span>
      </div>
      <div style={{ borderBottom: `3px double #1E2420`, padding: '28px 0 18px', fontSize: 30 }}>
        ≥ 退休後月支出 <span style={{ float: 'right', fontFamily: NUM, fontSize: 36 }}>C</span>
      </div>
      <div style={{ marginTop: 36, fontSize: 26, lineHeight: 1.6, color: muted }}>
        今天三小時，
        <br />
        把這張收據上的字母，
        <br />
        換成<span style={{ color: red, fontWeight: 700 }}>你自己的數字</span>。
      </div>
      <div style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 18, color: muted, letterSpacing: '0.1em' }}>
        講者｜引路人 · 高中資源班教師
      </div>
    </div>
  </div>
);

// ─── 02 開場提問 ─────────────────────────────────────────────

const Opening: Page = () => (
  <Sheet section="開場 · 暖身">
    <Eyebrow>QUESTION 00 · 寫在便利貼上，先不要跟隔壁討論</Eyebrow>
    <H size={96} style={{ marginTop: 40 }}>
      退休後，你一個月
      <br />
      需要多少錢才<span style={{ color: red }}>睡得著</span>？
    </H>
    <div style={{ display: 'flex', gap: 40, marginTop: 110 }}>
      <Guess label="憑感覺" value="＿＿＿＿ 元" />
      <Guess label="有根據" value="三小時後再寫一次" />
    </div>
  </Sheet>
);

const Guess = ({ label, value }: { label: string; value: string }) => (
  <div style={{ flex: 1, borderTop: `3px solid var(--osd-accent)`, paddingTop: 28 }}>
    <div style={{ fontSize: 26, color: gold, letterSpacing: '0.15em' }}>{label}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 600, fontSize: 52, marginTop: 16 }}>{value}</div>
  </div>
);

// ─── 03 大數字：焦慮是真的 ───────────────────────────────────

const BigAnxiety: Page = () => (
  <Sheet section="開場 · 為什麼是今天">
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', gap: 100 }}>
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontFamily: NUM, fontSize: 280, lineHeight: 1, color: 'var(--osd-accent)' }}>88,303</div>
        <div style={{ fontSize: 30, color: muted, marginTop: 24, letterSpacing: '0.08em' }}>
          次 ─ 「教師退休金試算」工具上線兩個多月的使用次數
        </div>
      </div>
      <div style={{ flex: 1, borderLeft: `1px solid ${rule}`, paddingLeft: 64 }}>
        <H size={56}>老師們不是不想懂，</H>
        <H size={56} style={{ color: red }}>是沒人陪著算。</H>
        <Lead>
          年改之後，同一張薪水單，
          <br />
          每個人的退休答案都不一樣。
        </Lead>
      </div>
    </div>
  </Sheet>
);

// ─── 04 今日帳本（議程） ─────────────────────────────────────

const AgendaRow = ({
  time,
  code,
  title,
  desc,
  hands,
}: {
  time: string;
  code: string;
  title: string;
  desc: string;
  hands?: string;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '170px 120px 1fr 260px',
      alignItems: 'baseline',
      padding: '22px 0',
      borderBottom: `1px solid ${rule}`,
    }}
  >
    <span style={{ fontFamily: MONO, fontSize: 24, color: muted }}>{time}</span>
    <span style={{ fontFamily: NUM, fontSize: 44, color: gold }}>{code}</span>
    <span>
      <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40 }}>{title}</span>
      <span style={{ fontSize: 26, color: muted, marginLeft: 20 }}>{desc}</span>
    </span>
    <span style={{ fontSize: 24, color: 'var(--osd-accent)', textAlign: 'right', fontWeight: 500 }}>{hands}</span>
  </div>
);

const Agenda: Page = () => (
  <Sheet section="今日帳本 · 180 分鐘">
    <H size={64}>今天的帳，分四本記</H>
    <div style={{ marginTop: 44, borderTop: `3px double #1E2420` }}>
      <AgendaRow time="00–15′" code="00" title="開場" desc="你的第一個直覺數字" />
      <AgendaRow time="15–65′" code="I" title="看懂制度" desc="年改、替代率、新舊制" hands="實作 01 · 02" />
      <AgendaRow time="75–120′" code="II" title="算出需求" desc="退休後到底要花多少" hands="實作 03" />
      <AgendaRow time="120–150′" code="III" title="補上缺口" desc="複利、4% 法則、資產盤點" hands="實作 04 · 05" />
      <AgendaRow time="155–175′" code="IV" title="簡單投資" desc="定期定額、買大盤、複利" hands="實作 06" />
    </div>
    <div style={{ marginTop: 28, fontSize: 24, color: muted }}>中場休息兩次：65′ 與 150′，各 5–10 分鐘｜175′ 起 Q&A 與行動承諾</div>
  </Sheet>
);

// ─── 05 工具鏈 ───────────────────────────────────────────────

const ToolCard = ({ n, name, q, out }: { n: string; name: string; q: string; out: string }) => (
  <div
    style={{
      flex: 1,
      background: '#FBF8F2',
      border: `1px solid ${rule}`,
      borderTop: `6px solid var(--osd-accent)`,
      padding: '30px 26px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 480,
    }}
  >
    <span style={{ fontFamily: NUM, fontSize: 56, color: gold, lineHeight: 1 }}>{n}</span>
    <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 36, marginTop: 20 }}>{name}</span>
    <span style={{ fontSize: 26, lineHeight: 1.5, color: muted, marginTop: 14 }}>{q}</span>
    <span
      style={{
        marginTop: 'auto',
        fontFamily: MONO,
        fontSize: 22,
        color: 'var(--osd-accent)',
        borderTop: `1px dashed ${rule}`,
        paddingTop: 14,
      }}
    >
      → {out}
    </span>
  </div>
);

const Arrow = () => <div style={{ alignSelf: 'center', fontFamily: NUM, fontSize: 40, color: goldSoft }}>›</div>;

const ToolChain: Page = () => (
  <Sheet section="今日工具 · 一條線串起來">
    <H size={64}>五個工具，前一個的答案，是下一個的輸入</H>
    <div style={{ display: 'flex', gap: 14, marginTop: 64 }}>
      <ToolCard n="01" name="薪資試算" q="我現在一個月實際領多少？" out="A 月薪" />
      <Arrow />
      <ToolCard n="02" name="退休金試算" q="制度會給我多少？" out="B 月退" />
      <Arrow />
      <ToolCard n="03" name="每月收支體檢" q="我退休後要花多少？" out="C 月支出" />
      <Arrow />
      <ToolCard n="04" name="理財試算器" q="缺口要準備多少本金？" out="D 缺口 · E 本金" />
      <Arrow />
      <ToolCard n="05" name="資產總覽" q="我離目標還有多遠？" out="F 進度 %" />
    </div>
    <div style={{ marginTop: 40, fontSize: 28, color: muted }}>
      學習單就是一張 <Mark>A → F</Mark> 的帳本：每做完一個工具，就把數字抄進對應的格子。
    </div>
  </Sheet>
);

// ─── 06 使用須知 ─────────────────────────────────────────────

const Ground: Page = () => (
  <Sheet section="開場 · 三個約定">
    <H size={64}>開始算之前，三個約定</H>
    <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 56 }}>
      <Pact n="1" t="數字只寫在自己的學習單" d="不用跟任何人分享薪水、存款。小組討論只談方法，不談金額。" />
      <Pact n="2" t="估算比精算重要" d="先求「差不多對」，比「完全不算」好一百倍。不確定就先填保守值。" />
      <Pact n="3" t="這不是投資建議" d="今天談的是觀念與工具，沒有明牌、沒有商品推銷。決策請自己負責。" />
    </div>
  </Sheet>
);

const Pact = ({ n, t, d }: { n: string; t: string; d: string }) => (
  <div style={{ borderTop: `3px solid var(--osd-accent)`, paddingTop: 30 }}>
    <div style={{ fontFamily: NUM, fontSize: 96, color: gold, lineHeight: 1 }}>{n}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40, marginTop: 24, lineHeight: 1.3 }}>
      {t}
    </div>
    <div style={{ fontSize: 30, lineHeight: 1.65, color: muted, marginTop: 20 }}>{d}</div>
  </div>
);

// ─── 章節頁 ─────────────────────────────────────────────────

const Divider = ({ no, kicker, title, sub }: { no: string; kicker: string; title: ReactNode; sub: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'var(--osd-accent)',
      color: cream,
      fontFamily: 'var(--osd-font-body)',
      position: 'relative',
      padding: '0 140px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <div style={{ fontFamily: NUM, fontSize: 520, lineHeight: 1, color: green2, position: 'absolute', right: 110, bottom: 40 }}>
      {no}
    </div>
    <div style={{ position: 'relative' }}>
      <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.24em', color: goldSoft }}>{kicker}</div>
      <h2
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontWeight: 900,
          fontSize: 120,
          lineHeight: 1.15,
          margin: '40px 0 0',
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 34, color: 'rgba(242,236,225,0.75)', marginTop: 44 }}>{sub}</div>
    </div>
  </div>
);

const SecI: Page = () => (
  <Divider
    no="I"
    kicker="PART ONE · 15′–65′"
    title={
      <>
        你的退休金，
        <br />
        是<span style={{ color: goldSoft }}>怎麼算</span>出來的
      </>
    }
    sub="從法規讀懂：本俸、年資、所得替代率"
  />
);

// ─── 07 三層收入 ─────────────────────────────────────────────

const Layer = ({ tag, name, who, h, bg, fg }: { tag: string; name: string; who: string; h: number; bg: string; fg: string }) => (
  <div style={{ display: 'flex', alignItems: 'stretch', gap: 40 }}>
    <div
      style={{
        width: 620,
        height: h,
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 900,
        fontSize: 44,
      }}
    >
      {name}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <span style={{ fontFamily: MONO, fontSize: 22, color: gold, letterSpacing: '0.15em' }}>{tag}</span>
      <span style={{ fontSize: 30, marginTop: 8 }}>{who}</span>
    </div>
  </div>
);

const ThreeLayers: Page = () => (
  <Sheet section="I · 制度">
    <H size={64}>退休後的錢，來自三層</H>
    <Lead style={{ marginTop: 16 }}>前兩層由制度決定，第三層只有你自己決定。</Lead>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 56 }}>
      <Layer tag="LAYER 3 · 自己" name="個人儲蓄與投資" who="ETF、存款、保險年金 — 今天的重點" h={150} bg={red} fg={cream} />
      <Layer tag="LAYER 2 · 職業" name="退撫（月退／專戶）" who="舊制：確定給付 DB　新制：確定提撥 DC" h={150} bg="var(--osd-accent)" fg={cream} />
      <Layer tag="LAYER 1 · 社會保險" name="公保年金" who="樓地板：與生命等長的保底現金流" h={150} bg={paper2} fg="#1E2420" />
    </div>
  </Sheet>
);

// ─── 08 新舊制 ───────────────────────────────────────────────

const CompareRow = ({ k, a, b }: { k: string; a: string; b: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr', padding: '20px 0', borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontSize: 28, color: gold, fontWeight: 500 }}>{k}</span>
    <span style={{ fontSize: 30, paddingRight: 30 }}>{a}</span>
    <span style={{ fontSize: 30 }}>{b}</span>
  </div>
);

const OldNew: Page = () => (
  <Sheet section="I · 制度">
    <Eyebrow>分水嶺 · 112 年 7 月 1 日</Eyebrow>
    <H size={64}>你是哪一制？答案決定你今天怎麼算</H>
    <div style={{ marginTop: 44 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr 1fr',
          paddingBottom: 16,
          borderBottom: `3px double #1E2420`,
        }}
      >
        <span />
        <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40 }}>舊制 · 確定給付 DB</span>
        <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40, color: red }}>
          新制 · 確定提撥 DC
        </span>
      </div>
      <CompareRow k="適用" a="112/6/30 以前任職" b="112/7/1 以後初任" />
      <CompareRow k="金額怎麼來" a="法定公式，受替代率上限" b="提撥本金 × 投資報酬（複利）" />
      <CompareRow k="錢放在哪" a="共同基金" b="個人專戶，帳戶隨人走" />
      <CompareRow k="最大風險" a="政策再調整" b="投資績效與長壽風險" />
      <CompareRow k="你能做的" a="年資、退休時點、領法" b="自願增提、選投資組合" />
    </div>
  </Sheet>
);

// ─── 09 關鍵公式 ─────────────────────────────────────────────

const Formula: Page = () => (
  <Sheet section="I · 制度 · 舊制">
    <Eyebrow>一條公式，看懂月退天花板</Eyebrow>
    <div
      style={{
        marginTop: 40,
        padding: '56px 64px',
        background: '#FBF8F2',
        border: `1px solid ${rule}`,
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 900,
        fontSize: 60,
      }}
    >
      <span>月退上限</span>
      <span style={{ color: gold }}>＝</span>
      <span style={{ borderBottom: `4px solid var(--osd-accent)` }}>本俸 × 2</span>
      <span style={{ color: gold }}>×</span>
      <span style={{ borderBottom: `4px solid ${red}`, color: red }}>所得替代率</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 64 }}>
      <div>
        <div style={{ fontSize: 34, fontWeight: 700 }}>本俸 × 2（本俸加一倍）</div>
        <div style={{ fontSize: 28, lineHeight: 1.65, color: muted, marginTop: 12 }}>
          以薪點查表得到本俸。注意：分母<strong>不是</strong>實領月薪——本俸×2 通常<strong>比實領還高</strong>。
        </div>
      </div>
      <div>
        <div style={{ fontSize: 34, fontWeight: 700, color: red }}>所得替代率</div>
        <div style={{ fontSize: 28, lineHeight: 1.65, color: muted, marginTop: 12 }}>
          依「退休年度 × 任職年資」查表。年改後每年調降 1.5%，至 118 年度後定錨。
        </div>
      </div>
    </div>
  </Sheet>
);

// ─── 10 替代率表 ─────────────────────────────────────────────

const Cell = ({ v, hot }: { v: string; hot?: boolean }) => (
  <span
    style={{
      fontFamily: NUM,
      fontSize: 40,
      textAlign: 'right',
      color: hot ? red : 'var(--osd-text)',
      background: hot ? 'rgba(180,67,46,0.08)' : undefined,
      padding: '0 18px',
    }}
  >
    {v}
  </span>
);

const RateRow = ({ y, c }: { y: string; c: [string, string, string, string, string] }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '260px repeat(5, 1fr)',
      alignItems: 'baseline',
      padding: '16px 0',
      borderBottom: `1px solid ${rule}`,
    }}
  >
    <span style={{ fontSize: 30, fontWeight: 500 }}>{y}</span>
    <Cell v={c[0]} />
    <Cell v={c[1]} />
    <Cell v={c[2]} />
    <Cell v={c[3]} />
    <Cell v={c[4]} hot={y === '118 年度以後'} />
  </div>
);

const RateTable: Page = () => (
  <Sheet section="I · 制度 · 法規">
    <H size={60}>所得替代率上限：年資 × 退休年度</H>
    <div style={{ marginTop: 40 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px repeat(5, 1fr)',
          paddingBottom: 14,
          borderBottom: `3px double #1E2420`,
          fontSize: 26,
          color: gold,
        }}
      >
        <span>退休年度 ＼ 年資</span>
        <span style={{ textAlign: 'right', paddingRight: 18 }}>15 年</span>
        <span style={{ textAlign: 'right', paddingRight: 18 }}>20 年</span>
        <span style={{ textAlign: 'right', paddingRight: 18 }}>25 年</span>
        <span style={{ textAlign: 'right', paddingRight: 18 }}>30 年</span>
        <span style={{ textAlign: 'right', paddingRight: 18 }}>35 年</span>
      </div>
      <RateRow y="107/7 – 108 年" c={['45.0%', '52.5%', '60.0%', '67.5%', '75.0%']} />
      <RateRow y="112 年度" c={['39.0%', '46.5%', '54.0%', '61.5%', '69.0%']} />
      <RateRow y="115 年度" c={['34.5%', '42.0%', '49.5%', '57.0%', '64.5%']} />
      <RateRow y="117 年度" c={['31.5%', '39.0%', '46.5%', '54.0%', '61.5%']} />
      <RateRow y="118 年度以後" c={['30.0%', '37.5%', '45.0%', '52.5%', '60.0%']} />
    </div>
    <div style={{ marginTop: 28, fontSize: 24, color: muted }}>
      資料：公立學校教職員退休資遣撫卹條例附表（節錄）。35 年以上另有級距；實際以銓敘部／教育部公告為準。
    </div>
  </Sheet>
);

// ─── 11 大數字：75 → 60 ─────────────────────────────────────

const Drop: Page = () => (
  <Sheet section="I · 制度 · 法規">
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 60 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: muted }}>年資 35 年 · 107 年退休</div>
        <div style={{ fontFamily: NUM, fontSize: 260, lineHeight: 1, color: muted, marginTop: 12 }}>75%</div>
      </div>
      <div style={{ fontFamily: NUM, fontSize: 120, color: goldSoft }}>→</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: muted }}>年資 35 年 · 118 年後退休</div>
        <div style={{ fontFamily: NUM, fontSize: 260, lineHeight: 1, color: red, marginTop: 12 }}>60%</div>
      </div>
      <div style={{ flex: 1, borderLeft: `1px solid ${rule}`, paddingLeft: 56 }}>
        <H size={52}>
          同樣教 35 年，
          <br />
          天花板低了
          <br />
          <span style={{ color: red }}>15 個百分點</span>。
        </H>
        <Lead>這 15%，就是第三層要自己補的起點。</Lead>
      </div>
    </div>
  </Sheet>
);

// ─── 12 範例計算 ─────────────────────────────────────────────

const Example: Page = () => (
  <Sheet section="I · 制度 · 試算範例">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 760px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>CASE · 王老師（虛構）</Eyebrow>
        <H size={60}>
          碩士・年功薪 650
          <br />
          年資 35 年・118 年後退休
        </H>
        <Lead>
          法定天花板約 6.4 萬。
          <br />
          公式的分母（10.6 萬）比她的實領還高，
          <br />
          換算成實領，<Mark>真實替代率</Mark>其實超過 60%。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="本俸（薪點 650）" value="53,075" />
        <LedgerRow label="× 2" note="本俸加一倍" value="106,150" />
        <LedgerRow label="× 替代率" note="35 年 · 118 年後" value="60%" />
        <LedgerRow label="月退上限" value="63,690" strong />
      </div>
    </div>
  </Sheet>
);

// ─── 實作頁（深色） ──────────────────────────────────────────

const StepRow = ({ n, children }: { n: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 28, alignItems: 'baseline', padding: '24px 0', borderBottom: '1px solid rgba(216,193,151,0.25)' }}>
    <span style={{ fontFamily: NUM, fontSize: 44, color: goldSoft, width: 50 }}>{n}</span>
    <span style={{ fontSize: 34, lineHeight: 1.5 }}>{children}</span>
  </div>
);

const Workshop = ({
  no,
  mins,
  tool,
  url,
  goal,
  fields,
  children,
}: {
  no: string;
  mins: string;
  tool: string;
  url: string;
  goal: string;
  fields: ReactNode;
  children: ReactNode;
}) => (
  <Sheet section={`實作 ${no} · ${mins}`} dark>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 80, height: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: '0.2em',
              background: gold,
              color: '#1E2420',
              padding: '8px 18px',
            }}
          >
            HANDS-ON {no}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 22, color: goldSoft }}>{url}</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontWeight: 900,
            fontSize: 76,
            margin: '28px 0 0',
            lineHeight: 1.2,
          }}
        >
          {tool}
        </h2>
        <div style={{ fontSize: 30, color: 'rgba(242,236,225,0.75)', marginTop: 12 }}>{goal}</div>
        <div style={{ marginTop: 32 }}>{children}</div>
      </div>
      <div
        style={{
          background: cream,
          color: '#1E2420',
          padding: '40px 40px',
          alignSelf: 'start',
          marginTop: 10,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.18em', color: gold }}>抄進學習單</div>
        {fields}
      </div>
    </div>
  </Sheet>
);

const Field = ({ code, label, hint }: { code: string; label: string; hint?: string }) => (
  <div style={{ borderBottom: `1px solid ${rule}`, padding: '22px 0 16px' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
      <span style={{ fontFamily: NUM, fontSize: 40, color: red, width: 64 }}>{code}</span>
      <span style={{ fontSize: 30, fontWeight: 500 }}>{label}</span>
    </div>
    {hint && <div style={{ fontSize: 22, color: muted, marginLeft: 82, marginTop: 6 }}>{hint}</div>}
  </div>
);

const Hands01: Page = () => (
  <Workshop
    no="01"
    mins="10 分鐘"
    tool="薪資試算"
    url="teacher-salary-calculator.netlify.app"
    goal="先知道「現在」：你的本俸與每月實領"
    fields={
      <>
        <Field code="A1" label="目前薪點 / 本俸" hint="退休金公式要用的是這個" />
        <Field code="A2" label="每月實領（稅前）" hint="本俸＋學術研究加給＋其他" />
        <Field code="A3" label="預估退休時本俸" hint="年功薪上限：學士 625／碩士 650" />
      </>
    }
  >
    <StepRow n="1">選學歷，輸入目前薪點（不知道就看薪資單）</StepRow>
    <StepRow n="2">記下「本俸」與「每月合計」兩個數字</StepRow>
    <StepRow n="3">把薪點調到你退休時會到的年功薪，看本俸變多少</StepRow>
    <StepRow n="4">比一比：本俸只佔實領的幾成？</StepRow>
  </Workshop>
);

const Hands02: Page = () => (
  <Workshop
    no="02"
    mins="20 分鐘"
    tool="退休金試算"
    url="pension-calculation.netlify.app"
    goal="再看「制度會給多少」：月退與替代率"
    fields={
      <>
        <Field code="B1" label="預估月退（含公保年金）" hint="不同退休年度都試一次" />
        <Field code="B2" label="法定所得替代率" hint="工具查表結果" />
        <Field code="B3" label="真實替代率 ＝ B1 ÷ A2" hint="這才是你退休當月的體感" />
      </>
    }
  >
    <StepRow n="1">輸入 A3 的退休本俸、預計年資、預計退休年度</StepRow>
    <StepRow n="2">新制老師：輸入提撥率與假設報酬，看專戶累積</StepRow>
    <StepRow n="3">試三種退休年度（早 5 年／預定／晚 5 年）</StepRow>
    <StepRow n="4">小組只討論：「哪個變數影響最大？」</StepRow>
  </Workshop>
);

// ─── 真實替代率 ──────────────────────────────────────────────

const RealRate: Page = () => (
  <Sheet section="I · 制度 · 實作回饋">
    <H size={64}>法定 60%，換算實領可能接近八成</H>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 80, marginTop: 40, height: 620 }}>
      <Bar label="本俸 × 2" note="公式的分母" h={340} v="136" color={muted} />
      <Bar label="每月實領" note="A2 ＝ 100" h={250} v="100" color="var(--osd-accent)" />
      <Bar label="月退上限" note="B3 ＝ B1 ÷ A2" h={205} v="≈82" color={red} />
      <div style={{ flex: 1, alignSelf: 'center', paddingLeft: 30, borderLeft: `1px solid ${rule}` }}>
        <div style={{ fontSize: 32, lineHeight: 1.7 }}>
          「60%」是乘在本俸×2 上，
          <br />
          不是乘在你的實領上。
        </div>
        <div style={{ fontSize: 26, color: muted, marginTop: 20, lineHeight: 1.6 }}>
          以王老師為例、學術研究加給以約 2.5 萬估，
          <br />
          僅為示意，請以自己的 B3 為準。
          <br />
          但別忘了：退休後的<strong>支出</strong>才是真正的尺。
        </div>
      </div>
    </div>
  </Sheet>
);

const Bar = ({ label, note, h, v, color }: { label: string; note: string; h: number; v: string; color: string }) => (
  <div style={{ width: 260, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
    <div style={{ fontFamily: NUM, fontSize: 64, textAlign: 'center', color }}>{v}</div>
    <div style={{ height: h, background: color, marginTop: 8 }} />
    <div style={{ fontSize: 28, fontWeight: 700, marginTop: 18, textAlign: 'center' }}>{label}</div>
    <div style={{ fontSize: 22, color: muted, textAlign: 'center' }}>{note}</div>
  </div>
);

// ─── 新制重點 ────────────────────────────────────────────────

const DCPoint = ({ big, t, d }: { big: string; t: string; d: string }) => (
  <div style={{ borderTop: `3px solid var(--osd-accent)`, paddingTop: 26 }}>
    <div style={{ fontFamily: NUM, fontSize: 84, color: red, lineHeight: 1 }}>{big}</div>
    <div style={{ fontSize: 34, fontWeight: 700, marginTop: 20 }}>{t}</div>
    <div style={{ fontSize: 28, color: muted, lineHeight: 1.6, marginTop: 10 }}>{d}</div>
  </div>
);

const NewSystem: Page = () => (
  <Sheet section="I · 制度 · 新制">
    <Eyebrow>給 112/7/1 後初任的年輕同事</Eyebrow>
    <H size={60}>新制的月退，是你「養」出來的</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56, marginTop: 64 }}>
      <DCPoint big="15%" t="強制提撥" d="以本俸×2 為基準，老師負擔 35%、政府 65%。" />
      <DCPoint big="+自提" t="自願增額提撥" d="可額外提撥並享稅務優惠，上限依規定。" />
      <DCPoint big="30 年" t="時間是最大槓桿" d="專戶選積極或保守，30 年後可能差好幾倍。" />
    </div>
    <div style={{ marginTop: 50, fontSize: 24, color: muted }}>
      提撥比例與投資選項以「公教人員退撫儲金」最新規定為準；工具內可自行調整參數。
    </div>
  </Sheet>
);

// ─── 休息 ────────────────────────────────────────────────────

const Break = ({ mins, next }: { mins: string; next: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: paper2,
      color: '#1E2420',
      fontFamily: 'var(--osd-font-body)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.24em', color: gold }}>INTERMISSION</div>
    <div style={{ fontFamily: NUM, fontSize: 260, lineHeight: 1.1, color: 'var(--osd-accent)' }}>{mins}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 56 }}>休息一下，數字不會跑掉</div>
    <div style={{ fontSize: 30, color: muted, marginTop: 28 }}>回來後：{next}</div>
  </div>
);

const Break1: Page = () => <Break mins="10′" next="算出你退休後真正要花的錢" />;

// ─── Part II ────────────────────────────────────────────────

const SecII: Page = () => (
  <Divider
    no="II"
    kicker="PART TWO · 75′–120′"
    title={
      <>
        退休後，
        <br />
        你<span style={{ color: goldSoft }}>要花</span>多少？
      </>
    }
    sub="不是問制度給多少，而是問生活要多少"
  />
);

const TwoWays: Page = () => (
  <Sheet section="II · 需求">
    <H size={64}>估算退休支出，有兩把尺</H>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 64 }}>
      <Ruler
        tag="快速版"
        t="所得替代法"
        f="退休前月收入 × 70–80%"
        d="好算，但假設你的生活跟現在差不多。適合還很年輕、支出還在變動的人。"
      />
      <Ruler
        tag="今天用這把"
        t="支出盤點法"
        f="逐項列出退休後每月花費"
        d="比較準，也逼你想清楚「想過什麼樣的退休生活」。需要實際記帳資料。"
        hot
      />
    </div>
  </Sheet>
);

const Ruler = ({ tag, t, f, d, hot }: { tag: string; t: string; f: string; d: string; hot?: boolean }) => (
  <div
    style={{
      background: hot ? 'var(--osd-accent)' : '#FBF8F2',
      color: hot ? cream : 'var(--osd-text)',
      border: hot ? 'none' : `1px solid ${rule}`,
      padding: '48px 52px',
      minHeight: 440,
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color: hot ? goldSoft : gold }}>{tag}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 56, marginTop: 20 }}>{t}</div>
    <div
      style={{
        fontSize: 32,
        marginTop: 24,
        paddingBottom: 24,
        borderBottom: `1px solid ${hot ? 'rgba(216,193,151,0.4)' : rule}`,
        fontWeight: 500,
      }}
    >
      {f}
    </div>
    <div style={{ fontSize: 28, lineHeight: 1.65, marginTop: 24, opacity: 0.8 }}>{d}</div>
  </div>
);

const Hands03: Page = () => (
  <Workshop
    no="03"
    mins="20 分鐘"
    tool="每月收支體檢"
    url="grand-clafoutis-b1948b.netlify.app"
    goal="先看現在的錢流向哪裡，再把它「搬」到退休那天"
    fields={
      <>
        <Field code="C1" label="現在每月總支出" hint="固定＋變動，含年繳攤提" />
        <Field code="C2" label="退休後每月支出" hint="用下一頁的調整表" />
        <Field code="C3" label="換算成退休那年的錢" hint="C2 × 通膨係數" />
      </>
    }
  >
    <StepRow n="1">填入近三個月的平均支出（沒記帳就先估）</StepRow>
    <StepRow n="2">看體檢結果：儲蓄率、固定支出佔比</StepRow>
    <StepRow n="3">逐項判斷：退休後會「消失、減少、增加」？</StepRow>
    <StepRow n="4">算出 C2，再乘上通膨係數得到 C3</StepRow>
  </Workshop>
);

const AdjustCol = ({ tag, color, items }: { tag: string; color: string; items: ReactNode }) => (
  <div style={{ borderTop: `6px solid ${color}`, background: '#FBF8F2', padding: '32px 36px', border: `1px solid ${rule}` }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, color }}>{tag}</div>
    <div style={{ fontSize: 30, lineHeight: 1.9, marginTop: 18 }}>{items}</div>
  </div>
);

const Adjust: Page = () => (
  <Sheet section="II · 需求 · 調整表">
    <H size={60}>把現在的支出，搬到退休那天</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 56 }}>
      <AdjustCol
        tag="↓ 消失"
        color="var(--osd-accent)"
        items={
          <>
            房貸（若已繳清）
            <br />
            子女教育費
            <br />
            通勤油錢
            <br />
            退撫自提、儲蓄
          </>
        }
      />
      <AdjustCol
        tag="→ 差不多"
        color={gold}
        items={
          <>
            伙食、水電瓦斯
            <br />
            電信網路
            <br />
            日常用品
            <br />
            保險（視保單）
          </>
        }
      />
      <AdjustCol
        tag="↑ 增加"
        color={red}
        items={
          <>
            醫療與保健
            <br />
            旅遊與興趣
            <br />
            長照預備金
            <br />
            孝親、紅白包
          </>
        }
      />
    </div>
  </Sheet>
);

const Inflation: Page = () => (
  <Sheet section="II · 需求 · 通膨">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, height: '100%', alignItems: 'center' }}>
      <div>
        <Eyebrow>看不見的支出：通膨</Eyebrow>
        <H size={60}>
          今天的 5 萬，
          <br />
          20 年後要 <span style={{ color: red }}>7.4 萬</span>
          <br />
          才買得到一樣的生活
        </H>
        <Lead>假設年通膨 2%。C3 就是把 C2 乘上下表的係數。</Lead>
      </div>
      <div style={{ borderTop: `3px double #1E2420` }}>
        <LedgerRow label="距離退休 10 年" value="× 1.22" />
        <LedgerRow label="距離退休 15 年" value="× 1.35" />
        <LedgerRow label="距離退休 20 年" value="× 1.49" />
        <LedgerRow label="距離退休 25 年" value="× 1.64" />
        <LedgerRow label="距離退休 30 年" value="× 1.81" />
      </div>
    </div>
  </Sheet>
);

// 缺口公式
const Gap: Page = () => (
  <Sheet section="II · 需求 · 缺口">
    <Eyebrow>今天最重要的一個數字</Eyebrow>
    <H size={72}>你的退休現金流缺口</H>
    <div
      style={{
        marginTop: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 40,
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 900,
      }}
    >
      <GapBox code="D" t="每月缺口" hot />
      <span style={{ fontSize: 80, color: gold }}>＝</span>
      <GapBox code="C3" t="退休後月支出" />
      <span style={{ fontSize: 80, color: gold }}>−</span>
      <GapBox code="B1" t="月退＋公保年金" />
    </div>
    <Lead style={{ marginTop: 56 }}>D 小於零？恭喜，你有餘裕。D 大於零？接下來 30 分鐘就是為你準備的。</Lead>
  </Sheet>
);

const GapBox = ({ code, t, hot }: { code: string; t: string; hot?: boolean }) => (
  <div
    style={{
      width: 420,
      padding: '40px 36px',
      background: hot ? red : '#FBF8F2',
      color: hot ? cream : 'var(--osd-text)',
      border: hot ? 'none' : `1px solid ${rule}`,
      textAlign: 'center',
    }}
  >
    <div style={{ fontFamily: NUM, fontSize: 110, lineHeight: 1, fontWeight: 400 }}>{code}</div>
    <div style={{ fontSize: 34, marginTop: 20 }}>{t}</div>
  </div>
);

// ─── Part III ───────────────────────────────────────────────

const SecIII: Page = () => (
  <Divider
    no="III"
    kicker="PART THREE · 120′–150′"
    title={
      <>
        缺口，
        <br />
        交給<span style={{ color: goldSoft }}>時間</span>來補
      </>
    }
    sub="4% 法則、複利反推、資產盤點"
  />
);

const Rule4: Page = () => (
  <Sheet section="III · 補缺口 · 目標本金">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 760px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>4% 法則 · 一個好記的起點</Eyebrow>
        <H size={60}>
          年缺口 × 25
          <br />
          ＝ 你要準備的本金
        </H>
        <Lead>
          每年從資產提領 4%，在歷史資料中大多能支撐約 30 年。
          <br />
          保守一點的人用 × 30（提領 3.3%）。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="每月缺口 D" value="15,000" />
        <LedgerRow label="× 12 個月" value="180,000" />
        <LedgerRow label="× 25" note="4% 法則" value="4,500,000" />
        <LedgerRow label="目標本金 E1" value="450 萬" strong />
      </div>
    </div>
  </Sheet>
);

const TimeBar = ({ yrs, monthly, w, hot }: { yrs: string; monthly: string; w: number; hot?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: 30, padding: '22px 0' }}>
    <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40 }}>{yrs}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <div style={{ width: w, height: 70, background: hot ? red : 'var(--osd-accent)' }} />
      <span style={{ fontFamily: NUM, fontSize: 56, whiteSpace: 'nowrap', color: hot ? red : 'var(--osd-text)' }}>{monthly}</span>
    </div>
  </div>
);

const Compound: Page = () => (
  <Sheet section="III · 補缺口 · 複利反推">
    <H size={60}>同樣存到 450 萬，越早開始越便宜</H>
    <div style={{ fontSize: 28, color: muted, marginTop: 14 }}>每月定期投入，假設年化報酬 6%（每月複利），僅為示意</div>
    <div style={{ marginTop: 56, borderTop: `3px double #1E2420` }}>
      <TimeBar yrs="還有 30 年" monthly="每月 4,480" w={147} />
      <TimeBar yrs="還有 20 年" monthly="每月 9,740" w={319} />
      <TimeBar yrs="還有 10 年" monthly="每月 27,460" w={900} hot />
    </div>
    <div style={{ marginTop: 48, fontSize: 34 }}>
      晚 20 年開始，每月要多付 <Mark>6 倍</Mark>。複利不是魔法，是時間的租金。
    </div>
  </Sheet>
);

const Hands04: Page = () => (
  <Workshop
    no="04"
    mins="15 分鐘"
    tool="理財試算器"
    url="toolfinance.netlify.app"
    goal="把缺口變成「每個月要做的一件事」"
    fields={
      <>
        <Field code="D" label="每月缺口 ＝ C3 − B1" />
        <Field code="E1" label="目標本金 ＝ D × 12 × 25" />
        <Field code="E2" label="每月需投入金額" hint="試 4%／6% 兩種報酬率" />
      </>
    }
  >
    <StepRow n="1">算出 D 與 E1，寫進學習單</StepRow>
    <StepRow n="2">在試算器輸入目標金額、距離退休年數、報酬率</StepRow>
    <StepRow n="3">試三種情境：保守 4%、中性 6%、延後退休 3 年</StepRow>
    <StepRow n="4">圈出你「現在就付得起」的那個版本</StepRow>
  </Workshop>
);

const Risk = ({ t, d }: { t: string; d: string }) => (
  <div style={{ background: '#FBF8F2', border: `1px solid ${rule}`, padding: '36px 40px' }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, color: red }}>{t}</div>
    <div style={{ fontSize: 28, lineHeight: 1.6, color: muted, marginTop: 14 }}>{d}</div>
  </div>
);

const Risks: Page = () => (
  <Sheet section="III · 補缺口 · 風險">
    <H size={60}>退休規劃的四個隱形對手</H>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 56 }}>
      <Risk t="長壽風險" d="活得比錢久。公保年金與年金型收入是與生命等長的解方。" />
      <Risk t="通膨風險" d="錢變薄。長期資產需要有成長性，不能全放定存。" />
      <Risk t="順序風險" d="剛退休就遇大跌。退休前 5 年逐步提高保守資產。" />
      <Risk t="醫療長照" d="最難估的一項。另外準備一筆，不要跟生活費混用。" />
    </div>
  </Sheet>
);

const Hands05: Page = () => (
  <Workshop
    no="05"
    mins="10 分鐘"
    tool="資產總覽"
    url="celadon-starship-b44b3c.netlify.app"
    goal="最後一步：你已經走了多遠？"
    fields={
      <>
        <Field code="F1" label="目前可投入退休的淨資產" hint="不含自住房" />
        <Field code="F2" label="進度 ＝ F1 ÷ E1" hint="用百分比表示" />
        <Field code="F3" label="我下個月要調整的一件事" />
      </>
    }
  >
    <StepRow n="1">列出資產：存款、股票、ETF、保單價值、專戶</StepRow>
    <StepRow n="2">列出負債：房貸、車貸、信貸</StepRow>
    <StepRow n="3">看資產配置圖：現金是否太多、太集中？</StepRow>
    <StepRow n="4">算出 F2，這是你的「退休進度條」</StepRow>
  </Workshop>
);

const Equation: Page = () => (
  <Sheet section="III · 小結">
    <Eyebrow>回到封面那張收據</Eyebrow>
    <H size={72}>現在，它是你的數字了</H>
    <div
      style={{
        marginTop: 110,
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 900,
        fontSize: 56,
      }}
    >
      <EqItem code="B1" t="月退" />
      <span style={{ color: gold }}>＋</span>
      <EqItem code="E2" t="每月投入 → 投資現金流" />
      <span style={{ color: gold }}>≥</span>
      <EqItem code="C3" t="退休後月支出" hot />
    </div>
    <Lead style={{ marginTop: 100, fontSize: 36 }}>
      翻回學習單第一頁，把開場的「憑感覺」數字，和 C3 放在一起看。差多少？
    </Lead>
  </Sheet>
);

const EqItem = ({ code, t, hot }: { code: string; t: string; hot?: boolean }) => (
  <div style={{ flex: 1, borderTop: `6px solid ${hot ? red : 'var(--osd-accent)'}`, paddingTop: 24 }}>
    <div style={{ fontFamily: NUM, fontWeight: 400, fontSize: 96, lineHeight: 1, color: hot ? red : 'var(--osd-text)' }}>
      {code}
    </div>
    <div style={{ fontSize: 30, fontFamily: 'var(--osd-font-body)', fontWeight: 500, marginTop: 16 }}>{t}</div>
  </div>
);

const Break2: Page = () => <Break mins="5′" next="每月那筆錢，要放去哪？" />;

// ─── Part IV：簡單投資入門 ──────────────────────────────────

const SecIV: Page = () => (
  <Divider
    no="IV"
    kicker="PART FOUR · 155′–175′"
    title={
      <>
        每月那筆錢，
        <br />
        要<span style={{ color: goldSoft }}>放去哪</span>？
      </>
    }
    sub="定期定額 × 買大盤 × 讓複利替你工作"
  />
);

// 複利堆疊長條：本金（墨綠）＋ 複利（紅）
const StackBar = ({
  yrs,
  principal,
  gain,
  pH,
  gH,
  total,
}: {
  yrs: string;
  principal: string;
  gain: string;
  pH: number;
  gH: number;
  total: string;
}) => (
  <div style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
    <div style={{ fontFamily: NUM, fontSize: 52, textAlign: 'center', color: red }}>{total}</div>
    <div
      style={{
        height: gH,
        background: red,
        marginTop: 8,
        color: cream,
        fontSize: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {gH >= 48 ? `複利 ${gain}` : ''}
    </div>
    <div
      style={{
        height: pH,
        background: 'var(--osd-accent)',
        color: cream,
        fontSize: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      本金 {principal}
    </div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 34, marginTop: 16, textAlign: 'center' }}>
      {yrs}
    </div>
  </div>
);

const CompoundPower: Page = () => (
  <Sheet section="IV · 簡單投資 · 複利">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: 60, height: '100%' }}>
      <div>
        <H size={56}>每月 5,000 元，看複利怎麼長大</H>
        <div style={{ fontSize: 26, color: muted, marginTop: 12 }}>定期定額，假設年化報酬 6%（每月複利），僅為示意</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 70, height: 640, marginTop: 10 }}>
          <StackBar yrs="10 年" principal="60 萬" gain="22 萬" pH={60} gH={22} total="82 萬" />
          <StackBar yrs="20 年" principal="120 萬" gain="111 萬" pH={120} gH={111} total="231 萬" />
          <StackBar yrs="30 年" principal="180 萬" gain="322 萬" pH={180} gH={322} total="502 萬" />
        </div>
      </div>
      <div style={{ alignSelf: 'center', borderLeft: `1px solid ${rule}`, paddingLeft: 56 }}>
        <H size={52}>
          第 30 年，
          <br />
          <span style={{ color: red }}>利息比本金還多</span>
        </H>
        <Lead>
          前 10 年幾乎看不出差別，
          <br />
          後 10 年才是複利真正發力的時候。
        </Lead>
        <div style={{ marginTop: 40, padding: '24px 28px', background: '#FBF8F2', border: `1px solid ${rule}` }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.16em', color: gold }}>72 法則</div>
          <div style={{ fontSize: 30, marginTop: 8 }}>
            72 ÷ 報酬率 ≈ 翻倍年數
            <br />
            <span style={{ color: muted, fontSize: 26 }}>6% → 約 12 年翻一倍</span>
          </div>
        </div>
      </div>
    </div>
  </Sheet>
);

const IndexCard = ({ big, t, d }: { big: string; t: string; d: string }) => (
  <div style={{ borderTop: `3px solid var(--osd-accent)`, paddingTop: 26 }}>
    <div style={{ fontFamily: NUM, fontSize: 84, color: red, lineHeight: 1 }}>{big}</div>
    <div style={{ fontSize: 36, fontWeight: 700, marginTop: 20 }}>{t}</div>
    <div style={{ fontSize: 28, color: muted, lineHeight: 1.6, marginTop: 10 }}>{d}</div>
  </div>
);

const IndexWhy: Page = () => (
  <Sheet section="IV · 簡單投資 · 買大盤">
    <Eyebrow>不選股，直接買下整個市場</Eyebrow>
    <H size={64}>什麼是「買大盤」？</H>
    <Lead style={{ marginTop: 20 }}>
      用一檔市值型指數 ETF，一次持有一籃子大公司：台灣前 50 大、美國 500 大，或全世界股市。
    </Lead>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56, marginTop: 64 }}>
      <IndexCard big="不用猜" t="不必選股" d="公司會變強也會變弱，指數會自動汰弱留強。" />
      <IndexCard big="低成本" t="費用率低" d="內扣費用長期影響很大，指數型通常最便宜。" />
      <IndexCard big="夠分散" t="一次買很多家" d="單一公司出事，對整體影響有限。" />
    </div>
  </Sheet>
);

const DcaRow = ({ m, price, units, hot }: { m: string; price: string; units: string; hot?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      padding: '16px 0',
      borderBottom: `1px solid ${rule}`,
      fontSize: 32,
      alignItems: 'baseline',
    }}
  >
    <span>{m}</span>
    <span style={{ fontFamily: NUM, fontSize: 40, textAlign: 'right' }}>3,000</span>
    <span style={{ fontFamily: NUM, fontSize: 40, textAlign: 'right', color: hot ? red : 'var(--osd-text)' }}>{price}</span>
    <span style={{ fontFamily: NUM, fontSize: 40, textAlign: 'right', color: hot ? red : 'var(--osd-text)' }}>{units}</span>
  </div>
);

const DCA: Page = () => (
  <Sheet section="IV · 簡單投資 · 定期定額">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 820px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>固定日期 · 固定金額 · 自動扣款</Eyebrow>
        <H size={60}>
          跌的時候，
          <br />
          你其實買到<span style={{ color: red }}>更多</span>
        </H>
        <Lead>
          價格繞了一圈回到 100，
          <br />
          每月 3,000 元扣了 4 個月，
          <br />
          帳面卻是<Mark>賺 23%</Mark>。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            paddingBottom: 14,
            borderBottom: `3px double #1E2420`,
            fontSize: 24,
            color: gold,
          }}
        >
          <span>月份</span>
          <span style={{ textAlign: 'right' }}>投入</span>
          <span style={{ textAlign: 'right' }}>價格</span>
          <span style={{ textAlign: 'right' }}>買到單位</span>
        </div>
        <DcaRow m="1 月" price="100" units="30" />
        <DcaRow m="2 月" price="80" units="37.5" />
        <DcaRow m="3 月" price="60" units="50" hot />
        <DcaRow m="4 月" price="100" units="30" />
        <LedgerRow label="投入 12,000 → 147.5 單位 × 100" value="14,750" strong />
      </div>
    </div>
  </Sheet>
);

const Hands06: Page = () => (
  <Workshop
    no="06"
    mins="10 分鐘"
    tool="看見複利的力量"
    url="toolfinance.netlify.app"
    goal="把你的 E2 放進去，看它 10、20、30 年後長成什麼樣"
    fields={
      <>
        <Field code="G1" label="我的每月定期定額" hint="先用 E2，付不起就用付得起的金額" />
        <Field code="G2" label="30 年後：本金 vs 終值" hint="試 4%、6% 兩種報酬率" />
        <Field code="G3" label="第幾年，利息超過本金？" hint="6% 約在第 22 年" />
      </>
    }
  >
    <StepRow n="1">選「定期定額／複利」試算，輸入 G1 金額</StepRow>
    <StepRow n="2">年數分別填 10、20、30，抄下終值</StepRow>
    <StepRow n="3">把報酬率從 6% 改成 4%，看差多少</StepRow>
    <StepRow n="4">再試「晚 5 年開始」，感受時間的價格</StepRow>
  </Workshop>
);

const HowStart: Page = () => (
  <Sheet section="IV · 簡單投資 · 開始">
    <H size={60}>從今天到第一筆扣款，四步</H>
    <div style={{ display: 'flex', gap: 14, marginTop: 64 }}>
      <Flow n="1" t="先留預備金" d="6 個月生活費放存款，投資的錢才不會被迫賣" />
      <Arrow />
      <Flow n="2" t="開證券戶" d="線上開戶約 15 分鐘，順便綁定扣款帳戶" />
      <Arrow />
      <Flow n="3" t="選一檔大盤" d="市值型指數 ETF，一檔就夠，不用收集" hot />
      <Arrow />
      <Flow n="4" t="設定扣款" d="發薪日後扣款，一年只檢視一次" />
    </div>
    <div style={{ marginTop: 44, fontSize: 24, color: muted }}>
      講者自己的做法，僅供參考、非投資建議；標的請自行研究費用率、規模與追蹤指數。
    </div>
  </Sheet>
);

const Flow = ({ n, t, d, hot }: { n: string; t: string; d: string; hot?: boolean }) => (
  <div
    style={{
      flex: 1,
      background: hot ? 'var(--osd-accent)' : '#FBF8F2',
      color: hot ? cream : 'var(--osd-text)',
      border: hot ? 'none' : `1px solid ${rule}`,
      padding: '40px 30px',
      minHeight: 400,
    }}
  >
    <div style={{ fontFamily: NUM, fontSize: 60, color: hot ? goldSoft : gold, lineHeight: 1 }}>{n}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 42, marginTop: 24 }}>{t}</div>
    <div style={{ fontSize: 28, lineHeight: 1.6, marginTop: 14, opacity: 0.85 }}>{d}</div>
  </div>
);

const QA = ({ q, a }: { q: string; a: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 48, padding: '28px 0', borderBottom: '1px solid rgba(216,193,151,0.25)' }}>
    <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40 }}>「{q}」</span>
    <span style={{ fontSize: 30, lineHeight: 1.55, color: 'rgba(242,236,225,0.85)' }}>{a}</span>
  </div>
);

const Myths: Page = () => (
  <Sheet section="IV · 簡單投資 · 常見問題" dark>
    <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.2em', color: goldSoft }}>FAQ · 老師最常問的三句話</div>
    <h2 style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 68, margin: '20px 0 0' }}>
      紀律，比時機重要
    </h2>
    <div style={{ marginTop: 36 }}>
      <QA q="現在是高點，要不要等？" a="沒人猜得準。定期定額的意義，就是不用猜。" />
      <QA q="大跌了，要不要停扣？" a="跌的時候正在買便宜貨。停扣，才是真的虧。" />
      <QA q="錢不多，有差嗎？" a="3,000 元也可以開始。先養成習慣，再慢慢加碼。" />
    </div>
  </Sheet>
);

const Summary: Page = () => (
  <Sheet section="IV · 小結">
    <Eyebrow>今天的一句話</Eyebrow>
    <div
      style={{
        marginTop: 60,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 36,
      }}
    >
      <EqItem code="定期定額" t="用紀律取代猜測" />
      <EqItem code="買大盤" t="用分散取代選股" />
      <EqItem code="複利" t="用時間取代本金" hot />
    </div>
    <Lead style={{ marginTop: 90, fontSize: 40, color: 'var(--osd-text)' }}>
      你不需要很會投資，只需要<Mark>很早開始、很久不停</Mark>。
    </Lead>
  </Sheet>
);

// ─── 結尾 ───────────────────────────────────────────────────

const Action = ({ when, t, d }: { when: string; t: string; d: string }) => (
  <div style={{ borderTop: `6px solid var(--osd-accent)`, paddingTop: 28 }}>
    <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.18em', color: gold }}>{when}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, marginTop: 16, lineHeight: 1.3 }}>
      {t}
    </div>
    <div style={{ fontSize: 28, color: muted, lineHeight: 1.6, marginTop: 14 }}>{d}</div>
  </div>
);

const Actions: Page = () => (
  <Sheet section="結語 · 行動承諾">
    <H size={64}>離開前，寫下三件事</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56, marginTop: 64 }}>
      <Action when="TONIGHT · 今晚" t="把學習單拍照存檔" d="明年同一天再算一次，看進度條走了多少。" />
      <Action when="THIS MONTH · 這個月" t="設定一筆自動扣款" d="金額不重要，先讓「發薪日投入」變成習慣。" />
      <Action when="THIS YEAR · 今年" t="查一次自己的年資與專戶" d="確認制度資料正確，一年檢視一次投資。" />
    </div>
    <div
      style={{
        marginTop: 90,
        padding: '32px 44px',
        background: 'var(--osd-accent)',
        color: cream,
        fontSize: 34,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>寫在學習單最後一欄，簽上名字與日期</span>
      <span style={{ color: goldSoft }}>明年今天，再打開一次 →</span>
    </div>
  </Sheet>
);

const Closing: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'var(--osd-accent)',
      color: cream,
      fontFamily: 'var(--osd-font-body)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.24em', color: goldSoft }}>CLOSING · Q&amp;A</div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 900,
        fontSize: 112,
        lineHeight: 1.25,
        margin: '48px 0 0',
      }}
    >
      我們一輩子在陪學生
      <br />
      規劃未來，
      <br />
      <span style={{ color: goldSoft }}>也該陪自己算一次。</span>
    </h2>
    <div style={{ marginTop: 64, fontSize: 30, color: 'rgba(242,236,225,0.7)', letterSpacing: '0.06em' }}>
      謝謝各位老師 ── 引路人
    </div>
  </div>
);

// ─── 講者備註（每頁建議時間與口白） ──────────────────────────

export const notes = [
  // Cover
  '【0′】自我介紹 1 分鐘。強調：今天不賣商品、不報明牌，是陪大家把自己的數字算出來。發學習單、確認手機或筆電可上網。',
  // Opening
  '【2′–6′】發便利貼，請大家寫下直覺數字，折起來夾在學習單第一頁。不討論、不分享，結尾再打開。',
  // BigAnxiety
  '【6′–8′】工具使用次數來自自己開發的試算工具後台統計。帶出：焦慮很普遍，缺的是陪算的人。',
  // Agenda
  '【8′–10′】快速帶過四段，強調每段都有動手實作，實作數字最後會串成一個答案。',
  // ToolChain
  '【10′–13′】發下學習單，對照 A→F 欄位。請大家先把五個網址加到書籤（學習單封面有網址）。',
  // Ground
  '【13′–15′】三個約定，特別是第一條：小組只談方法不談金額，讓大家安心。',
  // SecI
  '【15′】進入 Part I。',
  // ThreeLayers
  '【15′–20′】三層架構：公保年金是樓地板、退撫是主體、第三層自己補。今天重點在第三層，但要先看清前兩層。',
  // OldNew
  '【20′–25′】請舉手：112/7/1 以後初任的有幾位？新制老師後面有專屬頁。舊制老師重點在替代率表。',
  // Formula
  '【25′–28′】強調分母是本俸×2，不是實領；本俸×2 通常比實領高。很多老師聽到 60% 就恐慌，會在實作 02 後用 B3 回收。',
  // RateTable
  '【28′–32′】請大家在表上找到自己：預計退休年度 × 年資。學習單第 2 頁有完整空格可填。',
  // Drop
  '【32′–34′】停 3 秒。這 15% 就是今天要處理的缺口起點。',
  // Example
  '【34′–36′】虛構案例示範計算。本俸數字以工具內最新俸額表為準。',
  // Hands01
  '【36′–46′】實作 01。巡場協助找薪點。不知道薪點的老師可用學歷起敘＋年資估。',
  // Hands02
  '【46′–60′】實作 02。提醒三種退休年度都要試。最後 3 分鐘小組討論「影響最大的變數」。',
  // RealRate
  '【60′–63′】回收 B3：多數舊制老師的真實替代率會高於法定替代率。接著轉折——替代率高不代表夠用，要看退休後支出，帶入 Part II。請 2–3 位老師分享 B3 區間（不說金額）。',
  // NewSystem
  '【63′–65′】新制老師重點：自願增提與專戶投資選擇。舊制老師可轉告年輕同事。',
  // Break1
  '【65′–75′】休息 10 分鐘。',
  // SecII
  '【75′】進入 Part II。',
  // TwoWays
  '【75′–78′】兩把尺。今天用支出盤點法，因為輔導老師最懂「了解需求才能介入」。',
  // Hands03
  '【78′–98′】實作 03（20 分鐘）。沒有記帳的老師用手機銀行、信用卡帳單回推近三個月。',
  // Adjust
  '【98′–106′】帶大家逐欄判斷，完成學習單第 3 頁的調整表，算出 C2。',
  // Inflation
  '【106′–112′】查表乘上通膨係數得到 C3。2% 為示意，可自行用 2.5% 保守估算。',
  // Gap
  '【112′–120′】全場最重要的數字 D。請大家寫在學習單上並圈起來。',
  // SecIII
  '【120′】進入 Part III。',
  // Rule4
  '【120′–124′】4% 法則是起點不是保證。偏保守者用 ×30。',
  // Compound
  '【124′–128′】示意計算：年化 6%、每月複利。重點是時間，不是報酬率。',
  // Hands04
  '【128′–138′】實作 04。請大家至少試兩種報酬率。',
  // Risks
  '【138′–143′】四個風險，醫療長照建議獨立準備。順序風險可預告：Part IV 會談怎麼用紀律面對下跌。',
  // Hands05
  '【143′–149′】實作 05。進度條 F2 是今天的收穫之一，明年再算一次。',
  // Equation
  '【149′–150′】請大家打開開場的便利貼，對照 C3。邀請一兩位分享「感覺 vs 計算」的差距（不說金額）。',
  // Break2
  '【150′–155′】休息 5 分鐘。',
  // SecIV
  '【155′】轉場：Part III 算出每月要投入 E2，現在回答「那筆錢放哪裡」。再次聲明：分享觀念與自己的做法，非投資建議。',
  // CompoundPower
  '【155′–158′】先讓大家猜 30 年後有多少，再揭曉 502 萬。重點：本金 180 萬，其餘 322 萬是複利。帶 72 法則。',
  // IndexWhy
  '【158′–160′】大盤＝市值型指數 ETF。可口頭舉台灣 50、S&P 500、全世界股市等指數類型，不推薦特定商品。',
  // DCA
  '【160′–162′】請老師先心算：價格跌到 60 又回 100，到底賺還賠？再揭曉 +23%。這就是定期定額不怕跌的原因。',
  // Hands06
  '【162′–170′】實作 06，用理財試算器定期定額功能。請大家找出「利息超過本金」的年份（6% 約第 22 年）。',
  // HowStart
  '【170′–172′】四步驟，強調先有預備金。一檔大盤就夠。',
  // Myths
  '【172′–174′】三個常見問題，可開放 1 題現場提問。',
  // Summary
  '【174′–175′】三句話收束。',
  // Actions
  '【175′–178′】行動承諾寫在學習單最後一欄。',
  // Closing
  '【178′–180′】Q&A。感謝。',
];

export const meta: SlideMeta = {
  title: '教師退休現金流工作坊',
  createdAt: '2026-09-23T12:04:01.150Z',
};

export default [
  Cover,
  Opening,
  BigAnxiety,
  Agenda,
  ToolChain,
  Ground,
  SecI,
  ThreeLayers,
  OldNew,
  Formula,
  RateTable,
  Drop,
  Example,
  Hands01,
  Hands02,
  RealRate,
  NewSystem,
  Break1,
  SecII,
  TwoWays,
  Hands03,
  Adjust,
  Inflation,
  Gap,
  SecIII,
  Rule4,
  Compound,
  Hands04,
  Risks,
  Hands05,
  Equation,
  Break2,
  SecIV,
  CompoundPower,
  IndexWhy,
  DCA,
  Hands06,
  HowStart,
  Myths,
  Summary,
  Actions,
  Closing,
] satisfies Page[];
