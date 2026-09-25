import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import qrSalary from './assets/qr-salary.svg';
import qrPension from './assets/qr-pension.svg';
import qrBudget from './assets/qr-budget.svg';
import qrFinance from './assets/qr-finance.svg';
import qrAssets from './assets/qr-assets.svg';
// 學習單截圖（範例版，藍字＝示範填法）與「在第幾頁哪個位置」縮圖
import wsCover from './assets/ws-cover.png';
import wsCoverMap from './assets/ws-cover-map.png';
import wsP2Salary from './assets/ws-p2-salary.png';
import wsP2SalaryMap from './assets/ws-p2-salary-map.png';
import wsP2Pension from './assets/ws-p2-pension.png';
import wsP2PensionMap from './assets/ws-p2-pension-map.png';
import wsP3Input from './assets/ws-p3-input.png';
import wsP3InputMap from './assets/ws-p3-input-map.png';
import wsP3Result from './assets/ws-p3-result.png';
import wsP3ResultMap from './assets/ws-p3-result-map.png';
import wsP4Input from './assets/ws-p4-input.png';
import wsP4InputMap from './assets/ws-p4-input-map.png';
import wsP4Result from './assets/ws-p4-result.png';
import wsP4ResultMap from './assets/ws-p4-result-map.png';
import wsP5Setup from './assets/ws-p5-setup.png';
import wsP5SetupMap from './assets/ws-p5-setup-map.png';
import wsP5Draft from './assets/ws-p5-draft.png';
import wsP5DraftMap from './assets/ws-p5-draft-map.png';
import wsP5Result from './assets/ws-p5-result.png';
import wsP5ResultMap from './assets/ws-p5-result-map.png';
import wsP6Top from './assets/ws-p6-top.png';
import wsP6TopMap from './assets/ws-p6-top-map.png';
import wsP6Bottom from './assets/ws-p6-bottom.png';
import wsP6BottomMap from './assets/ws-p6-bottom-map.png';
import wsP7Action from './assets/ws-p7-action.png';
import wsP7ActionMap from './assets/ws-p7-action-map.png';

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
        教師退休制度 × 退休金試算 × 現況盤點 × 理財
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
        現在月支出 <span style={{ float: 'right', fontFamily: NUM, fontSize: 36 }}>C1</span>
      </div>
      <div style={{ borderBottom: `1px solid ${rule}`, padding: '28px 0 18px', fontSize: 30 }}>
        × 12 × 25 <span style={{ float: 'right', fontFamily: NUM, fontSize: 36, color: muted }}>4% 法則</span>
      </div>
      <div style={{ borderBottom: `3px double #1E2420`, padding: '28px 0 18px', fontSize: 30 }}>
        ＝ 目標本金 <span style={{ float: 'right', fontFamily: NUM, fontSize: 36, color: red }}>F1</span>
      </div>
      <div style={{ marginTop: 36, fontSize: 26, lineHeight: 1.6, color: muted }}>
        月退 B1 是備案，不是主力。
        <br />
        今天三小時，把這張收據
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
  <WsHands
    tag="QUESTION 00"
    section="開場 · 學習單封面 · 3 分鐘"
    title={
      <>
        退休後一個月，
        <br />
        要多少錢才睡得著？
      </>
    }
    goal="寫在學習單封面，先不要跟隔壁討論"
    page="封面"
    shot={wsCover}
    map={wsCoverMap}
  >
    <WsStep n="1">「憑感覺」：寫下直覺的數字</WsStep>
    <WsStep n="2">「有根據」：先空著，第二關再填</WsStep>
    <WsStep n="3">紅框＝要寫數字的地方</WsStep>
    <WsStep n="4">空心小框＝引用前面的數字</WsStep>
  </WsHands>
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
      gridTemplateColumns: '170px 110px 1fr 330px',
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
    <H size={64}>今天的帳，照學習單一頁一頁記</H>
    <div style={{ marginTop: 44, borderTop: `3px double #1E2420` }}>
      <AgendaRow time="00–12′" code="00" title="開場" desc="你的第一個直覺數字" hands="學習單封面" />
      <AgendaRow time="12–60′" code="I" title="看懂制度" desc="年改、替代率、新舊制" hands="第 2 頁 · 實作 01・02" />
      <AgendaRow time="70–105′" code="II" title="看清現況" desc="現在每月花多少、存多少" hands="第 3 頁 · 實作 03" />
      <AgendaRow time="105–130′" code="III" title="盤點資產" desc="淨值、負債比、預備金" hands="第 4 頁 · 實作 04" />
      <AgendaRow time="135–167′" code="IV" title="理財規劃" desc="目標本金、複利、總複習" hands="第 5–6 頁 · 實作 05" />
      <AgendaRow time="167–180′" code="EX" title="延伸" desc="買大盤、行動承諾、Q&A" hands="第 7 頁" />
    </div>
    <div style={{ marginTop: 28, fontSize: 24, color: muted }}>每一關都是「先講觀念，再翻學習單動手填」｜中場休息：60′（10 分鐘）、130′（5 分鐘）</div>
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
      <ToolCard n="01" name="薪資試算" q="我現在與到頂時的年薪？" out="A 年薪" />
      <Arrow />
      <ToolCard n="02" name="退休金試算" q="制度會給我多少？" out="B 月退" />
      <Arrow />
      <ToolCard n="03" name="每月收支體檢" q="我現在每月花多少、存多少？" out="C 收支・儲蓄率" />
      <Arrow />
      <ToolCard n="04" name="資產總覽" q="我現在有多少家底？" out="E 淨值・負債比" />
      <Arrow />
      <ToolCard n="05" name="理財試算器" q="目標多少？每月存多少？" out="F 目標・G 複利" />
    </div>
    <div style={{ marginTop: 40, fontSize: 28, color: muted }}>
      學習單就是一張 <Mark>A → G</Mark> 的帳本：每做完一個工具，就把數字抄進對應的格子。
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
    kicker="PART ONE · 12′–60′ · 學習單第 2 頁"
    title={
      <>
        你的退休金，
        <br />
        是<span style={{ color: goldSoft }}>怎麼算</span>出來的
      </>
    }
    sub="從法規讀懂：本俸、年資、所得替代率，再算自己的"
  />
);

// ─── 退撫制度時間軸 ─────────────────────────────────────────

const Milestone = ({ year, t, d, hot }: { year: string; t: string; d: string; hot?: boolean }) => (
  <div style={{ flex: 1, position: 'relative', paddingTop: 56 }}>
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 0,
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: hot ? red : 'var(--osd-accent)',
        border: `5px solid var(--osd-bg)`,
        boxShadow: `0 0 0 2px ${hot ? red : 'var(--osd-accent)'}`,
      }}
    />
    <div style={{ fontFamily: NUM, fontSize: 44, color: hot ? red : gold, lineHeight: 1 }}>{year}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 36, marginTop: 16, lineHeight: 1.3 }}>
      {t}
    </div>
    <div style={{ fontSize: 26, color: muted, lineHeight: 1.6, marginTop: 12, paddingRight: 24 }}>{d}</div>
  </div>
);

const Timeline: Page = () => (
  <Sheet section="I · 制度 · 先看全貌">
    <Eyebrow>3 分鐘看懂退撫制度</Eyebrow>
    <H size={64}>三十年來，退撫制度走了五步</H>
    <div style={{ position: 'relative', marginTop: 90 }}>
      <div style={{ position: 'absolute', top: 25, left: 0, right: 0, height: 3, background: rule }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <Milestone year="84 年前" t="恩給制" d="退休金由政府全額編列預算支應" />
        <Milestone year="84/7/1" t="退撫基金制" d="老師與政府共同提撥，確定給付（DB）" />
        <Milestone year="107/7/1" t="年金改革" d="替代率原訂逐年調降至 118 年" />
        <Milestone year="112/7/1" t="個人專戶制" d="新進教師改為確定提撥（DC），帳戶隨人走" hot />
        <Milestone year="113 起" t="替代率停砍" d="修法停在 112 年水準（釋憲審理中）" hot />
      </div>
    </div>
    <Lead style={{ marginTop: 70, color: 'var(--osd-text)' }}>
      你在哪一年初任，決定你適用哪一套規則。
    </Lead>
  </Sheet>
);

// ─── 提早離職 ───────────────────────────────────────────────

const LeaveCell = ({ children, hot }: { children: ReactNode; hot?: boolean }) => (
  <div
    style={{
      fontSize: 28,
      lineHeight: 1.5,
      padding: '22px 28px',
      background: hot ? 'rgba(180,67,46,0.06)' : '#FBF8F2',
      border: `1px solid ${rule}`,
    }}
  >
    {children}
  </div>
);

const LeaveRow = ({ k, a, b }: { k: string; a: ReactNode; b: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 16, marginTop: 16 }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 38, alignSelf: 'center' }}>{k}</div>
    <LeaveCell>{a}</LeaveCell>
    <LeaveCell hot>{b}</LeaveCell>
  </div>
);

