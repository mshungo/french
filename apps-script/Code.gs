/**
 * 動詞活用クイズ：結果記録用 Apps Script（学生ID＋共通パスワード版）
 *
 * 使い方
 *  1. 結果を溜めたいスプレッドシートを開く →「拡張機能 > Apps Script」に、このファイルの全文を貼り付けて保存
 *  2. 関数「setup」を一度実行する（シート作成。初回は権限の承認が出る）
 *  3.「デプロイ > 新しいデプロイ > ウェブアプリ」
 *       実行ユーザー: 自分 / アクセスできるユーザー: 全員
 *     → 表示された「ウェブアプリのURL」（…/exec）をクイズHTMLの CONFIG.SCRIPT_URL に貼る
 *  4. メニュー「活用クイズ > 共通パスワードを設定」でパスワード（例：授業で伝える語）を登録する。
 *     パスワードはこのコードには書かず、スクリプトのプロパティ PASSWORD に保存される（コードはGitHubで公開されるため）。
 *     メニューが出ないときは、Apps Script の「プロジェクトの設定 > スクリプト プロパティ」に PASSWORD を直接追加してもよい。
 *     大文字・小文字と全角・半角は区別しない。変えると、全員がログインし直しになる。
 *     練習用ID（NARAF26）はサイト側だけで動き、ここには何も送られない。
 *  5. 学生を追加するとき: シート「名簿」のB列に氏名、C列に名字のローマ字（例：MORITA）を書き、
 *     メニュー「活用クイズ > 名簿の空欄にIDを発行」を実行する → A列に「名字＋英数字4文字」のID（例：MORITA7K3Q）が入る。
 *     IDが漏れたときは、A列のIDを消して再発行すれば、古いIDは使えなくなる（記録は古いIDのまま残る）。
 *     そのIDを学生に伝える。いつでも追加できる。
 *     利用をやめさせたい学生は、名簿のその行を削除する（結果の記録は残る）。
 *
 * コードを書き換えたあとは、「デプロイを管理 > 編集 > 新バージョン」で反映する。
 */

// ===== 以下は通常変更しない =====
const VERSION = '2026-10-05d';   // 公開中のコードがどれか確認するための番号（ウェブアプリのURLを開くと表示）
const TZ = 'Asia/Tokyo';
const SHEET = { roster: '名簿', results: '結果', summary: '集計', feedback: 'フィードバック' };
const PRACTICE_ID = 'NARAF26';   // 練習用ID（名簿には載せない）。フィードバックの送信だけ受け付ける
const FEEDBACK_HEADERS = ['日時', '学生ID', '氏名', 'ページ', '種類', 'コメント', 'そのときの画面', '端末', '対応メモ'];
const FEEDBACK_KINDS = ['答えがおかしい', '選択肢がおかしい', '訳・解説がおかしい', '音声・表示の不具合', 'その他'];
const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // 0/O/1/I/L など紛らわしい文字を除く
const ID_LEN = 4;             // 名字のあとにつける英数字の数
const ID_RE = /^[A-Z0-9_-]{3,20}$/;   // 受け付けるIDの形（手入力のIDも使えるよう、3〜20文字の英数字と - _）
const MAX_FAILS = 100;        // 10分間にID照合の失敗がこの回数を超えたら一時停止（総当たり対策）
// 送信回数の制限（1つのIDごと）
const LIMIT = {
  submitMinGapSec: 5,    // 結果の送信は5秒に1回まで
  submitPerHour: 60,     // 1時間に60回まで（10問×60回＝600問）
  submitPerDay: 300,     // 1日に300回まで
  readPerMin: 20,        // 記録の読み込み（ログイン・学習記録の表示）は1分に20回まで
  feedbackPerHour: 20,   // 問題の報告は1つのIDにつき1時間20件まで
  feedbackPerDay: 60     // 1日60件まで
};
const SECTION_LABEL = { 'être': 'être', aller: 'aller', avoir: 'avoir', faire: 'faire', mix: '総まとめ' };
const MODE_LABEL = { choice: '選択式', write: '記述式' };
const APP_LABEL = { conj: '動詞活用', grammar: '文法練習', talk: '会話練習' };
const RESULT_HEADERS = ['日時', '日付', '学生ID', '氏名', '教材', 'セクション', '形式', '正解数', '問題数',
  '所要秒', 'タイムアタック', 'ランク', '誤答', 'rid', '学習秒'];
