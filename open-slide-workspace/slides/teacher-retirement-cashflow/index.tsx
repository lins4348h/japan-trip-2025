import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import qrSalary from './assets/qr-salary.svg';
import qrPension from './assets/qr-pension.svg';
import qrBudget from './assets/qr-budget.svg';
import qrFinance from './assets/qr-finance.svg';
import qrAssets from './assets/qr-assets.svg';

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
  <Sheet section="開場 · 暖身">
    <Eyebrow>QUESTION 00 · 寫在學習單封面，先不要跟隔壁討論</Eyebrow>
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
      <AgendaRow time="75–120′" code="II" title="看清現況" desc="現在每月花多少、存多少" hands="實作 03" />
      <AgendaRow time="120–140′" code="III" title="盤點資產" desc="我已經有多少本金" hands="實作 04" />
      <AgendaRow time="145–175′" code="IV" title="理財" desc="目標本金、定期定額、複利" hands="實作 05 · 06" />
    </div>
    <div style={{ marginTop: 28, fontSize: 24, color: muted }}>中場休息兩次：65′ 與 140′，各 5–10 分鐘｜175′ 起 Q&A 與行動承諾</div>
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
      <ToolCard n="04" name="資產總覽" q="我已經有多少本金？" out="E 目前本金" />
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
    <H size={60}>所得替代率上限：113 年起停在 112 年水準</H>
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
      <RateRow y="107 年（年改起點）" c={['45.0%', '52.5%', '60.0%', '67.5%', '75.0%']} />
      <RateRow y="現行：112 年度" c={['39.0%', '46.5%', '54.0%', '61.5%', '69.0%']} hot />
      <RateRow y="原訂 118 年後" c={['30.0%', '37.5%', '45.0%', '52.5%', '60.0%']} gone />
    </div>
    <div style={{ marginTop: 28, fontSize: 24, color: muted }}>
      114 年 12 月立法院三讀停止調降，不論何時退休皆以 112 年度上限計；行政院、考試院已聲請釋憲，最終以憲法法庭判決及主管機關公告為準。
    </div>
  </Sheet>
);

// ─── 11 大數字：75 → 60 ─────────────────────────────────────

const Drop: Page = () => (
  <Sheet section="I · 制度 · 法規">
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 60 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: muted }}>年資 35 年 · 年改前</div>
        <div style={{ fontFamily: NUM, fontSize: 260, lineHeight: 1, color: muted, marginTop: 12 }}>75%</div>
      </div>
      <div style={{ fontFamily: NUM, fontSize: 120, color: goldSoft }}>→</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: muted }}>年資 35 年 · 現行上限</div>
        <div style={{ fontFamily: NUM, fontSize: 260, lineHeight: 1, color: red, marginTop: 12 }}>69%</div>
      </div>
      <div style={{ flex: 1, borderLeft: `1px solid ${rule}`, paddingLeft: 56 }}>
        <H size={46}>
          原訂砍到 60%，
          <br />
          修法後
          <br />
          <span style={{ color: red }}>停在 69%</span>。
        </H>
        <Lead>制度會變，自己的準備不會變。替代率是天花板，不是你的生活費。</Lead>
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
          年資 35 年・現行上限
        </H>
        <Lead>
          法定天花板約 7.3 萬。
          <br />
          公式的分母（10.6 萬）比她的實領還高，
          <br />
          換算成實領，<Mark>真實替代率</Mark>其實超過 69%。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="本俸（薪點 650）" value="53,075" />
        <LedgerRow label="× 2" note="本俸加一倍" value="106,150" />
        <LedgerRow label="× 替代率" note="35 年 · 112 年度上限" value="69%" />
        <LedgerRow label="月退上限" value="73,244" strong />
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
  qr,
  children,
}: {
  no: string;
  mins: string;
  tool: string;
  url: string;
  goal: string;
  fields: ReactNode;
  qr: string;
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: cream, color: '#1E2420', padding: 16 }}>
        <img src={qr} alt={url} style={{ width: 170, height: 170, display: 'block' }} />
        <div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>手機掃描開啟</div>
          <div style={{ fontSize: 22, color: muted, marginTop: 8 }}>先加入書籤，等等還會用到</div>
        </div>
      </div>
      <div
        style={{
          background: cream,
          color: '#1E2420',
          padding: '32px 36px',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: gold, letterSpacing: '0.08em' }}>寫進學習單的紅框</div>
        {fields}
      </div>
      </div>
    </div>
  </Sheet>
);