const EarlyLeave: Page = () => (
  <Sheet section="I · 制度 · 提早離職">
    <H size={60}>如果提早離職，錢拿得回來嗎？</H>
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 16, marginTop: 40 }}>
      <span style={{ fontSize: 24, color: gold }}>任職年資</span>
      <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 34 }}>舊制 · 退撫基金制</span>
      <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 34, color: red }}>新制 · 個人專戶制</span>
    </div>
    <LeaveRow
      k="未滿 5 年"
      a={<>可申請發還<strong>自己繳的</strong>本息；政府撥繳部分不發還</>}
      b={<>只能領回<strong>自己提繳的 35%</strong>；政府提撥 65% 不能領</>}
    />
    <LeaveRow
      k="滿 5 年"
      a={<>同上；或<strong>保留年資</strong>，日後轉任他職退休時併計</>}
      b={<>政府提撥部分可領回 <strong>50%</strong></>}
    />
    <LeaveRow
      k="滿 10 年"
      a={<>同上</>}
      b={<>政府提撥部分 <strong>100%</strong> 全部領回</>}
    />
    <div style={{ marginTop: 28, fontSize: 22, color: muted }}>
      講者依相關條例整理，申請期限與細節以《公立學校教職員退休資遣撫卹條例》《個人專戶制條例》及學校人事室說明為準。
    </div>
  </Sheet>
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
          依「退休年度 × 任職年資」查表。年改後逐年調降，113 年起修法停在 112 年度的水準。
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

const RateRow = ({
  y,
  c,
  hot,
  gone,
}: {
  y: string;
  c: [string, string, string, string, string];
  hot?: boolean;
  gone?: boolean;
}) => (
  <div
    style={{
      opacity: gone ? 0.45 : 1,
      textDecoration: gone ? 'line-through' : undefined,
      background: hot ? 'rgba(180,67,46,0.06)' : undefined,
      display: 'grid',
      gridTemplateColumns: '260px repeat(5, 1fr)',
      alignItems: 'baseline',
      padding: '16px 0',
      borderBottom: `1px solid ${rule}`,
    }}
  >
    <span style={{ fontSize: 30, fontWeight: hot ? 700 : 500, color: hot ? red : undefined }}>{y}</span>
    <Cell v={c[0]} hot={hot} />
    <Cell v={c[1]} hot={hot} />
    <Cell v={c[2]} hot={hot} />
    <Cell v={c[3]} hot={hot} />
    <Cell v={c[4]} hot={hot} />
  </div>
);

const RateTable: Page = () => (
  <Sheet section="I · 制度 · 法規">
    <H size={60}>替代率上限：原訂砍到 60%，停在 69%</H>
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
      <RateRow y="107 年（年改）" c={['45.0%', '52.5%', '60.0%', '67.5%', '75.0%']} />
      <RateRow y="現行：112 年度" c={['39.0%', '46.5%', '54.0%', '61.5%', '69.0%']} hot />
      <RateRow y="原訂 118 年後" c={['30.0%', '37.5%', '45.0%', '52.5%', '60.0%']} gone />
    </div>
    <div style={{ marginTop: 28, fontSize: 24, color: muted }}>
      114 年 12 月立法院三讀停止調降，不論何時退休皆以 112 年度上限計；行政院、考試院已聲請釋憲，最終以憲法法庭判決及主管機關公告為準。
    </div>
  </Sheet>
);

// ─── 11 替代率查表 ───────────────────────────────────────────

const RateCell = ({ y, v, hot }: { y: string; v: string; hot?: boolean }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '11px 22px',
      borderBottom: `1px solid ${rule}`,
      background: hot ? red : undefined,
      color: hot ? cream : 'var(--osd-text)',
    }}
  >
    <span style={{ fontSize: 28, color: hot ? cream : muted }}>{y} 年</span>
    <span style={{ fontFamily: NUM, fontSize: 40, lineHeight: 1.1 }}>{v}</span>
  </div>
);

const LookStep = ({ n, t, ex }: { n: string; t: string; ex: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', padding: '22px 0', borderBottom: `1px solid ${rule}` }}>
    <span style={{ fontFamily: NUM, fontSize: 56, color: gold, lineHeight: 1 }}>{n}</span>
    <div>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{t}</div>
      <div style={{ fontFamily: NUM, fontSize: 30, color: red, marginTop: 8 }}>{ex}</div>
    </div>
  </div>
);

const RateLookup: Page = () => (
  <Sheet section="I · 制度 · 查表">
    <H size={60}>所得替代率怎麼查？找到你的年資</H>
    <div style={{ display: 'grid', gridTemplateColumns: '580px 1fr', gap: 64, marginTop: 40 }}>
      <div>
        <div style={{ borderTop: `3px double #1E2420` }}>
          <LookStep n="1" t="算年資：退休年齡 − 初任年齡" ex="例：60 − 25 ＝ 35 年" />
          <LookStep n="2" t="查表：找到年資那一格" ex="例：35 年 → 69%" />
          <LookStep n="3" t="算上限：本俸 × 2 × 替代率" ex="例：54,160 × 2 × 69% ＝ 74,741" />
        </div>
        <div style={{ fontSize: 23, color: muted, lineHeight: 1.65, marginTop: 24 }}>
          年資滿 15 年才能領月退；不滿一年的月數按比例加計。
          <br />
          超過 35 年每年再 +0.5%，最多算到 40 年（71.5%）。
          <br />
          新制（112/7/1 後初任）看個人專戶，不查這張表。
        </div>
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 24,
            color: gold,
            paddingBottom: 12,
            borderBottom: `3px double #1E2420`,
          }}
        >
          <span>舊制 · 112 年度上限（現行）</span>
          <span>年資 → 所得替代率</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: 28 }}>
          <div>
            <RateCell y="15" v="39.0%" />
            <RateCell y="16" v="40.5%" />
            <RateCell y="17" v="42.0%" />
            <RateCell y="18" v="43.5%" />
            <RateCell y="19" v="45.0%" />
            <RateCell y="20" v="46.5%" />
            <RateCell y="21" v="48.0%" />
          </div>
          <div>
            <RateCell y="22" v="49.5%" />
            <RateCell y="23" v="51.0%" />
            <RateCell y="24" v="52.5%" />
            <RateCell y="25" v="54.0%" />
            <RateCell y="26" v="55.5%" />
            <RateCell y="27" v="57.0%" />
            <RateCell y="28" v="58.5%" />
          </div>
          <div>
            <RateCell y="29" v="60.0%" />
            <RateCell y="30" v="61.5%" />
            <RateCell y="31" v="63.0%" />
            <RateCell y="32" v="64.5%" />
            <RateCell y="33" v="66.0%" />
            <RateCell y="34" v="67.5%" />
            <RateCell y="35" v="69.0%" hot />
          </div>
        </div>
        <div style={{ fontSize: 22, color: muted, marginTop: 18 }}>每多 1 年 +1.5%。依《公立學校教職員退休資遣撫卹條例》第 37 條附表三。</div>
      </div>
    </div>
  </Sheet>
);

// ─── 12 範例計算 ─────────────────────────────────────────────