const COL = { time: 1, date: 2, id: 3, name: 4, app: 5, section: 6, mode: 7, score: 8, total: 9,
  sec: 10, ta: 11, rank: 12, misses: 13, rid: 14, dur: 15 };
const N_COLS = 15;
const ROW_FORMATS = ['yyyy-mm-dd hh:mm:ss', '@', '@', '@', '@', '@', '@', '0', '0', '0.0', '@', '@', '@', '@', '0'];
const SUMMARY_ROWS = 60;   // 集計の対象人数（名簿の2〜61行目）

// ===== Webアプリの入口 =====
function doGet() {
  return json_({ ok: true, service: 'conjugation-quiz', version: VERSION, password: password_() ? '設定済み' : '未設定' });   // 動作確認用（URLをブラウザで開くと表示）
}

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = handle_(req);
  } catch (err) {
    out = { ok: false, error: 'server', message: String(err && err.message || err).slice(0, 200) };
    console.error(err && err.stack || err);
  }
  out.version = VERSION;
  return json_(out);
}

// IDの表記ゆれをそろえる（全角→半角、空白除去、大文字化）
function normId_(s) {
  return String(s == null ? '' : s).normalize('NFKC').replace(/\s+/g, '').toUpperCase();
}

// パスワードの表記ゆれをそろえる（全角→半角、空白除去、小文字化）
function normPw_(s) {
  return String(s == null ? '' : s).normalize('NFKC').replace(/\s+/g, '').toLowerCase();
}
// スクリプトのプロパティ PASSWORD（名前の大文字小文字・前後の空白は問わない）。なければシート「設定」の B1。
function password_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  for (const k in props) if (k.trim().toUpperCase() === 'PASSWORD' && normPw_(props[k])) return normPw_(props[k]);
  try {
    const sh = ss_().getSheetByName('設定');
    if (sh) return normPw_(sh.getRange('B1').getValue());
  } catch (e) {}
  return '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(req) {
  const ss = ss_();
  const cache = CacheService.getScriptCache();
  if (failCount_(cache) >= MAX_FAILS) return { ok: false, error: 'locked' };

  const pass = password_();
  if (!pass) return { ok: false, error: 'nopass' };   // 共通パスワードが未設定
  const id = normId_(req.id);
  const pwOk = normPw_(req.pw) === pass;
  let name = (pwOk && ID_RE.test(id)) ? lookupRoster_(ss, id) : null;   // パスワード違い・名簿にいなければ null
  if (name === null && pwOk && id === PRACTICE_ID && req.action === 'feedback') name = '練習用';
  if (name === null) {
    addFail_(cache);
    return { ok: false, error: 'auth' };
  }
  const user = { id: id, name: name || id };

  if (req.action === 'sync' || req.action === 'history') {
    if (!rateOk_(cache, 'r:' + id, LIMIT.readPerMin, 60)) return { ok: false, error: 'rate' };
    try { touchLogin_(ss, cache, id); } catch (e) {}   // 失敗してもログインは止めない
    if (req.action === 'history') return { ok: true, user: user, history: historyFor_(ss, id) };
    return { ok: true, user: user, stats: statsFor_(ss, id) };
  }
  if (req.action === 'submit') {
    if (!submitAllowed_(cache, id)) return { ok: false, error: 'rate' };
    const v = validateResult_(req.result);
    if (!v) return { ok: false, error: 'bad_request' };
    appendResult_(ss, user, v);
    return { ok: true, user: user, stats: statsFor_(ss, id) };
  }
  if (req.action === 'feedback') {
    if (!rateOk_(cache, 'f:h:' + id, LIMIT.feedbackPerHour, 3600) || !rateOk_(cache, 'f:d:' + id, LIMIT.feedbackPerDay, 86400)) return { ok: false, error: 'rate' };
    const f = req.feedback || {};
    const kind = FEEDBACK_KINDS.indexOf(f.kind) >= 0 ? f.kind : 'その他';
    const text = safe_(f.text, 500), ctx = safe_(f.context, 800);
    if (!text && !ctx) return { ok: false, error: 'bad_request' };
    const sh = ensureSheet_(ss, SHEET.feedback, FEEDBACK_HEADERS);
    sh.appendRow([new Date(), id, safe_(user.name, 40), safe_(f.page, 80), kind, text, ctx, safe_(f.device, 120), '']);
    return { ok: true };
  }
  return { ok: false, error: 'bad_request' };
}