const Field = ({ code, label, hint }: { code: string; label: string; hint?: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'stretch',
      border: `3px solid ${red}`,
      borderRadius: 6,
      background: '#fff',
      marginTop: 18,
      overflow: 'hidden',
    }}
  >
    <span
      style={{
        background: red,
        color: '#fff',
        fontFamily: NUM,
        fontSize: 40,
        width: 84,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {code}
    </span>
    <span style={{ padding: '14px 20px' }}>
      <span style={{ display: 'block', fontSize: 28, fontWeight: 500, lineHeight: 1.35 }}>{label}</span>
      {hint && <span style={{ display: 'block', fontSize: 21, color: muted, marginTop: 4 }}>{hint}</span>}
    </span>
  </div>
);

const Hands01: Page = () => (
  <Workshop
    no="01"
    mins="10 分鐘"
    tool="薪資試算"
    url="teacher-salary-calculator.netlify.app"
    qr={qrSalary}
    goal="先知道「現在」與「到頂」：你的年薪會長到哪裡"
    fields={
      <>
        <Field code="A1" label="目前年薪" hint="薪級、每月實領、今年幾歲" />
        <Field code="A2" label="到頂時年薪" hint="年功薪上限：學士 625／碩士 650" />
        <Field code="A3" label="年薪成長空間 ＝ A2 − A1" />
      </>
    }
  >
    <StepRow n="1">選學歷、輸入目前薪級（新制自願提繳先設 0%）</StepRow>
    <StepRow n="2">記下每月實領與目前年薪，寫進 A1</StepRow>
    <StepRow n="3">把薪級調到年功薪上限，記下到頂年薪與年齡</StepRow>
    <StepRow n="4">A2 − A1：未來還有多少成長空間？</StepRow>
  </Workshop>
);

const Hands02: Page = () => (
  <Workshop
    no="02"
    mins="15 分鐘"
    tool="退休金試算"
    url="pension-calculation.netlify.app"
    qr={qrPension}
    goal="再看「制度會給多少」：舊制、新制擇一填寫"
    fields={
      <>
        <Field code="B1" label="舊制：月退（退撫＋公保）" hint="另記公保一次給付金額" />
        <Field code="B1" label="新制：專戶＋公保年金" hint="自提 0%、實質報酬 3%、專戶領 30 年" />
      </>
    }
  >
    <StepRow n="1">輸入預計退休年齡（121 年後 58 歲起領，提前 1 年少 4%）</StepRow>
    <StepRow n="2">舊制：記下每月月退與公保一次給付</StepRow>
    <StepRow n="3">新制：記下專戶每月可領＋公保年金</StepRow>
    <StepRow n="4">小組只討論：「哪個變數影響最大？」</StepRow>
  </Workshop>
);

// ─── 真實替代率 ──────────────────────────────────────────────

const RealRate: Page = () => (
  <Sheet section="I · 制度 · 實作回饋">
    <H size={64}>法定 69%，換算實領可能超過九成</H>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 80, marginTop: 40, height: 620 }}>
      <Bar label="本俸 × 2" note="公式的分母" h={340} v="136" color={muted} />
      <Bar label="每月實領" note="以 100 計" h={250} v="100" color="var(--osd-accent)" />
      <Bar label="月退上限" note="月退 ÷ 每月實領" h={235} v="≈94" color={red} />
      <div style={{ flex: 1, alignSelf: 'center', paddingLeft: 30, borderLeft: `1px solid ${rule}` }}>
        <div style={{ fontSize: 32, lineHeight: 1.7 }}>
          「69%」是乘在本俸×2 上，
          <br />
          不是乘在你的實領上。
        </div>
        <div style={{ fontSize: 26, color: muted, marginTop: 20, lineHeight: 1.6 }}>
          以王老師為例、學術研究加給以約 2.5 萬估，
          <br />
          僅為示意，請用自己的 B1 ÷ 每月實領算一次。
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
        d="好算，但要先知道自己的月收入。學習單上會用 C2 × 0.7 算一次當參考。"
      />
      <Ruler
        tag="今天用這把"
        t="現況支出法"
        f="退休後月支出 ≈ 現在的月均支出 C1"
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