const Example: Page = () => (
  <Sheet section="I · 制度 · 試算範例">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 760px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>CASE · 示範老師（虛構，和學習單範例同一人）</Eyebrow>
        <H size={60}>
          學士・年功薪 625
          <br />
          年資 35 年・現行上限
        </H>
        <Lead>
          25 歲初任、60 歲退休，查表 35 年 → 69%。
          <br />
          月退上限約 7.5 萬，這是法定天花板；
          <br />
          實際金額以退休金試算工具為準。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="本俸（薪點 625）" note="114 年待遇表" value="54,160" />
        <LedgerRow label="× 2" note="本俸加一倍" value="108,320" />
        <LedgerRow label="× 替代率" note="35 年 · 112 年度上限" value="69%" />
        <LedgerRow label="月退上限" value="74,741" strong />
      </div>
    </div>
  </Sheet>
);

// ─── 實作頁（深色）：左邊步驟，右邊是學習單截圖 ─────────────────

const WsStep = ({ n, children }: { n: string; children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: 20,
      alignItems: 'baseline',
      padding: '13px 0',
      borderBottom: '1px solid rgba(216,193,151,0.25)',
    }}
  >
    <span style={{ fontFamily: NUM, fontSize: 36, color: goldSoft, width: 36, flex: 'none' }}>{n}</span>
    <span style={{ fontSize: 28, lineHeight: 1.45 }}>{children}</span>
  </div>
);

const WsHands = ({
  tag,
  section,
  title,
  goal,
  page,
  shot,
  map,
  url,
  qr,
  children,
}: {
  tag: string;
  section: string;
  title: ReactNode;
  goal: string;
  page: string;
  shot: string;
  map: string;
  url?: string;
  qr?: string;
  children: ReactNode;
}) => (
  <Sheet section={section} dark>
    <div style={{ display: 'grid', gridTemplateColumns: '540px 1fr', gap: 48, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 21,
              letterSpacing: '0.18em',
              background: gold,
              color: '#1E2420',
              padding: '7px 16px',
            }}
          >
            {tag}
          </span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontWeight: 900,
            fontSize: 58,
            margin: '24px 0 0',
            lineHeight: 1.22,
          }}
        >
          {title}
        </h2>
        <div style={{ fontSize: 26, color: 'rgba(242,236,225,0.75)', marginTop: 10, lineHeight: 1.45 }}>{goal}</div>
        <div style={{ marginTop: 16 }}>{children}</div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 24, alignItems: 'flex-end' }}>
          <div>
            <img src={map} alt="" style={{ width: 130, display: 'block', border: '1px solid rgba(216,193,151,0.5)' }} />
            <div style={{ fontSize: 20, color: goldSoft, marginTop: 8 }}>學習單{page}</div>
          </div>
          {qr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: cream, color: '#1E2420', padding: 12 }}>
              <img src={qr} alt={url} style={{ width: 132, height: 132, display: 'block' }} />
              <div style={{ width: 170 }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>手機掃描</div>
                <div style={{ fontSize: 20, color: muted, marginTop: 6 }}>開啟並加入書籤</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            alignSelf: 'stretch',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 19, letterSpacing: '0.14em', color: goldSoft }}>WORKSHEET · 學習單{page}</span>
          <span style={{ fontSize: 22, color: 'rgba(242,236,225,0.7)' }}>藍字＝示範老師的填法</span>
        </div>
        <div style={{ background: '#FBF8F2', padding: 14, boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}>
          <img
            src={shot}
            alt={`學習單${page}`}
            style={{ display: 'block', maxWidth: 1064, maxHeight: 700, width: 'auto', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  </Sheet>
);

const H01Salary: Page = () => (
  <WsHands
    tag="HANDS-ON 01"
    section="實作 01 · 10 分鐘"
    title="薪資試算"
    goal="現在的我、年功薪到頂的我"
    page="第 2 頁"
    shot={wsP2Salary}
    map={wsP2SalaryMap}
    url="teacher-salary-calculator.netlify.app"
    qr={qrSalary}
  >
    <WsStep n="1">選學歷、薪級（新制自提設 0%）</WsStep>
    <WsStep n="2">抄月實領、年薪、年齡 → A1</WsStep>
    <WsStep n="3">薪級調到年功薪上限 → A2</WsStep>
    <WsStep n="4">A3 ＝ A2 − A1</WsStep>
  </WsHands>
);

const H02Pension: Page = () => (
  <WsHands
    tag="HANDS-ON 02"
    section="實作 02 · 15 分鐘"
    title="退休金試算"
    goal="舊制、新制擇一填寫"
    page="第 2 頁"
    shot={wsP2Pension}
    map={wsP2PensionMap}
    url="pension-calculation.netlify.app"
    qr={qrPension}
  >
    <WsStep n="1">輸入預計退休年齡（58 歲起支）</WsStep>
    <WsStep n="2">舊制：月退＋公保一次給付</WsStep>
    <WsStep n="3">新制：專戶月領＋公保年金</WsStep>
    <WsStep n="4">每月可領 → 寫進 B1</WsStep>
  </WsHands>
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

const Break1: Page = () => <Break mins="10′" next="看清你現在每個月花多少（學習單第 3 頁）" />;

// ─── Part II ────────────────────────────────────────────────

const SecII: Page = () => (
  <Divider
    no="II"
    kicker="PART TWO · 70′–105′ · 學習單第 3 頁"
    title={
      <>
        先看清楚，
        <br />
        你<span style={{ color: goldSoft }}>現在</span>花多少
      </>
    }
    sub="退休太遙遠，今天的月支出最有真實感"
  />
);

const TwoWays: Page = () => (
  <Sheet section="II · 現況">
    <H size={64}>退休後要花多少？不必精算，先粗估</H>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 64 }}>
      <Ruler
        tag="常見做法"
        t="所得替代法"
        f="退休前月收入 × 70–80%"
        d="好算，但要先知道自己的月收入，適合當參考值。"
      />
      <Ruler
        tag="今天用這把"
        t="現況支出法"
        f="退休後月支出 ≈ 現在的月均支出"
        d="房貸、車貸、子女教育可能沒了，但醫療、旅遊會增加，一來一往，用現在的支出最有真實感。"
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

const H03Input: Page = () => (
  <WsHands
    tag="HANDS-ON 03 · ①②"
    section="實作 03 ①② · 12 分鐘"
    title="每月收支體檢"
    goal="左邊小格打草稿，右邊合計照順序輸入"
    page="第 3 頁"
    shot={wsP3Input}
    map={wsP3InputMap}
    url="grand-clafoutis-b1948b.netlify.app"
    qr={qrBudget}
  >
    <WsStep n="1">收入 ⓐⓑⓒ：固定、額外、獎金</WsStep>
    <WsStep n="2">支出 ⓓⓔⓕ：固定到一次性</WsStep>
    <WsStep n="3">黃色「整年」格：填一整年</WsStep>
    <WsStep n="4">六個合計依序輸入工具</WsStep>
  </WsHands>
);

const H03Result: Page = () => (
  <WsHands
    tag="HANDS-ON 03 · ③"
    section="實作 03 ③ · 8 分鐘"
    title="收支體檢結果"
    goal="工具算好的數字，抄回紅框"
    page="第 3 頁"
    shot={wsP3Result}
    map={wsP3ResultMap}
  >
    <WsStep n="1">抄 C1、C2、C3</WsStep>
    <WsStep n="2">參考：所得替代法 C2 × 0.7</WsStep>
    <WsStep n="3">翻回第 2 頁抄 B1，算 D</WsStep>
    <WsStep n="4">封面「有根據」填上 C1</WsStep>
  </WsHands>
);

const AdjustCol = ({ tag, color, items }: { tag: string; color: string; items: ReactNode }) => (
  <div style={{ borderTop: `6px solid ${color}`, background: '#FBF8F2', padding: '32px 36px', border: `1px solid ${rule}` }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, color }}>{tag}</div>
    <div style={{ fontSize: 30, lineHeight: 1.9, marginTop: 18 }}>{items}</div>
  </div>
);

const Adjust: Page = () => (
  <Sheet section="II · 現況 · 為什麼用現在的支出">
    <H size={60}>退休後的支出，一來一往</H>
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
  <Sheet section="II · 現況 · 通膨">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, height: '100%', alignItems: 'center' }}>
      <div>
        <Eyebrow>那通膨怎麼辦？</Eyebrow>
        <H size={60}>
          全部用
          <br />
          <span style={{ color: red }}>「今天的錢」</span>算到底
        </H>
        <Lead>
          月退有隨物價檢討調整的機制，
          <br />
          支出也用今天的物價估，兩邊同一把尺。
          <br />
          通膨，改從報酬率裡扣掉。
        </Lead>
      </div>
      <div style={{ borderTop: `3px double #1E2420` }}>
        <LedgerRow label="投資的名目報酬（示意）" value="7%" />
        <LedgerRow label="− 每年通膨" value="2%" />
        <LedgerRow label="＝ 實質報酬" note="第四關用這個算" value="5%" strong />
        <div style={{ fontSize: 26, color: muted, marginTop: 24, lineHeight: 1.6 }}>
          為什麼要扣？今天的 5 萬，20 年後要約 7.4 萬才買得到一樣的生活。
        </div>
      </div>
    </div>
  </Sheet>
);