// ===== 送信回数の制限 =====
// 区切った時間枠（1分・1時間など）ごとに数える。枠が変われば0から数え直す。
// （以前は書き込むたびに有効期限が延びて、使い続けると数がリセットされなかった）
function rateOk_(cache, key, max, sec) {
  const k = key + '@' + Math.floor(Date.now() / 1000 / sec);
  const n = Number(cache.get(k) || 0);
  if (n >= max) return false;
  cache.put(k, String(n + 1), Math.min(sec + 60, 21600));
  return true;
}
function failCount_(cache) { return Number(cache.get('fails@' + Math.floor(Date.now() / 600000)) || 0); }
function addFail_(cache) { cache.put('fails@' + Math.floor(Date.now() / 600000), String(failCount_(cache) + 1), 700); }
function submitAllowed_(cache, id) {
  const now = Date.now();
  const last = Number(cache.get('s:last:' + id) || 0);
  if (now - last < LIMIT.submitMinGapSec * 1000) return false;
  if (!rateOk_(cache, 's:h:' + id, LIMIT.submitPerHour, 3600)) return false;
  const dayKey = 's:d:' + id + ':' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd');
  if (!rateOk_(cache, dayKey, LIMIT.submitPerDay, 86400)) return false;
  cache.put('s:last:' + id, String(now), 600);
  return true;
}

// ===== スプレッドシート =====
function ss_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers && sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function resultsSheet_(ss) {
  const sh = ensureSheet_(ss, SHEET.results, RESULT_HEADERS);
  if (sh.getLastColumn() < N_COLS) sh.getRange(1, 1, 1, N_COLS).setValues([RESULT_HEADERS]).setFontWeight('bold');   // 旧版のシートに列を追加
  return sh;
}

function lookupRoster_(ss, id) {
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh || sh.getLastRow() < 2) return null;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  for (const row of vals) {
    if (normId_(row[0]) === id) return String(row[1] || '').trim();
  }
  return null;
}

// 名簿のE列「最終ログイン」に日時を書く。書き込みは1つのIDにつき1時間に1回まで（負荷を抑えるため）
const LASTLOGIN_COL = 5;
function touchLogin_(ss, cache, id) {
  if (cache.get('ll:' + id)) return;
  cache.put('ll:' + id, '1', 3600);
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh || sh.getLastRow() < 2) return;
  if (!sh.getRange(1, LASTLOGIN_COL).getValue()) sh.getRange(1, LASTLOGIN_COL).setValue('最終ログイン').setFontWeight('bold');
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (normId_(ids[i][0]) === id) {
      sh.getRange(i + 2, LASTLOGIN_COL).setValue(new Date()).setNumberFormat('yyyy-mm-dd hh:mm');
      return;
    }
  }
}