const Hands03: Page = () => (
  <Workshop
    no="03"
    mins="20 分鐘"
    tool="每月收支體檢"
    url="grand-clafoutis-b1948b.netlify.app"
    qr={qrBudget}
    goal="紙上算六個合計 → 輸入工具 → 抄回紅框"
    fields={
      <>
        <Field code="C1" label="月均支出" hint="工具計算結果" />
        <Field code="C2" label="月均收入" hint="獎金與配息已自動分攤" />
        <Field code="C3" label="儲蓄率" hint="（收入 − 支出）÷ 收入" />
      </>
    }
  >
    <StepRow n="1">收入：每月固定、穩定額外、獎金與配息（整年）</StepRow>
    <StepRow n="2">支出三層：固定、半固定、一次性（整年）</StepRow>
    <StepRow n="3">六個合計依序輸入工具，順序和學習單一樣</StepRow>
    <StepRow n="4">抄回月均支出、月均收入、儲蓄率</StepRow>
  </Workshop>
);

const AdjustCol = ({ tag, color, items }: { tag: string; color: string; items: ReactNode }) => (
  <div style={{ borderTop: `6px solid ${color}`, background: '#FBF8F2', padding: '32px 36px', border: `1px solid ${rule}` }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, color }}>{tag}</div>
    <div style={{ fontSize: 30, lineHeight: 1.9, marginTop: 18 }}>{items}</div>
  </div>
);

const Adjust: Page = () => (
  <Sheet section="II · 現況 · 為什麼用 C1">
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
        <LedgerRow label="投資的名目報酬（示意）" value="6%" />
        <LedgerRow label="− 每年通膨" value="2%" />
        <LedgerRow label="＝ 實質報酬" note="Part IV 用這個算" value="4%" strong />
        <div style={{ fontSize: 26, color: muted, marginTop: 24, lineHeight: 1.6 }}>
          為什麼要扣？今天的 5 萬，20 年後要約 7.4 萬才買得到一樣的生活。
        </div>
      </div>
    </div>
  </Sheet>
);

// 缺口公式
const Gap: Page = () => (
  <Sheet section="II · 現況 · 餘裕">
    <Eyebrow>今天最重要的一個數字</Eyebrow>
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
      <GapBox code="D" t="每月餘裕" hot />
      <span style={{ fontSize: 80, color: gold }}>＝</span>
      <GapBox code="B1" t="月退（制度給的）" />
      <span style={{ fontSize: 80, color: gold }}>−</span>
      <GapBox code="C1" t="月均支出" />
    </div>
    <Lead style={{ marginTop: 56 }}>
      D 大於 0：月退就夠生活，有餘裕。D 小於 0：差額要靠自己準備。
      <br />
      但不論正負，接下來都<Mark>把月退當備案</Mark>，自己存出一份本金。
    </Lead>
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
    kicker="PART THREE · 120′–140′"
    title={
      <>
        理財之前，
        <br />
        先<span style={{ color: goldSoft }}>盤點</span>你有的
      </>
    }
    sub="資產、負債、淨值，找出你的起點本金"
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
        <LedgerRow label="月均支出 C1" value="40,000" />
        <LedgerRow label="× 12 個月" value="480,000" />
        <LedgerRow label="× 25" note="4% 法則" value="12,000,000" />
        <LedgerRow label="目標本金 F1" value="1,200 萬" strong />
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
    <H size={60}>還差 1,000 萬，越早開始越便宜</H>
    <div style={{ fontSize: 28, color: muted, marginTop: 14 }}>F1 1,200 萬 − 已有本金 E2 約 200 萬；實質報酬 4%、每月複利，僅為示意（未計已有本金的成長）</div>
    <div style={{ marginTop: 56, borderTop: `3px double #1E2420` }}>
      <TimeBar yrs="還有 30 年" monthly="每月 14,410" w={191} />
      <TimeBar yrs="還有 20 年" monthly="每月 27,270" w={361} />
      <TimeBar yrs="還有 10 年" monthly="每月 67,910" w={900} hot />
    </div>
    <div style={{ marginTop: 48, fontSize: 34 }}>
      晚 20 年開始，每月要付將近 <Mark>5 倍</Mark>。複利不是魔法，是時間的租金。
    </div>
  </Sheet>
);