// 餘裕：算完之後的解讀
const Gap: Page = () => (
  <Sheet section="II · 現況 · 解讀">
    <Eyebrow>算完之後，怎麼看這個數字？</Eyebrow>
    <H size={72}>退休後每月的餘裕</H>
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
      <GapBox big="餘裕" t="每月可以多花或多存" hot />
      <span style={{ fontSize: 80, color: gold }}>＝</span>
      <GapBox big="月退" t="制度每月給你的" />
      <span style={{ fontSize: 80, color: gold }}>−</span>
      <GapBox big="月支出" t="現在的月均支出" />
    </div>
    <Lead style={{ marginTop: 56 }}>
      大於 0：月退就夠生活，有餘裕。小於 0：差額要靠自己準備。
      <br />
      但不論正負，接下來都<Mark>把月退當備案</Mark>，自己存出一份本金。
    </Lead>
  </Sheet>
);

const GapBox = ({ big, t, hot }: { big: string; t: string; hot?: boolean }) => (
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
    <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 96, lineHeight: 1.1, fontWeight: 900 }}>{big}</div>
    <div style={{ fontSize: 32, marginTop: 20, fontWeight: 500 }}>{t}</div>
  </div>
);

// ─── Part III ───────────────────────────────────────────────

const SecIII: Page = () => (
  <Divider
    no="III"
    kicker="PART THREE · 105′–130′ · 學習單第 4 頁"
    title={
      <>
        理財之前，
        <br />
        先<span style={{ color: goldSoft }}>盤點</span>你有的
      </>
    }
    sub="資產、負債、淨值、負債比，看清你的家底"
  />
);

const Rule4: Page = () => (
  <Sheet section="IV · 理財 · 目標本金">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 760px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>假設沒有退休金 · 4% 法則</Eyebrow>
        <H size={60}>
          現在月支出 × 12 × 25
          <br />
          ＝ 你的目標本金
        </H>
        <Lead>
          每年提領本金的 4%，歷史上大多能撐約 30 年；保守者用 × 30。
          <br />
          月退是備案：有它更安心，沒有也不慌。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="現在的月均支出" value="40,000" />
        <LedgerRow label="× 12 個月" value="480,000" />
        <LedgerRow label="× 25" note="4% 法則" value="12,000,000" />
        <LedgerRow label="目標本金" value="1,200 萬" strong />
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
  <Sheet section="IV · 理財 · 複利反推">
    <H size={60}>存到 1,200 萬，越早開始越便宜</H>
    <div style={{ fontSize: 28, color: muted, marginTop: 14 }}>目標本金 1,200 萬、從零開始；實質報酬 5%、每月複利，僅為示意</div>
    <div style={{ marginTop: 56, borderTop: `3px double #1E2420` }}>
      <TimeBar yrs="還有 30 年" monthly="每月 14,420" w={168} />
      <TimeBar yrs="還有 20 年" monthly="每月 29,200" w={340} />
      <TimeBar yrs="還有 10 年" monthly="每月 77,280" w={900} hot />
    </div>
    <div style={{ marginTop: 48, fontSize: 34 }}>
      晚 20 年開始，每月要付 <Mark>5 倍以上</Mark>。複利不是魔法，是時間的租金。
    </div>
  </Sheet>
);


// ─── 財富階梯 ───────────────────────────────────────────────

const Rung = ({
  n,
  usd,
  twd,
  name,
  task,
  h,
  bg,
  fg,
}: {
  n: string;
  usd: string;
  twd: string;
  name: string;
  task: string;
  h: number;
  bg: string;
  fg: string;
}) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 36 }}>{name}</div>
    <div style={{ fontSize: 26, color: red, fontWeight: 700, marginTop: 6 }}>{twd}</div>
    <div style={{ fontSize: 24, color: muted, lineHeight: 1.5, marginTop: 8, marginBottom: 18, minHeight: 72 }}>{task}</div>
    <div
      style={{
        height: h,
        background: bg,
        color: fg,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ fontFamily: NUM, fontSize: 64, lineHeight: 1 }}>{n}</span>
      <span style={{ fontFamily: MONO, fontSize: 20, opacity: 0.85 }}>{usd}</span>
    </div>
  </div>
);

const WealthLadder: Page = () => (
  <Sheet section="III · 盤點 · 財富階梯">
    <Eyebrow>《財富階梯》尼克．馬朱利（《持續買進》作者）</Eyebrow>
    <H size={56}>淨資產決定你站在哪一階，每階的功課不同</H>
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 610, marginTop: 20 }}>
      <Rung n="1" usd="< 1 萬美元" twd="約 30 萬以下" name="月光求生" task="存緊急預備金，避開惡性負債" h={130} bg={paper2} fg="#1E2420" />
      <Rung n="2" usd="1–10 萬美元" twd="約 30–300 萬" name="初步緩衝" task="投資自己，學核心技能、提升主動收入" h={200} bg={goldSoft} fg="#1E2420" />
      <Rung n="3" usd="10–100 萬美元" twd="約 300–3,000 萬" name="有感累積" task="用錢滾錢，靠長期投資放大資產" h={270} bg="var(--osd-accent)" fg={cream} />
      <Rung n="4" usd="100–1,000 萬美元" twd="約 3,000 萬–3 億" name="事業加速" task="靠薪資難躍升，要拓展事業或創業" h={340} bg={green2} fg={cream} />
      <Rung n="5–6" usd="1,000 萬美元以上" twd="約 3 億以上" name="擴張與守成" task="大型事業、家族企業維持階級" h={410} bg="#1E2420" fg={goldSoft} />
    </div>
  </Sheet>
);