// ===== 結果の検証と追記 =====
function own_(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// シートに書く文字列は、数式として解釈されないよう整える
function safe_(s, n) {
  let t = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
  if (/^[=+\-@]/.test(t)) t = ' ' + t;
  return t;
}

function rankOfSec_(s) {
  if (s <= 20) return 'SSS';
  if (s <= 30) return 'SS';
  if (s <= 45) return 'S';
  if (s <= 60) return 'A';
  if (s <= 120) return 'B';
  return 'C';
}

function validateResult_(r) {
  if (!r || typeof r !== 'object') return null;
  const rid = String(r.rid || '');
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(rid)) return null;
  if (!own_(APP_LABEL, r.app)) return null;
  let section, mode;
  if (r.app === 'conj') {   // 動詞活用は決まったセクション・形式だけ受け付ける
    if (!own_(SECTION_LABEL, r.section) || !own_(MODE_LABEL, r.mode)) return null;
    section = SECTION_LABEL[r.section];
    mode = MODE_LABEL[r.mode];
  } else {
    section = safe_(r.section, 30);
    mode = safe_(r.mode, 20);
    if (!section) return null;
  }
  const total = Number(r.total), score = Number(r.score);
  if (!Number.isInteger(total) || total < 1 || total > 50) return null;
  if (!Number.isInteger(score) || score < 0 || score > total) return null;

  const timeAttack = r.timeAttack === true;
  let timeSec = '';
  if (timeAttack) {
    const ms = Number(r.timeMs);
    if (!isFinite(ms) || ms < 0 || ms > 6 * 3600 * 1000) return null;
    timeSec = Math.round(ms / 100) / 10;
  }
  const rank = (timeAttack && score === total) ? rankOfSec_(timeSec) : '';   // ランクは全問正解のタイムアタックだけ

  const misses = (Array.isArray(r.misses) ? r.misses.slice(0, 50) : []).map(function (m) {
    m = m || {};
    return safe_(m.full, 80) + ' [' + safe_(m.verb, 10) + '] ' + safe_(m.chosen, 30) + '→' + safe_(m.answer, 30);
  }).join(' / ');

  let dur = Math.round(Number(r.durMs) / 1000);
  if (!isFinite(dur) || dur < 0) dur = '';
  else dur = Math.min(dur, total * 90);   // 放置した時間は1問90秒まで
  return { rid: rid, app: r.app, section: section, mode: mode, total: total, score: score,
    timeAttack: timeAttack, timeSec: timeSec, rank: rank, misses: safe_(misses, 4000), dur: dur };
}

function appendResult_(ss, user, v) {
  const sh = resultsSheet_(ss);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const last = sh.getLastRow();
    if (last >= 2) {
      const rids = sh.getRange(2, COL.rid, last - 1, 1).getValues();
      for (const x of rids) if (String(x[0]) === v.rid) return false;   // 再送による重複は無視
    }
    const now = new Date();
    const row = [now, Utilities.formatDate(now, TZ, 'yyyy-MM-dd'), user.id, safe_(user.name, 60),
      APP_LABEL[v.app], v.section, v.mode, v.score, v.total, v.timeSec, v.timeAttack ? '○' : '', v.rank, v.misses, v.rid, v.dur];
    const rng = sh.getRange(last + 1, 1, 1, N_COLS);
    rng.setNumberFormats([ROW_FORMATS]);
    rng.setValues([row]);
    return true;
  } finally {
    lock.releaseLock();
  }
}

// ===== その学生の記録を集計して返す（画面の復元用）=====
function emptyStats_() {
  return { tries: 0, answered: 0, correct: 0, best: null,
    bestTimes: { 'être': null, aller: null, avoir: null, faire: null, mix: null } };
}

