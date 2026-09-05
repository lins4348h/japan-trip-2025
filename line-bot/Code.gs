/**
 * 行政訊息轉譯 Bot（Google Apps Script）
 *
 * 用法：在 LINE 群組長按訊息 → 選取多則 → 轉傳給這個 Bot →
 *       輸入「整理」→ Bot 回傳學生版、簡化版、家長版，並把待辦存進試算表。
 *
 * 部署方式見 SETUP.md。
 */

// ═══════════════════════════════════════════════════════════
//  設定區（部署前填好這三個，其餘保持預設即可）
// ═══════════════════════════════════════════════════════════

/** LINE Developers → Messaging API → Channel access token（長效） */
const LINE_TOKEN = '在這裡貼上 LINE 的 Channel access token';

/** console.anthropic.com 申請的 API key */
const ANTHROPIC_KEY = '在這裡貼上 Anthropic API key';

/** 只有這個 LINE 使用者能用這個 Bot。先留空部署，傳「我是誰」給 Bot 就會告訴你 */
const OWNER_USER_ID = '';

/** 預設班級，會出現在學生版的標題 */
const DEFAULT_CLASS = '三年五班';

/**
 * 模型與思考深度。
 * 想省錢可改成 'claude-haiku-4-5'（約十分之一價格，判斷力略降）。
 * EFFORT 可調 'low' | 'medium' | 'high'，調高比較準但比較慢，
 * 太慢會超過 LINE 的回覆時限而改用推播（功能一樣，只是慢一點）。
 */
const MODEL = 'claude-opus-5';
const EFFORT = 'low';

// ═══════════════════════════════════════════════════════════
//  進入點
// ═══════════════════════════════════════════════════════════

function doPost(e) {
  const ok = ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ok;
  }

  (body.events || []).forEach(function (event) {
    try {
      handleEvent(event);
    } catch (err) {
      log('handleEvent 失敗：' + err);
      if (event.replyToken) {
        reply(event.replyToken, [text('出了點狀況：' + err + '\n\n輸入「清空」重來一次試試。')]);
      }
    }
  });

  return ok;
}

function handleEvent(event) {
  if (event.type !== 'message' || !event.message || event.message.type !== 'text') return;

  // LINE 逾時會重送同一個事件，用 eventId 擋掉重複處理
  if (isDuplicate(event.webhookEventId)) return;

  const userId = event.source && event.source.userId;
  const msg = String(event.message.text || '').trim();
  const token = event.replyToken;

  // 還沒設定擁有者：告訴我 ID 是多少
  if (!OWNER_USER_ID) {
    reply(token, [text(
      '尚未設定使用者。\n\n你的 User ID 是：\n' + userId +
      '\n\n把這串填進程式碼的 OWNER_USER_ID，重新部署後就能用了。'
    )]);
    return;
  }

  if (userId !== OWNER_USER_ID) {
    reply(token, [text('這個 Bot 目前只開放給管理者本人使用。')]);
    return;
  }

  if (msg === '我是誰') {
    reply(token, [text('你的 User ID：\n' + userId)]);
    return;
  }
  if (msg === '說明' || msg === 'help' || msg === '？' || msg === '?') {
    reply(token, [text(helpText())]);
    return;
  }
  if (msg === '整理') {
    doRelay(token);
    return;
  }
  if (msg === '待辦') {
    reply(token, [text(listTodos())]);
    return;
  }
  if (msg === '清空') {
    clearBuffer();
    reply(token, [text('暫存區已清空，可以重新轉傳訊息了。')]);
    return;
  }
  if (/^完成\s*\d+$/.test(msg)) {
    const n = parseInt(msg.replace(/[^\d]/g, ''), 10);
    reply(token, [text(completeTodo(n))]);
    return;
  }

  // 其他一律視為要整理的素材，安靜收下（不回覆，避免轉傳十則被洗版十次）
  pushBuffer(msg);
}