const NetWorth: Page = () => (
  <Sheet section="III · 盤點 · 起點本金">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 820px', gap: 90, height: '100%' }}>
      <div>
        <Eyebrow>淨值 ≠ 可以拿去理財的錢</Eyebrow>
        <H size={60}>
          房子不能拿來
          <br />
          定期定額
        </H>
        <Lead>
          自住房算資產，但不會生出現金流；
          <br />
          存款也要先留 6 個月生活費當緊急預備金。
          <br />
          剩下的，才是第四關的<Mark>起點本金 E2</Mark>。
        </Lead>
      </div>
      <div style={{ alignSelf: 'center', borderTop: `3px double #1E2420` }}>
        <LedgerRow label="存款＋股票 ETF＋保單解約金" value="170 萬" />
        <LedgerRow label="自住房（市值）" value="800 萬" />
        <LedgerRow label="− 房貸、車貸" value="500 萬" />
        <LedgerRow label="淨值 E1" value="470 萬" />
        <LedgerRow label="− 緊急預備金" note="4 萬 × 6 個月" value="24 萬" />
        <LedgerRow label="可投入本金 E2" value="146 萬" strong />
      </div>
    </div>
  </Sheet>
);

const Hands04: Page = () => (
  <Workshop
    no="04"
    mins="12 分鐘"
    tool="資產總覽"
    url="celadon-starship-b44b3c.netlify.app"
    qr={qrAssets}
    goal="紙上列資產負債 → 輸入工具 → 抄回紅框"
    fields={
      <>
        <Field code="E1" label="淨值 ＝ 資產 − 負債" hint="工具計算結果" />
        <Field code="E2" label="可投入理財的本金" hint="現金＋投資 − 預備金 − 卡債" />
      </>
    }
  >
    <StepRow n="1">資產：現金存款、股票 ETF 基金、其他投資、房屋現值</StepRow>
    <StepRow n="2">負債：房貸餘額、一般貸款、卡債／高利借款</StepRow>
    <StepRow n="3">輸入工具，看淨值與資產結構</StepRow>
    <StepRow n="4">扣掉緊急預備金與卡債，算出起點 E2</StepRow>
  </Workshop>
);

const Risk = ({ t, d }: { t: string; d: string }) => (
  <div style={{ background: '#FBF8F2', border: `1px solid ${rule}`, padding: '36px 40px' }}>
    <div style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: 44, color: red }}>{t}</div>
    <div style={{ fontSize: 28, lineHeight: 1.6, color: muted, marginTop: 14 }}>{d}</div>
  </div>
);

const Risks: Page = () => (
  <Sheet section="IV · 理財 · 風險">
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
    tool="理財試算器"
    url="toolfinance.netlify.app"
    qr={qrFinance}
    goal="假設沒有退休金：目標多少、每月存多少"
    fields={
      <>
        <Field code="F1" label="目標本金 ＝ C1 × 12 × 25" />
        <Field code="F2" label="還差多少 ＝ F1 − E2" />
        <Field code="F3" label="我決定的每月投入" hint="主算 4%，不超過每月能存下的錢" />
      </>
    }
  >
    <StepRow n="1">用第二關的 C1 算出目標本金 F1</StepRow>
    <StepRow n="2">扣掉第三關已有的本金 E2，得到 F2</StepRow>
    <StepRow n="3">試算器輸入目標、年數、報酬率 4%（或用速查表）</StepRow>
    <StepRow n="4">再試 6%、延後退休 3 年，圈出付得起的版本</StepRow>
  </Workshop>
);