function statsFor_(ss, id) {
  const out = { days: [], apps: { conj: emptyStats_(), grammar: emptyStats_(), talk: emptyStats_() } };
  const sh = ss.getSheetByName(SHEET.results);
  if (!sh || sh.getLastRow() < 2) return out;

  const labelToKey = {}, appToKey = {};
  Object.keys(SECTION_LABEL).forEach(function (k) { labelToKey[SECTION_LABEL[k]] = k; });
  Object.keys(APP_LABEL).forEach(function (k) { appToKey[APP_LABEL[k]] = k; });

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, N_COLS).getValues();
  const days = {};
  for (const r of vals) {
    if (normId_(r[COL.id - 1]) !== id) continue;
    const d = r[COL.date - 1];
    const dayStr = d instanceof Date ? Utilities.formatDate(d, TZ, 'yyyy-MM-dd') : String(d);
    if (dayStr) days[dayStr] = true;

    const app = appToKey[r[COL.app - 1]];
    if (!app) continue;
    const st = out.apps[app];
    const score = Number(r[COL.score - 1]) || 0;
    st.tries++;
    st.answered += Number(r[COL.total - 1]) || 0;
    st.correct += score;
    if (st.best === null || score > st.best) st.best = score;

    const sec = Number(r[COL.sec - 1]);
    if (app === 'conj' && r[COL.rank - 1] && sec > 0) {
      const key = labelToKey[r[COL.section - 1]];
      if (key) {
        const ms = Math.round(sec * 1000);
        if (st.bestTimes[key] === null || ms < st.bestTimes[key]) st.bestTimes[key] = ms;
      }
    }
  }
  out.days = Object.keys(days).sort();
  return out;
}

// ===== 学習記録（本人の分だけ）=====
function historyFor_(ss, id) {
  const sh = ss.getSheetByName(SHEET.results);
  const out = [];
  if (!sh || sh.getLastRow() < 2) return out;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, N_COLS).getValues();
  const appToKey = {};
  Object.keys(APP_LABEL).forEach(function (k) { appToKey[APP_LABEL[k]] = k; });
  for (const r of vals) {
    if (normId_(r[COL.id - 1]) !== id) continue;
    const t = r[COL.time - 1];
    out.push({
      t: t instanceof Date ? Utilities.formatDate(t, TZ, "yyyy-MM-dd'T'HH:mm") : String(t),
      app: appToKey[r[COL.app - 1]] || '',
      sec: String(r[COL.section - 1] || ''),
      score: Number(r[COL.score - 1]) || 0,
      total: Number(r[COL.total - 1]) || 0,
      dur: Number(r[COL.dur - 1]) || 0
    });
  }
  return out.slice(-1000);   // 最新の1000件まで（古い順）
}

// ===== 初期設定・ID発行 =====
function onOpen() {
  SpreadsheetApp.getUi().createMenu('活用クイズ')
    .addItem('初期設定（シート作成）', 'setup')
    .addItem('名簿の空欄にIDを発行', 'issueIds')
    .addItem('共通パスワードを設定', 'setPassword')
    .addSeparator()
    .addItem('ログインテスト（IDを確かめる）', 'testLogin')
    .addItem('ログイン制限を解除', 'clearLock')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone(TZ);

  const roster = ensureSheet_(ss, SHEET.roster, null);
  roster.getRange(1, 1, 1, 5).setValues([['学生ID', '氏名', '名字（ローマ字）', 'メモ(任意)', '最終ログイン']]).setFontWeight('bold');
  roster.setFrozenRows(1);
  roster.getRange(2, 1, 500, 1).setNumberFormat('@');
  resultsSheet_(ss);
  ensureSheet_(ss, SHEET.feedback, FEEDBACK_HEADERS);
  buildSummary_(ss);
  ss.toast('シートを用意しました。名簿のB列に氏名、C列に名字のローマ字を入れて、メニューからIDを発行してください。');
}

// メニューから：共通パスワードを登録・変更する
function setPassword() {
  const ui = SpreadsheetApp.getUi();
  const cur = password_();
  const r = ui.prompt('共通パスワードを設定',
    (cur ? '現在のパスワード: ' + cur + '\n' : 'まだ設定されていません。\n') + '新しいパスワードを入力してください（大文字・小文字は区別しません）',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const pw = normPw_(r.getResponseText());
  if (pw.length < 3) { ui.alert('3文字以上にしてください。'); return; }
  PropertiesService.getScriptProperties().setProperty('PASSWORD', pw);
  SpreadsheetApp.getActiveSpreadsheet().toast('共通パスワードを「' + pw + '」にしました。');
}

function randomId_() {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Math.random());
  let out = '';
  for (let i = 0; i < ID_LEN; i++) out += ID_ALPHABET.charAt((bytes[i] & 0xff) % ID_ALPHABET.length);
  return out;
}