function helpText() {
  return [
    '【怎麼用】',
    '1. 在行政群組長按訊息，選取多則',
    '2. 轉傳給我（我會安靜收下，不會回話）',
    '3. 輸入「整理」',
    '',
    '【指令】',
    '整理　　把收到的訊息轉成三個版本',
    '待辦　　列出還沒做完的事',
    '完成 3　把第 3 項標記完成',
    '清空　　丟掉暫存區重來',
    '說明　　這張表'
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════
//  主流程：整理
// ═══════════════════════════════════════════════════════════

function doRelay(token) {
  const lines = readBuffer();
  if (!lines.length) {
    reply(token, [text('暫存區是空的。\n先把行政群組的訊息轉傳給我，再輸入「整理」。')]);
    return;
  }

  const raw = lines.join('\n');
  let data;
  try {
    data = askClaude(raw);
  } catch (err) {
    log('askClaude 失敗：' + err);
    reply(token, [text('整理失敗：' + err + '\n\n訊息還留在暫存區，可以再輸入一次「整理」重試。')]);
    return;
  }

  const stamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'M/d');
  const saved = saveTodos(data.todos || [], stamp);
  saveRecord(stamp, raw, data);
  clearBuffer();

  const messages = [
    text(summaryText(lines.length, data, saved)),
    text(data.student_post || '（沒有產出學生版）'),
    text(data.student_simple || '（沒有產出簡化版）'),
    text(data.parent_post || '（沒有產出家長版）')
  ];

  // 上面三個版本各自是獨立一則，方便長按 → 轉傳到班群
  send(token, messages);
}

function summaryText(count, data, savedCount) {
  const out = ['收到 ' + count + ' 則，整理完成。'];

  if (data.summary) out.push('\n' + data.summary);

  const todos = data.todos || [];
  if (todos.length) {
    out.push('\n【我要做的事】' + (savedCount ? '（已存 ' + savedCount + ' 筆）' : ''));
    todos.forEach(function (t) {
      out.push('・' + (t.due || '未說明') + '｜' + t.what + (t.urgency === 'high' ? '　⚠️急' : ''));
      if (t.note) out.push('　　' + t.note);
    });
  }

  const sup = data.superseded || [];
  if (sup.length) {
    out.push('\n【被後面改掉的】');
    sup.forEach(function (s) {
      out.push('・' + s.original + '\n　→ ' + s.final);
    });
  }

  const att = data.attachments || [];
  if (att.length) {
    out.push('\n【附件與連結】');
    att.forEach(function (a) {
      out.push('・' + a.name + (a.url ? '\n　' + a.url : ''));
      if (a.purpose) out.push('　' + a.purpose);
    });
  }

  out.push('\n下面三則分別是學生版、簡化版、家長版，可以直接長按轉傳。');
  return out.join('\n');
}

// ═══════════════════════════════════════════════════════════
//  呼叫 Claude
// ═══════════════════════════════════════════════════════════

function askClaude(raw) {
  const today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'M/d');
  const prompt = buildPrompt(raw, DEFAULT_CLASS, today);

  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01'
    },
    payload: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { effort: EFFORT },
      fallbacks: 'default',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const code = res.getResponseCode();
  const bodyText = res.getContentText();
  if (code !== 200) {
    throw new Error('API 回應 ' + code + '：' + bodyText.slice(0, 300));
  }

  const body = JSON.parse(bodyText);

  if (body.stop_reason === 'refusal') {
    throw new Error('這批訊息被安全機制擋下了，請確認內容後再試。');
  }

  const blocks = body.content || [];
  let answer = '';
  blocks.forEach(function (b) {
    if (b.type === 'text') answer += b.text;
  });

  return parseJson(answer);
}

/** Claude 偶爾會用 ``` 包住 JSON，或前後多幾句話，這裡容錯處理 */
function parseJson(s) {
  let t = String(s || '').trim();

  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();

  try {
    return JSON.parse(t);
  } catch (e) {}

  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end > start) {
    return JSON.parse(t.slice(start, end + 1));
  }

  throw new Error('看不懂回傳的格式');
}