const Equation: Page = () => (
  <Sheet section="IV · 小結">
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
      <EqItem code="E2" t="已有的本金" />
      <span style={{ color: gold }}>＋</span>
      <EqItem code="F3" t="每月投入 × 時間 × 複利" />
      <span style={{ color: gold }}>→</span>
      <EqItem code="F1" t="目標本金（C1 × 12 × 25）" hot />
    </div>
    <Lead style={{ marginTop: 100, fontSize: 36 }}>
      月退 B1 是備案。翻回學習單封面，把開場的「憑感覺」數字和 C1 放在一起看，差多少？
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

const Break2: Page = () => <Break mins="5′" next="假設沒有退休金，你要存多少？" />;

// ─── Part IV：簡單投資入門 ──────────────────────────────────

const SecIV: Page = () => (
  <Divider
    no="IV"
    kicker="PART FOUR · 145′–175′"
    title={
      <>
        把月退當備案，
        <br />
        自己<span style={{ color: goldSoft }}>存出</span>本金
      </>
    }
    sub="目標本金、定期定額、買大盤、看見複利"
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
    qr={qrFinance}
    goal="用名目 6% 看複利長相（這是未來的錢，不必跟 F1 比）"
    fields={
      <>
        <Field code="G1" label="我的每月定期定額" hint="先用 F3；已有本金 E2 可當起始金額" />
        <Field code="G2" label="30 年後，終值是本金的幾倍？" />
        <Field code="G3" label="晚 5 年開始，少了多少？" hint="30 年終值 − 25 年終值" />
      </>
    }
  >
    <StepRow n="1">選「定期定額」試算，輸入 G1、報酬率 6%</StepRow>
    <StepRow n="2">年數分別填 10、20、30，抄下終值</StepRow>
    <StepRow n="3">再算一次 25 年（＝晚 5 年開始）</StepRow>
    <StepRow n="4">算出 G2、G3，感受時間的價格</StepRow>
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
  '【2′–6′】請大家直接寫在學習單封面「憑感覺」欄。不討論、不分享，Part III 結尾再回來對照。',
  // BigAnxiety
  '【6′–8′】工具使用次數來自自己開發的試算工具後台統計。帶出：焦慮很普遍，缺的是陪算的人。',
  // Agenda
  '【8′–10′】快速帶過四段，強調每段都有動手實作，實作數字最後會串成一個答案。',
  // ToolChain
  '【10′–13′】發下學習單，對照 A→F 欄位。請大家先把五個網址加到書籤（學習單封面有網址）。',
  // Ground
  '【13′–15′】三個約定，特別是第一條：小組只談方法不談金額，讓大家安心。',
  // SecI
  '【15′】進入 Part I。先用 3 分鐘看全貌，再算自己的數字。',
  // Timeline
  '【15′–18′】五個時間點。請老師在心裡定位：我是哪一年初任？84 年前年資是恩給制，84/7/1 後是退撫基金制，112/7/1 後初任是個人專戶制。最後一點強調：替代率已停在 112 年水準，但釋憲仍在審理。',
  // ThreeLayers
  '【18′–21′】三層架構：公保年金是樓地板、退撫是主體、第三層自己補。今天重點在第三層，但要先看清前兩層。',
  // OldNew
  '【21′–24′】請舉手：112/7/1 以後初任的有幾位？新制老師後面有專屬頁。舊制老師重點在替代率表。',
  // EarlyLeave
  '【24′–27′】年輕老師最常問「如果我不教了，錢拿得回來嗎？」新制前 10 年離開，政府提撥部分會打折，要算清楚。細節（申請期限、是否可暫不領取）請洽人事室。',
  // Formula
  '【27′–29′】強調分母是本俸×2，不是實領；本俸×2 通常比實領高。',
  // RateTable
  '【29′–32′】114 年 12 月修法：113 年起不再調降，不論何時退休都用 112 年度上限（35 年為 69%）。行政院、考試院已聲請釋憲，提醒老師關注後續判決。',
  // Drop
  '【32′–34′】原訂砍到 60%，修法後停在 69%。重點不是百分比，而是：替代率是天花板，生活費要看自己的支出。',
  // Example
  '【34′–36′】虛構案例示範計算：106,150 × 69% ＝ 73,244。本俸數字以工具內最新俸額表為準。',
  // Hands01
  '【36′–46′】實作 01。請大家先掃 QR Code 並加入書籤。新制老師自願提繳先設 0%。A1 目前年薪、A2 到頂年薪，A3 ＝ A2 − A1。不知道薪級的老師可看薪資單。',
  // Hands02
  '【46′–60′】實作 02（約 15 分鐘）。提醒：月退起支年齡逐年提高，121 年過渡期後為 58 歲，提前 1 年少 4%、最多提早 5 年少 20%。舊制填月退＋公保一次給付；新制填專戶（預設領 30 年，自提 0%、實質報酬 3%）＋公保年金。最後 3 分鐘小組討論「影響最大的變數」。',
  // RealRate
  '【60′–63′】回收 B3：多數舊制老師的真實替代率會高於法定替代率（範例約 94%）。接著轉折：替代率高不代表夠用，要看退休後支出，帶入 Part II。請 2–3 位老師分享 B3 區間（不說金額）。',
  // NewSystem
  '【63′–65′】新制老師重點：自願增提與專戶投資選擇。舊制老師可轉告年輕同事。',
  // Break1
  '【65′–75′】休息 10 分鐘。',
  // SecII
  '【75′】進入 Part II。先不談退休，先把「現在」算清楚。',
  // TwoWays
  '【75′–78′】兩把尺：所得替代法（月收入 × 70–80%）當參考；今天主要用現況支出法，直接拿現在的月均支出 C1 當退休後月支出。',
  // Hands03
  '【78′–98′】實作 03（20 分鐘）。學習單草稿順序與工具一致：收入 ⓐ 每月固定收入、ⓑ 穩定的額外收入、ⓒ 獎金與配息（整年）；支出三層 ⓓ 固定、ⓔ 半固定、ⓕ 一次性（整年）。六個合計輸入工具，抄回 C1 月均支出、C2 月均收入、C3 儲蓄率。',
  // Adjust
  '【98′–104′】解釋為什麼可以直接用 C1：房貸、車貸、子女教育可能消失，但醫療、旅遊、長照會增加，一來一往。',
  // Inflation
  '【104′–110′】全部用今天的錢算；通膨從報酬率扣掉，所以 Part IV 用實質報酬 4%。',
  // Gap
  '【110′–120′】D ＝ B1 − C1。大於 0 代表月退就夠生活；小於 0 代表要自己補。強調：不論正負，Part IV 都把月退當備案。',
  // SecIII
  '【120′】進入 Part III：理財之前先盤點。',
  // NetWorth
  '【120′–124′】區分淨值 E1 與可投入本金 E2：自住房不產生現金流，存款要先留 6 個月緊急預備金。',
  // Hands04
  '【124′–138′】實作 04（約 12 分鐘）。資產 4 項、負債 3 項，順序與工具一致 → 抄回 E1 淨值；再扣緊急預備金（C1 × 6）與卡債得到 E2。提醒看一眼資產結構。',
  // Break2
  '【140′–145′】休息 5 分鐘。',
  // SecIV
  '【145′】進入 Part IV：假設沒有退休金，把月退當備案。再次聲明：觀念分享，非投資建議。',
  // Rule4
  '【145′–148′】目標本金 F1 ＝ C1 × 12 × 25。範例月支出 4 萬 → 1,200 萬。',
  // Compound
  '【148′–150′】扣掉已有本金後還差 1,000 萬：30 年每月約 1.4 萬，10 年要 6.8 萬。重點是時間。',
  // Hands05
  '【150′–158′】實作 05。F1 → F2 ＝ F1 − E2 → 試算每月投入。F3 不要超過每月能存下的錢（C2 − C1）。試算器沒有反推功能就用學習單速查表。',
  // CompoundPower
  '【158′–160′】先讓大家猜 30 年後有多少，再揭曉 502 萬。本金 180 萬，其餘是複利。帶 72 法則。',
  // IndexWhy
  '【160′–161′】大盤＝市值型指數 ETF。可口頭舉台灣 50、S&P 500、全世界股市等指數類型，不推薦特定商品。',
  // DCA
  '【161′–163′】請老師先心算：價格跌到 60 又回 100，到底賺還賠？再揭曉 +23%。',
  // Hands06
  '【163′–170′】實作 06。用 F3 當每月定期定額、名目 6%，算 10／20／25／30 年終值，寫出 G2、G3。已有本金 E2 可當起始金額。',
  // HowStart
  '【170′–171′】四步驟，強調先有預備金。一檔大盤就夠。',
  // Myths
  '【171′–172′】三個常見問題，可開放 1 題現場提問。',
  // Risks
  '【172′–173′】四個風險快速帶過，時間不夠可略過。',
  // Equation
  '【173′–174′】回到封面收據：E2 ＋ F3 × 時間 × 複利 → F1。月退是備案。對照開場的憑感覺數字與 C1。',
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
  Timeline,
  ThreeLayers,
  OldNew,
  EarlyLeave,
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
  NetWorth,
  Hands04,
  Break2,
  SecIV,
  Rule4,
  Compound,
  Hands05,
  CompoundPower,
  IndexWhy,
  DCA,
  Hands06,
  HowStart,
  Myths,
  Risks,
  Equation,
  Summary,
  Actions,
  Closing,
] satisfies Page[];