// 名字（ローマ字）をIDの頭の形にそろえる（全角→半角、大文字、英字のみ、最大12文字）
function surnameKey_(s) {
  return String(s == null ? '' : s).normalize('NFKC').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12);
}

// IDが空の行に「名字＋英数字4文字」のIDを発行する（既存のIDは変えない）
function issueIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh) { setup(); return issueIds(); }
  const last = sh.getLastRow();
  if (last < 2) { ss.toast('名簿のB列に氏名、C列に名字のローマ字を入力してから実行してください。'); return; }
  const rng = sh.getRange(2, 1, last - 1, 3);
  const vals = rng.getValues();
  const used = {};
  vals.forEach(function (r) { const x = normId_(r[0]); if (x) used[x] = true; });
  let n = 0, skipped = 0;
  for (const r of vals) {
    if (String(r[0]).trim() !== '') { r[0] = normId_(r[0]); continue; }
    if (String(r[1]).trim() === '' && String(r[2]).trim() === '') continue;
    const head = surnameKey_(r[2]);
    if (!head) { skipped++; continue; }
    let id;
    do { id = head + randomId_(); } while (used[id]);
    used[id] = true;
    r[0] = id;
    n++;
  }
  sh.getRange(2, 1, last - 1, 1).setNumberFormat('@');
  rng.setValues(vals);
  ss.toast(n + '人分のIDを発行しました。' + (skipped ? '（C列の名字ローマ字が空の ' + skipped + ' 行は発行していません）' : ''));
}