const PrincipleCard = ({ k, t, d, ex }: { k: string; t: string; d: string; ex: ReactNode }) => (
  <div style={{ background: '#FBF8F2', border: `1px solid ${rule}`, padding: '40px 40px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.16em', color: gold }}>{k}</div>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 46, marginTop: 16 }}>{t}</div>
    <div style={{ fontSize: 28, lineHeight: 1.6, color: muted, marginTop: 16 }}>{d}</div>
    <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px dashed ${rule}`, fontSize: 28, lineHeight: 1.5 }}>{ex}</div>
  </div>
);

const LadderRules: Page = () => (
  <Sheet section="III · 盤點 · 財富階梯">
    <H size={60}>三個原則，看懂自己的這一階</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 56, height: 560 }}>
      <PrincipleCard
        k="衡量標準"
        t="看淨資產，不看收入"
        d="資產減負債才是你真正擁有的。月薪高但負債多，不一定站得比較高。"
        ex={<>你的<Mark>總淨值</Mark>，就是你在階梯上的位置。</>}
      />
      <PrincipleCard
        k="萬分之一法則"
        t="小錢不必糾結"
        d="消費低於淨資產的 0.01%，就是不需要反覆計較的「小錢」。"
        ex={<>淨資產 470 萬 × 0.01% ＝ <Mark>470 元</Mark>，這以下的咖啡不用算。</>}
      />
      <PrincipleCard
        k="量力而行"
        t="解決這一階的煩惱"
        d="專注眼前這一階的功課，不提前過超出自己階層的生活。"
        ex={<>第 3 階的功課：<Mark>用錢滾錢</Mark>，也就是等一下的理財規劃。</>}
      />
    </div>
  </Sheet>
);

const NetWorth: Page = () => (
  <Sheet section="III · 盤點 · 淨值">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 820px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>淨值 ≠ 可以拿去理財的錢</Eyebrow>
        <H size={60}>
          房子不能拿來
          <br />
          定期定額
        </H>
        <Lead>
          工具會拆成兩塊：
          <br />
          房屋淨值、不含房子的淨資產。
          <br />
          房子不會生出現金流；存款裡先留
          <br />
          <Mark>6 個月生活費</Mark>當緊急預備金，
          <br />
          其餘才適合長期投資。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="總資產" note="含房屋現值 800 萬" value="970 萬" />
        <LedgerRow label="− 總負債" note="含房貸 480 萬" value="500 萬" />
        <LedgerRow label="總淨值" value="470 萬" strong />
        <LedgerRow label="房屋淨值" note="現值 − 房貸" value="320 萬" />
        <LedgerRow label="不含房子的淨資產" note="存款＋投資" value="150 萬" />
        <LedgerRow label="緊急預備金（先留）" note="4 萬 × 6 個月" value="24 萬" />
      </div>
    </div>
  </Sheet>
);


const DebtKind = ({ t, d, hot }: { t: string; d: string; hot?: boolean }) => (
  <div style={{ borderLeft: `8px solid ${hot ? red : 'var(--osd-accent)'}`, background: '#FBF8F2', padding: '26px 34px' }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40, color: hot ? red : 'var(--osd-accent)' }}>{t}</div>
    <div style={{ fontSize: 28, lineHeight: 1.6, color: muted, marginTop: 8 }}>{d}</div>
  </div>
);

const DebtRatio: Page = () => (
  <Sheet section="III · 盤點 · 負債比">
    <Eyebrow>負債比 ＝ 總負債 ÷ 總資產</Eyebrow>
    <H size={60}>負債比高不可怕，要看是哪一種債</H>
    <div style={{ display: 'grid', gridTemplateColumns: '700px 1fr', gap: 64, marginTop: 48 }}>
      <div style={{ background: '#fff', border: `1px solid ${rule}`, padding: '40px 44px' }}>
        <div style={{ fontSize: 24, color: muted, letterSpacing: '0.08em' }}>工具畫面範例 · 負債比</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 8 }}>
          <span style={{ fontFamily: NUM, fontSize: 150, lineHeight: 1, color: red }}>78%</span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#8A6A1F',
              background: '#F6ECD2',
              border: '2px solid #E3CF9E',
              borderRadius: 40,
              padding: '4px 22px',
            }}
          >
            房貸為主
          </span>
        </div>
        <div style={{ height: 22, background: paper2, marginTop: 28, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '78%', background: red }} />
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.65, marginTop: 30, borderLeft: `4px solid ${gold}`, paddingLeft: 22 }}>
          負債比偏高，但若主要來自房貸——這是有擔保的低利負債，剛買房的前幾年本來就會這樣，屬正常。確認每月現金流撐得住還款即可，不必焦慮。
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <DebtKind t="房貸為主" d="有擔保、利率低，剛買房前幾年偏高屬正常。確認每月還款撐得住就好。" />
        <DebtKind t="信貸、卡債為主" d="沒擔保、利率高。先還清，再談投資。" hot />
        <DebtKind t="不論哪一種" d="身上先留 6 個月生活費當緊急預備金，遇到意外才不會被迫借錢或賣股。" />
      </div>
    </div>
  </Sheet>
);

const H04Input: Page = () => (
  <WsHands
    tag="HANDS-ON 04 · ①②"
    section="實作 04 ①② · 8 分鐘"
    title="資產總覽"
    goal="資產、負債分開填，和工具一模一樣"
    page="第 4 頁"
    shot={wsP4Input}
    map={wsP4InputMap}
    url="celadon-starship-b44b3c.netlify.app"
    qr={qrAssets}
  >
    <WsStep n="1">資產四格：寫現在的市值</WsStep>
    <WsStep n="2">負債三格：寫還沒還的本金</WsStep>
    <WsStep n="3">房貸寫餘額，不是每月付多少</WsStep>
    <WsStep n="4">七個數字依序輸入工具</WsStep>
  </WsHands>
);

const H04Result: Page = () => (
  <WsHands
    tag="HANDS-ON 04 · ③④"
    section="實作 04 ③④ · 7 分鐘"
    title="資產總覽結果"
    goal="抄回淨值，順便看負債比"
    page="第 4 頁"
    shot={wsP4Result}
    map={wsP4ResultMap}
  >
    <WsStep n="1">抄 E1 總淨值與四個小格</WsStep>
    <WsStep n="2">負債比＋工具標示的類型</WsStep>
    <WsStep n="3">預備金 C1 × 6，現金夠嗎？</WsStep>
    <WsStep n="4">對照財富階梯：第幾階？</WsStep>
  </WsHands>
);

const Risk = ({ t, d }: { t: string; d: string }) => (
  <div style={{ background: '#FBF8F2', border: `1px solid ${rule}`, padding: '36px 40px' }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, color: red }}>{t}</div>
    <div style={{ fontSize: 28, lineHeight: 1.6, color: muted, marginTop: 14 }}>{d}</div>
  </div>
);

const Risks: Page = () => (
  <Sheet section="延伸 · 風險">
    <H size={60}>退休規劃的四個隱形對手</H>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 56 }}>
      <Risk t="長壽風險" d="活得比錢久。公保年金與年金型收入是與生命等長的解方。" />
      <Risk t="通膨風險" d="錢變薄。長期資產需要有成長性，不能全放定存。" />
      <Risk t="順序風險" d="剛退休就遇大跌。退休前 5 年逐步提高保守資產。" />
      <Risk t="醫療長照" d="最難估的一項。另外準備一筆，不要跟生活費混用。" />
    </div>
  </Sheet>
);

const H05Setup: Page = () => (
  <WsHands
    tag="HANDS-ON 05 · ①"
    section="實作 05 ① · 5 分鐘"
    title="理財規劃"
    goal="打開理財試算器「理財規劃」分頁"
    page="第 5 頁"
    shot={wsP5Setup}
    map={wsP5SetupMap}
    url="toolfinance.netlify.app"
    qr={qrFinance}
  >
    <WsStep n="1">F1 ＝ C1 × 12 × 25</WsStep>
    <WsStep n="2">再抄一次 C2 − C1：投入上限</WsStep>
    <WsStep n="3">照順序填工具的五格</WsStep>
    <WsStep n="4">初始本金可留空，報酬率 5%</WsStep>
  </WsHands>
);

const H05Draft: Page = () => (
  <WsHands
    tag="HANDS-ON 05 · ②"
    section="實作 05 ② · 5 分鐘"
    title="草稿表試三次"
    goal="只改每月投入，其他都不動"
    page="第 5 頁"
    shot={wsP5Draft}
    map={wsP5DraftMap}
  >
    <WsStep n="1">每月投入先試 5,000</WsStep>
    <WsStep n="2">每試一次，寫一列結果</WsStep>
    <WsStep n="3">累積 ≥ F1 就打勾</WsStep>
    <WsStep n="4">投入不超過 C2 − C1</WsStep>
  </WsHands>
);

const EqItem = ({ code, t, hot }: { code: string; t: string; hot?: boolean }) => (
  <div style={{ flex: 1, borderTop: `6px solid ${hot ? red : 'var(--osd-accent)'}`, paddingTop: 24 }}>
    <div style={{ fontFamily: NUM, fontWeight: 400, fontSize: 96, lineHeight: 1, color: hot ? red : 'var(--osd-text)' }}>
      {code}
    </div>
    <div style={{ fontSize: 30, fontFamily: 'var(--osd-font-body)', fontWeight: 500, marginTop: 16 }}>{t}</div>
  </div>
);

const Break2: Page = () => <Break mins="5′" next="假設沒有退休金，你要存多少？（學習單第 5 頁）" />;


const HReview1: Page = () => (
  <WsHands
    tag="REVIEW · ①"
    section="總複習 ① · 4 分鐘"
    title="總複習"
    goal="翻到第 6 頁，照代號把紅框抄過來"
    page="第 6 頁"
    shot={wsP6Top}
    map={wsP6TopMap}
  >
    <WsStep n="1">薪水：A1、A2、A3</WsStep>
    <WsStep n="2">月退：B1，勾舊制或新制</WsStep>
    <WsStep n="3">收支：C2、C1、C3、D</WsStep>
    <WsStep n="4">右欄打勾，自我檢核</WsStep>
  </WsHands>
);

const HReview2: Page = () => (
  <WsHands
    tag="REVIEW · ②"
    section="總複習 ② · 5 分鐘"
    title="總複習"
    goal="看有沒有達標，再說給自己聽"
    page="第 6 頁"
    shot={wsP6Bottom}
    map={wsP6BottomMap}
  >
    <WsStep n="1">資產：E1、負債比、預備金</WsStep>
    <WsStep n="2">理財：F1、F2、F3、G1、G2</WsStep>
    <WsStep n="3">F3 ≥ F1？勾達標或寫差額</WsStep>
    <WsStep n="4">用一段話說給自己聽</WsStep>
  </WsHands>
);

// ─── Part IV：理財規劃 ──────────────────────────────────────

const SecIV: Page = () => (
  <Divider
    no="IV"
    kicker="PART FOUR · 135′–167′ · 學習單第 5–6 頁"
    title={
      <>
        把月退當備案，
        <br />
        自己<span style={{ color: goldSoft }}>存出</span>本金
      </>
    }
    sub="目標本金、每月投入、看見複利，最後總複習"
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
  <Sheet section="IV · 理財 · 複利">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 560px', gap: 60, height: '100%' }}>
      <div>
        <H size={56}>每月 5,000 元，看複利怎麼長大</H>
        <div style={{ fontSize: 26, color: muted, marginTop: 12 }}>定期定額，假設實質年報酬 5%（每月複利），僅為示意</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 70, height: 640, marginTop: 10 }}>
          <StackBar yrs="10 年" principal="60 萬" gain="18 萬" pH={60} gH={18} total="78 萬" />
          <StackBar yrs="20 年" principal="120 萬" gain="86 萬" pH={120} gH={86} total="206 萬" />
          <StackBar yrs="30 年" principal="180 萬" gain="236 萬" pH={180} gH={236} total="416 萬" />
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
            <span style={{ color: muted, fontSize: 26 }}>5% → 約 14 年翻一倍</span>
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


const CmpRow = ({ k, a, b, head }: { k: string; a: string; b: string; head?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr 1fr',
      padding: head ? '0 0 12px' : '18px 0',
      borderBottom: head ? '3px double #1E2420' : `1px solid ${rule}`,
      fontSize: head ? 24 : 29,
      color: head ? gold : 'var(--osd-text)',
    }}
  >
    <span style={{ fontWeight: head ? 400 : 700 }}>{k}</span>
    <span style={{ color: head ? gold : muted }}>{a}</span>
    <span style={{ color: head ? gold : 'var(--osd-accent)', fontWeight: head ? 400 : 700 }}>{b}</span>
  </div>
);

const IndexWhy: Page = () => (
  <Sheet section="延伸 · 買大盤">
    <Eyebrow>買大盤 ＝ 用一檔市值型指數 ETF，買下一整籃大公司</Eyebrow>
    <H size={64}>為什麼買大盤，不買個股？</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56, marginTop: 64 }}>
      <IndexCard big="股王" t="個股可能一去不回" d="宏達電曾是 1,300 元的股王，如今不到 100 元。指數會定期換掉變弱的公司，大盤自己會換血。" />
      <IndexCard big="9 成" t="專家也很難贏大盤" d="美國 15 年統計，約 9 成主動型大型股基金，績效輸給 S&P 500（SPIVA，至 2024 年底）。" />
      <IndexCard big="0 選股" t="老師沒空盯盤" d="不用研究財報、不用猜高低點；費用低、一次分散，時間留給學生和家人。" />
    </div>
    <div style={{ marginTop: 56 }}>
      <CmpRow head k="" a="買個股" b="買大盤" />
      <CmpRow k="要做的功課" a="研究財報、產業、進出場時機" b="設定扣款，一年檢視一次" />
      <CmpRow k="最壞的情況" a="押錯一家，可能大跌不回" b="跟著整體市場起伏，不會因一家歸零" />
    </div>
  </Sheet>
);


const EtfRow = ({ t, idx, ann, worst, dbl, hot }: { t: string; idx: ReactNode; ann: string; worst: string; dbl: string; hot?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '150px 1fr 190px 170px 150px',
      alignItems: 'baseline',
      padding: '24px 0',
      borderBottom: `1px solid ${rule}`,
    }}
  >
    <span style={{ fontFamily: NUM, fontSize: 50, color: hot ? red : 'var(--osd-accent)' }}>{t}</span>
    <span style={{ fontSize: 28, lineHeight: 1.35 }}>{idx}</span>
    <span style={{ fontFamily: NUM, fontSize: 52, color: red }}>{ann}</span>
    <span style={{ fontFamily: NUM, fontSize: 40 }}>{worst}</span>
    <span style={{ fontFamily: NUM, fontSize: 40, color: 'var(--osd-accent)' }}>{dbl}</span>
  </div>
);

const EtfCompare: Page = () => (
  <Sheet section="延伸 · 大盤 ETF">
    <H size={60}>台股、美股大盤，長期怎麼走？</H>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: 56, marginTop: 40 }}>
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 1fr 190px 170px 150px',
            paddingBottom: 14,
            borderBottom: `3px double #1E2420`,
            fontSize: 22,
            color: gold,
          }}
        >
          <span>ETF</span>
          <span>追蹤</span>
          <span>成立以來年化</span>
          <span>2008 海嘯</span>
          <span>幾年翻倍</span>
        </div>
        <EtfRow t="0050" idx={<>台灣市值前 50 大<br /><small style={{ fontSize: 22, color: muted }}>市值型 · 2003</small></>} ann="≈12.6%" worst="−56%" dbl="≈ 6 年" />
        <EtfRow t="VOO" idx={<>美國 S&amp;P 500<br /><small style={{ fontSize: 22, color: muted }}>市值型 · 2010（海嘯跌幅以指數計）</small></>} ann="≈15%" worst="−57%" dbl="≈ 5 年" hot />
        <EtfRow t="0056" idx={<>台灣高股息 50 檔<br /><small style={{ fontSize: 22, color: muted }}>高股息 · 2007</small></>} ann="≈8.2%" worst="−58%" dbl="≈ 9 年" />
        <div style={{ marginTop: 26, fontSize: 28, lineHeight: 1.55 }}>
          0056 配息多，但配息是從淨值裡拿出來的，長期總報酬反而較低；股災時<Mark>高股息一樣跌</Mark>。
        </div>
      </div>
      <div style={{ background: 'var(--osd-accent)', color: cream, padding: '36px 40px', alignSelf: 'start' }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.16em', color: goldSoft }}>72 法則 · 錢多久翻一倍</div>
        <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 40, lineHeight: 1.35, marginTop: 14, color: goldSoft }}>
          72 ÷ 年報酬率（%）
          <br />≈ 翻倍年數
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.7, marginTop: 20 }}>
          試算用的 5% → 72 ÷ 5 ≈ <span style={{ color: goldSoft, fontWeight: 700 }}>14 年</span>
          <br />
          30 歲 10 萬 → 44 歲 20 萬
          <br />→ 58 歲 40 萬
        </div>
        <div style={{ fontSize: 24, lineHeight: 1.6, marginTop: 18, opacity: 0.8 }}>
          過去平均 8～15%，試算只用 5%：扣掉通膨、留給波動，寧可保守。
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, fontSize: 20, color: muted }}>
      含息、原幣計。0050 依元大投信公布成立以來累積報酬（至 2025/12/31）換算；0056 成立以來總報酬約 327%（至 2026/3/31）；跌幅為 2008 金融海嘯波段高點到低點，VOO 當時未成立，以 S&amp;P 500 指數計。過去績效不代表未來，非投資建議。
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
  <Sheet section="延伸 · 定期定額">
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


