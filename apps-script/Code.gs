/**
 * 動詞活用クイズ：結果記録用 Apps Script（学生IDログイン版）
 *
 * 使い方
 *  1. 結果を溜めたいスプレッドシートを開く →「拡張機能 > Apps Script」に、このファイルの全文を貼り付けて保存
 *  2. 関数「setup」を一度実行する（シート作成。初回は権限の承認が出る）
 *  3.「デプロイ > 新しいデプロイ > ウェブアプリ」
 *       実行ユーザー: 自分 / アクセスできるユーザー: 全員
 *     → 表示された「ウェブアプリのURL」（…/exec）をクイズHTMLの CONFIG.SCRIPT_URL に貼る
 *  4. 学生を追加するとき: シート「名簿」のB列に氏名を書き、
 *     メニュー「活用クイズ > 名簿の空欄にIDを発行」を実行する → A列に6文字のIDが入る。
 *     そのIDを学生に伝える。いつでも追加できる。
 *     利用をやめさせたい学生は、名簿のその行を削除する（結果の記録は残る）。
 *
 * コードを書き換えたあとは、「デプロイを管理 > 編集 > 新バージョン」で反映する。
 */

// ===== 以下は通常変更しない =====
const VERSION = '2026-10-04c';   // 公開中のコードがどれか確認するための番号（ウェブアプリのURLを開くと表示）
const TZ = 'Asia/Tokyo';
const SHEET = { roster: '名簿', results: '結果', summary: '集計' };
const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // 0/O/1/I/L など紛らわしい文字を除く
const ID_LEN = 6;             // 自動発行するIDの長さ
const ID_RE = /^[A-Z0-9_-]{3,20}$/;   // 受け付けるIDの形（手入力のIDも使えるよう、3〜20文字の英数字と - _）
const MAX_FAILS = 100;        // 10分間にID照合の失敗がこの回数を超えたら一時停止（総当たり対策）
const SECTION_LABEL = { 'être': 'être', aller: 'aller', avoir: 'avoir', faire: 'faire', mix: '総まとめ' };
const MODE_LABEL = { choice: '選択式', write: '記述式' };
const APP_LABEL = { conj: '動詞活用', grammar: '文法練習', talk: '会話練習' };
const RESULT_HEADERS = ['日時', '日付', '学生ID', '氏名', '教材', 'セクション', '形式', '正解数', '問題数',
  '所要秒', 'タイムアタック', 'ランク', '誤答', 'rid'];
const COL = { time: 1, date: 2, id: 3, name: 4, app: 5, section: 6, mode: 7, score: 8, total: 9,
  sec: 10, ta: 11, rank: 12, misses: 13, rid: 14 };
const N_COLS = 14;
const ROW_FORMATS = ['yyyy-mm-dd hh:mm:ss', '@', '@', '@', '@', '@', '@', '0', '0', '0.0', '@', '@', '@', '@'];
const SUMMARY_ROWS = 60;   // 集計の対象人数（名簿の2〜61行目）

// ===== Webアプリの入口 =====
function doGet() {
  return json_({ ok: true, service: 'conjugation-quiz', version: VERSION });   // 動作確認用（URLをブラウザで開くと表示）
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

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(req) {
  const ss = ss_();
  const cache = CacheService.getScriptCache();
  if (Number(cache.get('fails') || 0) >= MAX_FAILS) return { ok: false, error: 'locked' };

  const id = normId_(req.id);
  const name = ID_RE.test(id) ? lookupRoster_(ss, id) : null;   // 名簿にいなければ null
  if (name === null) {
    cache.put('fails', String(Number(cache.get('fails') || 0) + 1), 600);
    return { ok: false, error: 'auth' };
  }
  const user = { id: id, name: name || id };

  if (req.action === 'sync') {
    return { ok: true, user: user, stats: statsFor_(ss, id) };
  }
  if (req.action === 'submit') {
    const v = validateResult_(req.result);
    if (!v) return { ok: false, error: 'bad_request' };
    appendResult_(ss, user, v);
    return { ok: true, user: user, stats: statsFor_(ss, id) };
  }
  return { ok: false, error: 'bad_request' };
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
  return ensureSheet_(ss, SHEET.results, RESULT_HEADERS);
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

  return { rid: rid, app: r.app, section: section, mode: mode, total: total, score: score,
    timeAttack: timeAttack, timeSec: timeSec, rank: rank, misses: safe_(misses, 4000) };
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
      APP_LABEL[v.app], v.section, v.mode, v.score, v.total, v.timeSec, v.timeAttack ? '○' : '', v.rank, v.misses, v.rid];
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

// ===== 初期設定・ID発行 =====
function onOpen() {
  SpreadsheetApp.getUi().createMenu('活用クイズ')
    .addItem('初期設定（シート作成）', 'setup')
    .addItem('名簿の空欄にIDを発行', 'issueIds')
    .addSeparator()
    .addItem('ログインテスト（IDを確かめる）', 'testLogin')
    .addItem('ログイン制限を解除', 'clearLock')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone(TZ);

  const roster = ensureSheet_(ss, SHEET.roster, ['学生ID', '氏名', 'メモ(任意)']);
  roster.getRange(2, 1, 500, 1).setNumberFormat('@');
  resultsSheet_(ss);
  buildSummary_(ss);
  ss.toast('シートを用意しました。名簿のB列に氏名を入れて、メニューからIDを発行してください。');
}

function randomId_() {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Math.random());
  let out = '';
  for (let i = 0; i < ID_LEN; i++) out += ID_ALPHABET.charAt((bytes[i] & 0xff) % ID_ALPHABET.length);
  return out;
}

// 氏名があってIDが空の行にIDを発行する（何度実行しても既存のIDは変わらない）
function issueIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh) { setup(); return issueIds(); }
  const last = sh.getLastRow();
  if (last < 2) { ss.toast('名簿のB列に氏名を入力してから実行してください。'); return; }
  const rng = sh.getRange(2, 1, last - 1, 2);
  const vals = rng.getValues();
  const used = {};
  vals.forEach(function (r) { const x = normId_(r[0]); if (x) used[x] = true; });
  let n = 0;
  for (const r of vals) {
    const hasId = String(r[0]).trim() !== '';
    if (hasId) { r[0] = normId_(r[0]); continue; }
    if (String(r[1]).trim() === '') continue;
    let id;
    do { id = randomId_(); } while (used[id]);
    used[id] = true;
    r[0] = id;
    n++;
  }
  sh.getRange(2, 1, last - 1, 1).setNumberFormat('@');
  rng.setValues(vals);
  ss.toast(n + '人分のIDを発行しました。');
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
  const fails = Number(CacheService.getScriptCache().get('fails') || 0);
  if (fails >= MAX_FAILS) lines.push('※ 失敗が多すぎて一時停止中です。「ログイン制限を解除」を実行してください。');
  lines.push('コードの版: ' + VERSION);
  ui.alert('ログインテスト', lines.join('\n'), ui.ButtonSet.OK);
}

function clearLock() {
  CacheService.getScriptCache().remove('fails');
  SpreadsheetApp.getActiveSpreadsheet().toast('ログイン制限を解除しました。');
}