function buildSummary_(ss) {
  const sh = ensureSheet_(ss, SHEET.summary, null);
  const headers = ['学生ID', '氏名', 'ラウンド数', '学習日数', '直近7日の学習日数', '最終学習日', '累計解答数', '正答率',
    '動詞活用(回)', '文法練習(回)', '会話練習(回)',
    '最速 être(秒)', '最速 aller(秒)', '最速 avoir(秒)', '最速 faire(秒)', '最速 総まとめ(秒)'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sh.setFrozenRows(1);

  // 結果シートの列: A日時 B日付 C学生ID D氏名 E教材 F セクション G形式 H正解数 I問題数 J所要秒 Kタイムアタック Lランク
  const R = "'結果'!";
  const rows = [];
  for (let r = 2; r < 2 + SUMMARY_ROWS; r++) {
    const a = '$A' + r;
    const guard = function (f) { return '=IF(' + a + '="","",' + f + ')'; };
    const appCount = function (label) { return guard('COUNTIFS(' + R + 'C:C,' + a + ',' + R + 'E:E,"' + label + '")'); };
    const best = function (label) {
      const cond = R + 'C:C,' + a + ',' + R + 'E:E,"動詞活用",' + R + 'F:F,"' + label + '",' + R + 'L:L,"<>"';
      return guard('IF(COUNTIFS(' + cond + ')=0,"",MINIFS(' + R + 'J:J,' + cond + '))');
    };
    rows.push([
      "=IF('名簿'!A" + r + '="","",UPPER(SUBSTITUTE(ASC(TRIM(\'名簿\'!A' + r + '))," ","")))',
      guard("IF('名簿'!B" + r + "<>\"\",'名簿'!B" + r + ',IFERROR(INDEX(' + R + 'D:D,MATCH(' + a + ',' + R + 'C:C,0)),""))'),
      guard('COUNTIF(' + R + 'C:C,' + a + ')'),
      guard('IFERROR(COUNTUNIQUE(FILTER(' + R + 'B:B,' + R + 'C:C=' + a + ')),0)'),
      guard('IFERROR(COUNTUNIQUE(FILTER(' + R + 'B:B,' + R + 'C:C=' + a + ',' + R + 'A:A>=TODAY()-6)),0)'),
      guard('IF(COUNTIF(' + R + 'C:C,' + a + ')=0,"",TEXT(MAXIFS(' + R + 'A:A,' + R + 'C:C,' + a + '),"yyyy-mm-dd"))'),
      guard('SUMIFS(' + R + 'I:I,' + R + 'C:C,' + a + ')'),
      guard('IF(SUMIFS(' + R + 'I:I,' + R + 'C:C,' + a + ')=0,"",SUMIFS(' + R + 'H:H,' + R + 'C:C,' + a + ')/SUMIFS(' + R + 'I:I,' + R + 'C:C,' + a + '))'),
      appCount('動詞活用'), appCount('文法練習'), appCount('会話練習'),
      best('être'), best('aller'), best('avoir'), best('faire'), best('総まとめ')
    ]);
  }
  sh.getRange(2, 1, SUMMARY_ROWS, headers.length).setFormulas(rows);
  sh.getRange(2, 8, SUMMARY_ROWS, 1).setNumberFormat('0%');
  sh.getRange(2, 12, SUMMARY_ROWS, 5).setNumberFormat('0.0');
}

// ===== 名簿の入力補助・点検 =====
// 名簿のA列にIDを手入力したら、自動で半角・大文字にそろえる
function onEdit(e) {
  try {
    const rng = e && e.range;
    if (!rng || rng.getSheet().getName() !== SHEET.roster || rng.getColumn() !== 1 || rng.getRow() < 2) return;
    if (rng.getNumRows() !== 1 || rng.getNumColumns() !== 1) return;
    const v = rng.getValue();
    const n = normId_(v);
    if (v !== '' && String(v) !== n) { rng.setNumberFormat('@'); rng.setValue(n); }
  } catch (err) {}
}

// メニューから：IDを入れると、ログインできるかどうかと理由を表示する
function testLogin() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const r = ui.prompt('ログインテスト', '試したいIDを入力してください', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const raw = r.getResponseText();
  const id = normId_(raw);
  const lines = ['入力: ' + raw, '照合に使う形: ' + id];
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh) {
    lines.push('×「' + SHEET.roster + '」シートがありません。メニューの「初期設定」を実行してください。');
  } else if (!ID_RE.test(id)) {
    lines.push('× IDの形が不正です（英数字と - _ の3〜20文字）。');
  } else {
    const name = lookupRoster_(ss, id);
    if (name !== null) {
      lines.push('○ 名簿に見つかりました' + (name ? '（氏名: ' + name + '）' : '') + '。');
      lines.push('このIDでログインできるはずです。サイトでだめなら、デプロイが古い可能性があります。');
      lines.push('（ウェブアプリのURLを開いて version が ' + VERSION + ' になっているか確認）');
    } else {
      lines.push('× 名簿に見つかりません。');
      const last = sh.getLastRow();
      const ids = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (x) { return normId_(x[0]); }).filter(String) : [];
      lines.push('名簿のID（' + ids.length + '件）: ' + (ids.slice(0, 30).join(', ') || 'なし'));
    }
  }
  lines.push(password_() ? '共通パスワード: ' + password_() : '× 共通パスワードが未設定です。メニュー「共通パスワードを設定」を実行してください。');
  const fails = failCount_(CacheService.getScriptCache());
  if (fails >= MAX_FAILS) lines.push('※ 失敗が多すぎて一時停止中です。「ログイン制限を解除」を実行してください。');
  lines.push('コードの版: ' + VERSION);
  ui.alert('ログインテスト', lines.join('\n'), ui.ButtonSet.OK);
}

function clearLock() {
  CacheService.getScriptCache().remove('fails@' + Math.floor(Date.now() / 600000));
  SpreadsheetApp.getActiveSpreadsheet().toast('ログイン制限を解除しました。');
}