const ResCell = ({ k, v, d, hot }: { k: string; v: string; d: string; hot?: boolean }) => (
  <div style={{ background: '#FBF8F2', border: `${hot ? 3 : 1}px solid ${hot ? red : rule}`, padding: '26px 30px' }}>
    <div style={{ fontSize: 26, color: muted }}>{k}</div>
    <div style={{ fontFamily: NUM, fontSize: 68, lineHeight: 1.1, marginTop: 6, color: hot ? red : 'var(--osd-text)' }}>{v}</div>
    <div style={{ fontSize: 22, color: muted, marginTop: 6 }}>{d}</div>
  </div>
);

const ToolResult: Page = () => (
  <Sheet section="IV · 理財 · 讀懂結果">
    <Eyebrow>範例：32 歲開始，每月 2 萬，實質 5%，60 歲退休</Eyebrow>
    <H size={60}>工具結果這樣讀：本金 ＋ 複利 ＝ 退休時累積</H>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 620px', gap: 56, marginTop: 64 }}>
      <div>
        <div style={{ background: 'var(--osd-accent)', color: cream, padding: '28px 36px' }}>
          <div style={{ fontSize: 26, color: goldSoft }}>退休時預估累積資產</div>
          <div style={{ fontFamily: NUM, fontSize: 110, lineHeight: 1.1 }}>約 1,460.8 萬</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 18 }}>
          <ResCell k="投入年數" v="28 年" d="退休年齡 − 目前年齡" />
          <ResCell k="本金總投入" v="672 萬" d="2 萬 × 12 × 28" />
          <ResCell k="複利貢獻" v="788.8 萬" d="時間幫你賺的" hot />
        </div>
        <div style={{ display: 'flex', height: 56, marginTop: 26 }}>
          <div style={{ width: '46%', background: 'var(--osd-accent)', color: cream, fontSize: 24, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>本金 46%</div>
          <div style={{ width: '54%', background: red, color: cream, fontSize: 24, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>複利 54%</div>
        </div>
      </div>
      <div style={{ border: `3px solid ${red}`, background: '#fff', padding: '34px 40px', alignSelf: 'start' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: red, letterSpacing: '0.06em' }}>早開始 vs 晚 10 年</div>
        <div style={{ borderTop: `3px double #1E2420`, marginTop: 18 }}>
          <LedgerRow label="現在開始（28 年）" value="1,460.8 萬" />
          <LedgerRow label="晚 10 年（18 年）" value="698.4 萬" />
          <LedgerRow label="晚 10 年少了" value="約 762 萬" strong />
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.6, marginTop: 22 }}>
          只晚 10 年，少掉的比一半還多：<Mark>複利最值錢的，是最後那幾年</Mark>。
        </div>
      </div>
    </div>
  </Sheet>
);

const H05Result: Page = () => (
  <WsHands
    tag="HANDS-ON 05 · ③"
    section="實作 05 ③ · 5 分鐘"
    title="抄下試算結果"
    goal="圈一組付得起的版本，照畫面抄"
    page="第 5 頁"
    shot={wsP5Result}
    map={wsP5ResultMap}
  >
    <WsStep n="1">F2 每月投入、F3 累積資產</WsStep>
    <WsStep n="2">投入年數、本金總投入</WsStep>
    <WsStep n="3">G1 複利貢獻</WsStep>
    <WsStep n="4">往下捲：晚 10 年少了 → G2</WsStep>
  </WsHands>
);

// ─── 延伸：買大盤 ───────────────────────────────────────────

const SecEx: Page = () => (
  <Divider
    no="EX"
    kicker="EXTRA · 167′–178′ · 學習單第 7 頁"
    title={
      <>
        不選股，
        <br />
        買下<span style={{ color: goldSoft }}>整個市場</span>
      </>
    }
    sub="為什麼買大盤、ETF 長期怎麼走、離開前的行動承諾"
  />
);

const HowStart: Page = () => (
  <Sheet section="延伸 · 開始">
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
  <Sheet section="延伸 · 常見問題" dark>
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
  <Sheet section="結語 · 今天的一句話">
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

const HAction: Page = () => (
  <WsHands
    tag="EXTRA"
    section="延伸 · 行動承諾 · 3 分鐘"
    title="行動承諾"
    goal="寫在第 7 頁最下面，簽名＋日期"
    page="第 7 頁"
    shot={wsP7Action}
    map={wsP7ActionMap}
  >
    <WsStep n="1">今晚：拍照存檔、確認預備金</WsStep>
    <WsStep n="2">這個月：開戶、設定扣款日</WsStep>
    <WsStep n="3">今年：查年資與專戶</WsStep>
    <WsStep n="4">明年今天，再打開一次</WsStep>
  </WsHands>
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
  '【0′–1′】自我介紹 1 分鐘。強調：今天不賣商品、不報明牌，是陪大家把自己的數字算出來。發學習單、確認手機可上網。',
  // Opening
  '【1′–4′】翻開學習單封面，在「憑感覺」寫下直覺數字，不討論、不分享；「有根據」先空著，第二關算完 C1 再回來填。順便說明：紅框是要寫數字的地方，空心小框是引用前面寫過的數字。',
  // BigAnxiety
  '【4′–6′】工具使用次數來自自己開發的試算工具後台統計。帶出：焦慮很普遍，缺的是陪算的人。',
  // Agenda
  '【6′–8′】四關加延伸，對應學習單封面到第 7 頁；每一關都是「先講觀念，再翻學習單動手填」。',
  // ToolChain
  '【8′–10′】五個工具前後串接，每個工具的結果抄進學習單對應字母。每頁右上角都有該頁工具的 QR Code。',
  // Ground
  '【10′–12′】三個約定，特別是第一條：小組只談方法不談金額，讓大家安心。',
  // SecI
  '【12′】進入第一關（學習單第 2 頁）。先用觀念看懂制度，再動手算。',
  // Timeline
  '【12′–15′】五個時間點。請老師在心裡定位自己哪一年初任：84 年前恩給制、84/7/1 後退撫基金制、112/7/1 後個人專戶制。最後一點：替代率已停在 112 年水準，但釋憲仍在審理。',
  // ThreeLayers
  '【15′–17′】三層架構：公保是樓地板、退撫是主體、第三層自己補。今天的第四關就是第三層。',
  // OldNew
  '【17′–20′】請舉手：112/7/1 以後初任的有幾位？新制老師等一下有專屬說明，學習單第 2 頁的 B1 也有新制欄位。',
  // EarlyLeave
  '【20′–23′】年輕老師最常問「如果我不教了，錢拿得回來嗎？」新制前 10 年離開，政府提撥部分會打折。細節（申請期限、是否可暫不領取）請洽人事室。',
  // NewSystem
  '【23′–25′】新制重點：強制提撥 15%、可自願增提、時間是最大槓桿。舊制老師可轉告年輕同事。',
  // Formula
  '【25′–27′】舊制月退上限公式。強調分母是本俸 × 2，不是實領；本俸 × 2 通常比實領還高。',
  // RateTable
  '【27′–29′】114 年 12 月修法：113 年起不再調降，不論何時退休都用 112 年度上限（35 年為 69%）；原訂 118 年要砍到 60%。行政院、考試院已聲請釋憲，提醒關注判決。',
  // RateLookup
  '【29′–32′】帶大家查一次表：年資＝預計退休年齡－初任年齡，找到那一格就是替代率，每多 1 年 +1.5%。請老師用自己的年資查一次，記在心裡就好。月退需年資滿 15 年；超過 35 年每年再 +0.5%，最多算到 40 年。',
  // Example
  '【32′–34′】和學習單範例是同一位示範老師：學士、25 歲初任、60 歲退休、年資 35 年。本俸依 114 年待遇表（薪點 625 為 54,160）。54,160 × 2 × 69% ＝ 74,741，這是法定上限，實際以退休金試算工具為準。',
  // H01Salary
  '【34′–44′】實作 01（學習單第 2 頁上半）。先掃 QR Code 並加入書籤；新制老師自願提繳先設 0%。A1 現在的我、A2 年功薪到頂的我，A3 ＝ A2 − A1。右邊藍字是示範老師的填法；不知道薪級的老師看薪資單。',
  // H02Pension
  '【44′–59′】實作 02（第 2 頁下半，約 15 分鐘）。舊制、新制擇一：舊制填月退與公保一次給付；新制填專戶月領（預設領 30 年、自提 0%、實質報酬 3%）＋公保年金。提醒 121 年過渡期後 58 歲起支，提前 1 年少 4%、最多提早 5 年少 20%。最後 3 分鐘小組討論「影響最大的變數」。',
  // Break1
  '【60′–70′】休息 10 分鐘。',
  // SecII
  '【70′】進入第二關（學習單第 3 頁）：先不談退休，先把「現在」算清楚。',
  // TwoWays
  '【70′–73′】兩把尺：所得替代法（月收入 × 70–80%）當參考；今天主要用現況支出法，直接拿現在的月均支出當退休後月支出。',
  // Adjust
  '【73′–76′】為什麼可以直接用現在的支出：房貸、子女教育可能消失，但醫療、旅遊、長照會增加，一來一往。',
  // Inflation
  '【76′–79′】全部用今天的錢算；通膨從報酬率扣掉，所以第四關用實質報酬 5%。',
  // H03Input
  '【79′–91′】實作 03 ①②（學習單第 3 頁上半，約 12 分鐘）。收入 ⓐⓑⓒ、支出三層 ⓓⓔⓕ：左邊小格打草稿，右邊合計照順序輸入工具。黃色標「整年」的填一整年總額，工具會自動分攤到每月。沒記帳就看薪資單、信用卡帳單估整數。',
  // H03Result
  '【91′–99′】實作 03 ③（第 3 頁下半）。抄回 C1 月均支出、C2 月均收入、C3 儲蓄率；參考所得替代法 C2 × 0.7。翻回第 2 頁抄 B1，算 D ＝ B1 − C1。最後翻回封面，把 C1 填進「有根據」，和開場的憑感覺比一比。',
  // Gap
  '【99′–103′】解讀餘裕 D：大於 0 代表月退就夠生活；小於 0 代表差額要自己補。強調：不論正負，第四關都把月退當備案。可請 1–2 位分享 D 是正是負（不說金額）。',
  // SecIII
  '【105′】進入第三關（學習單第 4 頁）：理財之前先盤點。',
  // NetWorth
  '【105′–107′】範例帳本：總淨值 470 萬，但房子占掉大部分，不含房子的淨資產才是動得了的錢。存款裡先留 6 個月生活費當緊急預備金。',
  // DebtRatio
  '【107′–109′】負債比＝總負債 ÷ 總資產。唸出工具範例（78%、房貸為主）的說明：剛買房前幾年偏高屬正常，看現金流撐不撐得住。信貸、卡債為主則先還清再投資。',
  // WealthLadder
  '【109′–111′】《財富階梯》（尼克．馬朱利）：用淨資產分六階（第 5、6 階合併呈現），每階功課不同。請老師先猜自己在第幾階，填完實作 04 再對照。台幣以約 30 元換算。',
  // LadderRules
  '【111′–113′】三原則：用淨資產衡量、萬分之一法則、量力而行。學習單第 4 頁最下面有萬分之一的計算格。',
  // H04Input
  '【113′–121′】實作 04 ①②（學習單第 4 頁上半）。資產 4 格寫現在市值、負債 3 格寫還沒還的本金（房貸寫餘額，不是月付），順序和工具一模一樣。',
  // H04Result
  '【121′–128′】實作 04 ③④（第 4 頁下半）。抄回 E1 總淨值與四個小格，記下負債比與工具標示的類型；用 C1 × 6 檢查緊急預備金夠不夠；最後對照財富階梯：我在第幾階？',
  // Break2
  '【130′–135′】休息 5 分鐘。',
  // SecIV
  '【135′】進入第四關（學習單第 5–6 頁）：假設沒有退休金，把月退當備案。再次聲明：觀念分享，非投資建議。',
  // Rule4
  '【135′–137′】4% 法則：目標本金＝現在月支出 × 12 × 25。範例月支出 4 萬 → 1,200 萬。',
  // Compound
  '【137′–139′】從零存到 1,200 萬（實質 5%）：30 年每月約 1.4 萬，10 年要 7.7 萬，差 5 倍以上。重點是時間。',
  // CompoundPower
  '【139′–141′】先讓大家猜每月 5,000、30 年後有多少，再揭曉 416 萬：本金 180 萬，其餘 236 萬是複利。帶 72 法則：5% 約 14 年翻一倍。',
  // H05Setup
  '【141′–146′】實作 05 ①（學習單第 5 頁上半）。先算 F1 ＝ C1 × 12 × 25，再抄一次 C2 − C1（每月投入的上限）。打開理財試算器「理財規劃」分頁，照順序填五格：目前年齡、預計退休年齡、初始本金（可留空）、每月投入、報酬率 5%。',
  // H05Draft
  '【146′–151′】實作 05 ②（第 5 頁中間的草稿表）。每月投入先試 5,000，其他不動、只改每月投入，每試一次寫一列。累積達到 F1 就打勾，但每月投入不要超過 C2 − C1。',
  // ToolResult
  '【151′–153′】用工具範例讀結果：每月 2 萬、28 年、5% → 1,460.8 萬＝本金 672 萬＋複利 788.8 萬；晚 10 年開始只剩約 698 萬，少了約 762 萬。',
  // H05Result
  '【153′–158′】實作 05 ③（第 5 頁下半）。圈一組付得起的版本，照結果畫面抄 F2、F3、投入年數、本金總投入、G1，再往下捲讀 G2。請一兩位分享「晚 10 年」的感受。',
  // HReview1
  '【158′–162′】總複習 ①（學習單第 6 頁上半）。照代號把前面的紅框抄過來：薪水 A、月退 B、每月收支 C 與 D，右欄打勾自我檢核。',
  // HReview2
  '【162′–167′】總複習 ②（第 6 頁下半）。資產 E、理財 F／G 抄完後，看 F3 是否 ≥ F1；最後用一段話說給自己聽。沒達標的三個槓桿：每月多投入、晚幾年退休、讓月退補上。',
  // SecEx
  '【167′】延伸（學習單第 7 頁）：怎麼開始投資。再次聲明：非投資建議。',
  // IndexWhy
  '【167′–169′】為什麼買大盤不買個股：個股可能一去不回（宏達電）、專家也很難贏大盤（SPIVA 美國 15 年約 9 成輸給 S&P 500）、老師沒空盯盤。不推薦特定商品。',
  // EtfCompare
  '【169′–171′】0050、VOO 長期年化約 12～15%，0056 約 8%；2008 海嘯三者都跌了五成以上，高股息沒有比較抗跌。用 72 法則換算翻倍年數（學習單第 7 頁表格最後一欄），說明為什麼試算只用 5%。上課前請更新最新數據。',
  // DCA
  '【171′–172′】請老師先心算：價格跌到 60 又回 100，到底賺還賠？再揭曉 +23%。',
  // HowStart
  '【172′–173′】四步驟，強調先有預備金。一檔大盤就夠。',
  // Myths
  '【173′–174′】三個常見問題，可開放 1 題現場提問。',
  // Risks
  '【174′】四個風險快速帶過，時間不夠可略過。',
  // HAction
  '【174′–177′】行動承諾寫在學習單第 7 頁最下面：今晚、這個月、今年各一件事，簽名＋日期。',
  // Summary
  '【177′–178′】三句話收束。',
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
  Timeline,
  ThreeLayers,
  OldNew,
  EarlyLeave,
  NewSystem,
  Formula,
  RateTable,
  RateLookup,
  Example,
  H01Salary,
  H02Pension,
  Break1,
  SecII,
  TwoWays,
  Adjust,
  Inflation,
  H03Input,
  H03Result,
  Gap,
  SecIII,
  NetWorth,
  DebtRatio,
  WealthLadder,
  LadderRules,
  H04Input,
  H04Result,
  Break2,
  SecIV,
  Rule4,
  Compound,
  CompoundPower,
  H05Setup,
  H05Draft,
  ToolResult,
  H05Result,
  HReview1,
  HReview2,
  SecEx,
  IndexWhy,
  EtfCompare,
  DCA,
  HowStart,
  Myths,
  Risks,
  HAction,
  Summary,
  Closing,
] satisfies Page[];