function buildPrompt(raw, klass, today) {
  return [
    '你是高中導師的行政訊息整理助手。下面是從 LINE 行政群組轉傳過來的訊息，順序可能混亂、夾雜閒聊，也可能缺少發言者名稱。',
    '班級：' + klass + '　今天：' + today,
    '',
    '判斷原則：',
    '1. 版本覆蓋：若後面的訊息更正或取消前面的內容（改時間、改地點、改截止日，或出現「更正」「改成」「取消」「補充」），只採用最終版，並把被改掉的舊版列入 superseded。',
    '2. 分流：需要導師本人動作的（收件、造冊、回報、上系統、簽核）放 todos；只需轉達的寫進布達文字；閒聊、抱怨、已被回答的提問放 ignored。',
    '3. 不編造：訊息沒說的截止日、地點、金額、攜帶物，一律寫「未說明」，絕對不要推測補齊。若連發言者都看不出來，from 就寫「未註明」。',
    '4. 附件與連結：把檔名與網址抽出成 attachments，寫清楚「這是什麼、要誰做什麼」，網址原樣保留。',
    '5. student_post：分項編號，時間／地點／攜帶／範圍／截止各自分行，句子短，去掉行政術語與只有導師才要做的事。開頭寫「【' + klass + ' 聯絡事項 ' + today + '】」。',
    '6. student_simple：給閱讀理解較弱或特教學生。每句不超過 25 字，一句只講一件事，順序為「什麼時候→要做什麼→要帶什麼→沒做會怎樣」，主動語態，不用成語、不用被動句、不用括號註解，結尾加一句鼓勵孩子來問老師的話。',
    '7. parent_post：語氣客氣，只聚焦需要家長配合的事（簽名、繳費、回條、健康狀況），附上截止日與後果。',
    '8. 全部使用繁體中文與台灣用語。',
    '',
    '只輸出 JSON，不要任何說明文字、不要 markdown 圍籬：',
    '{"summary":"一句話總結","todos":[{"what":"","from":"","due":"","urgency":"high|normal","note":""}],"superseded":[{"original":"","final":"","why":""}],"attachments":[{"kind":"file|link","name":"","url":"","purpose":""}],"ignored":["..."],"student_post":"","student_simple":"","parent_post":""}',
    '',
    '===== 訊息開始 =====',
    raw,
    '===== 訊息結束 ====='
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════
//  試算表：暫存區 / 待辦 / 紀錄
// ═══════════════════════════════════════════════════════════

function book() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet(name, headers) {
  const ss = book();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function bufferSheet() { return sheet('暫存', ['時間', '內容']); }
function todoSheet()   { return sheet('待辦', ['編號', '建立日', '事項', '來源', '截止', '緊急', '備註', '狀態']); }
function recordSheet() { return sheet('紀錄', ['日期', '原始訊息', '學生版', '簡化版', '家長版']); }

function pushBuffer(t) {
  bufferSheet().appendRow([new Date(), t]);
}

function readBuffer() {
  const sh = bufferSheet();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 2, last - 1, 1).getValues()
    .map(function (r) { return String(r[0] || '').trim(); })
    .filter(function (s) { return s.length > 0; });
}

function clearBuffer() {
  const sh = bufferSheet();
  const last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);
}

function saveTodos(todos, stamp) {
  if (!todos.length) return 0;
  const sh = todoSheet();
  let next = sh.getLastRow();  // 標題列佔 1，所以下一個編號正好是目前列數
  todos.forEach(function (t) {
    sh.appendRow([
      next++, stamp, t.what || '', t.from || '', t.due || '未說明',
      t.urgency === 'high' ? '急' : '', t.note || '', '未完成'
    ]);
  });
  return todos.length;
}

function saveRecord(stamp, raw, data) {
  recordSheet().appendRow([
    stamp, raw,
    data.student_post || '', data.student_simple || '', data.parent_post || ''
  ]);
}

function listTodos() {
  const sh = todoSheet();
  const last = sh.getLastRow();
  if (last < 2) return '目前沒有待辦事項。';

  const rows = sh.getRange(2, 1, last - 1, 8).getValues()
    .filter(function (r) { return r[7] !== '完成'; });

  if (!rows.length) return '所有待辦都完成了。';

  const out = ['【未完成待辦】共 ' + rows.length + ' 件\n'];
  rows.forEach(function (r) {
    out.push('[' + r[0] + '] ' + r[4] + '｜' + r[2] + (r[5] === '急' ? '　⚠️' : ''));
    if (r[6]) out.push('　　' + r[6]);
    if (r[3]) out.push('　　來源：' + r[3]);
    out.push('');
  });
  out.push('做完了就輸入「完成 編號」。');
  return out.join('\n');
}

function completeTodo(n) {
  const sh = todoSheet();
  const last = sh.getLastRow();
  for (let i = 2; i <= last; i++) {
    if (Number(sh.getRange(i, 1).getValue()) === n) {
      sh.getRange(i, 8).setValue('完成');
      return '第 ' + n + ' 項已標記完成：\n' + sh.getRange(i, 3).getValue();
    }
  }
  return '找不到編號 ' + n + '。輸入「待辦」看看目前的清單。';
}

// ═══════════════════════════════════════════════════════════
//  每日提醒（可選：設一個時間觸發器指到這個函式）
// ═══════════════════════════════════════════════════════════

function dailyReminder() {
  if (!OWNER_USER_ID) return;
  const sh = todoSheet();
  const last = sh.getLastRow();
  if (last < 2) return;

  const rows = sh.getRange(2, 1, last - 1, 8).getValues()
    .filter(function (r) { return r[7] !== '完成'; });
  if (!rows.length) return;

  const out = ['早安，今天還有 ' + rows.length + ' 件事：\n'];
  rows.forEach(function (r) {
    out.push('[' + r[0] + '] ' + r[4] + '｜' + r[2] + (r[5] === '急' ? '　⚠️' : ''));
  });
  push(OWNER_USER_ID, [text(out.join('\n'))]);
}

// ═══════════════════════════════════════════════════════════
//  LINE 收發
// ═══════════════════════════════════════════════════════════

function text(s) {
  let t = String(s == null ? '' : s);
  if (t.length > 4900) t = t.slice(0, 4900) + '\n…（過長已截斷）';
  return { type: 'text', text: t || '（空白）' };
}

/** 先試 reply；若 token 已逾時（整理花太久）就改用 push，訊息不會掉 */
function send(token, messages) {
  if (reply(token, messages)) return;
  if (OWNER_USER_ID) push(OWNER_USER_ID, messages);
}

function reply(token, messages) {
  if (!token) return false;
  const res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + LINE_TOKEN },
    payload: JSON.stringify({ replyToken: token, messages: messages.slice(0, 5) })
  });
  const ok = res.getResponseCode() === 200;
  if (!ok) log('reply 失敗 ' + res.getResponseCode() + '：' + res.getContentText().slice(0, 200));
  return ok;
}

function push(to, messages) {
  const res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + LINE_TOKEN },
    payload: JSON.stringify({ to: to, messages: messages.slice(0, 5) })
  });
  if (res.getResponseCode() !== 200) {
    log('push 失敗 ' + res.getResponseCode() + '：' + res.getContentText().slice(0, 200));
  }
}

// ═══════════════════════════════════════════════════════════
//  雜項
// ═══════════════════════════════════════════════════════════

function isDuplicate(eventId) {
  if (!eventId) return false;
  const cache = CacheService.getScriptCache();
  const key = 'evt_' + eventId;
  if (cache.get(key)) return true;
  cache.put(key, '1', 600);
  return false;
}

function log(s) {
  console.log(s);
}

/** 部署後先跑這個，確認試算表分頁都建好了 */
function setup() {
  bufferSheet(); todoSheet(); recordSheet();
  console.log('三個分頁都準備好了。接著把網頁應用程式網址填到 LINE 的 Webhook URL。');
}
