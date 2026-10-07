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
const VERSION = '2026-10-07c';   // 公開中のコードがどれか確認するための番号（ウェブアプリのURLを開くと表示）
const TZ = 'Asia/Tokyo';
const SHEET = { roster: '名簿', results: '結果', summary: '集計', feedback: 'フィードバック', progress: '進み具合', studentData: '生徒データ' };
const PROG_HEADERS = ['学生ID', '教材データ', '更新日時', '解答数', 'データ（自動バックアップ・編集しない）'];
const PROG_KEY_RE = /^(conjQuizStats_v4|talkQuiz_v1|gramQuiz_L[1-9]_v1|conjQuizDays)$/;   // 端末の記録のうち、バックアップするもの
const PROG_MAX = 45000;      // 1件あたりの最大文字数（セルの上限は5万字）
const BACKUP_FOLDER = 'Naralingo バックアップ';
const BACKUP_KEEP = 30;   // 自動バックアップを何日分残すか
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
  feedbackPerDay: 60,    // 1日60件まで
  progPerHour: 120       // 進み具合のバックアップは1時間120回まで
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

// ===== Webアプリの入口 =====
function doGet() {
  // 動作確認用（URLをブラウザで開くと表示）。ログイン画面はここから「お知らせ」も受け取る
  let notices = [];
  try { notices = notices_(); } catch (e) {}
  return json_({ ok: true, service: 'conjugation-quiz', version: VERSION, password: password_() ? '設定済み' : '未設定', notices: notices });
}

// ===== お知らせ（シート「お知らせ」でA列にチェックを入れた行を、ログイン画面とメニューの上に出す）=====
const NOTICE_SHEET = 'お知らせ';
const NOTICE_HEADERS = ['表示する', '種類（お知らせ／注意／障害）', '本文', 'メモ（表示されない）'];
function noticeSheet_(ss) {
  let sh = ss.getSheetByName(NOTICE_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NOTICE_SHEET);
    sh.getRange(1, 1, 1, NOTICE_HEADERS.length).setValues([NOTICE_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    try { sh.getRange(2, 1, 20, 1).insertCheckboxes(); } catch (e) {}
    sh.getRange(2, 2, 1, 3).setValues([['お知らせ', '（例）Naralingo はベータ版です。気づいたことは各ページ下の「先生に知らせる」から送ってください。', 'A列にチェックを入れると表示されます']]);
    try { sh.setColumnWidth(3, 520); } catch (e) {}
  }
  return sh;
}
function notices_() {
  const cache = CacheService.getScriptCache(), c = cache.get('notices');
  if (c) return JSON.parse(c);
  const sh = ss_().getSheetByName(NOTICE_SHEET), out = [];
  if (sh && sh.getLastRow() >= 2) {
    sh.getRange(2, 1, Math.min(sh.getLastRow() - 1, 30), 3).getValues().forEach(function (r) {
      const on = r[0] === true || String(r[0]).toUpperCase() === 'TRUE' || r[0] === '○';
      const text = String(r[2] || '').replace(/[\u0000-\u0009\u000b-\u001f]/g, ' ').trim().slice(0, 400);
      if (on && text && out.length < 3) out.push({ kind: ['注意', '障害'].indexOf(String(r[1]).trim()) >= 0 ? String(r[1]).trim() : 'お知らせ', text: text });
    });
  }
  cache.put('notices', JSON.stringify(out), 60);   // 1分間は読み直さない（書き換えると1分以内に反映）
  return out;
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
    if (req.action === 'history') { const h = historyFor_(ss, id); return { ok: true, user: user, history: h.history, agg: h.agg }; }
    const res = { ok: true, user: user, stats: statsFor_(ss, id) };
    if (req.prog === true) res.prog = loadProg_(ss, id);   // ログイン時：端末にない進み具合を戻すため
    return res;
  }
  if (req.action === 'saveprog') {
    if (!rateOk_(cache, 'p:' + id, LIMIT.progPerHour, 3600)) return { ok: false, error: 'rate' };
    const items = Array.isArray(req.items) ? req.items.slice(0, 12) : [];
    const ok = items.filter(function (it) {
      if (!it || !PROG_KEY_RE.test(String(it.k)) || typeof it.d !== 'string' || it.d.length > PROG_MAX) return false;
      try { JSON.parse(it.d); return true; } catch (e) { return false; }
    });
    if (!ok.length) return { ok: false, error: 'bad_request' };
    saveProg_(ss, id, ok);
    return { ok: true, saved: ok.map(function (it) { return it.k; }) };
  }
  if (req.action === 'submit') {
    if (!submitAllowed_(cache, id)) return { ok: false, error: 'rate' };
    const v = validateResult_(req.result);
    if (!v) return { ok: false, error: 'bad_request' };
    return { ok: true, user: user, stats: recordResult_(ss, user, v) };
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

// ===== 進み具合（端末の記録）のバックアップ =====
function progSheet_(ss) {
  const sh = ensureSheet_(ss, SHEET.progress, PROG_HEADERS);
  return sh;
}
function saveProg_(ss, id, items) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) {}
  try {
    const sh = progSheet_(ss), last = sh.getLastRow();
    const vals = last >= 2 ? sh.getRange(2, 1, last - 1, 2).getValues() : [];
    const row = {};
    vals.forEach(function (r, i) { row[normId_(r[0]) + '|' + r[1]] = i + 2; });
    items.forEach(function (it) {
      let ans = '';
      try { const o = JSON.parse(it.d); ans = Array.isArray(o) ? o.length : (Number(o.answered) || ''); } catch (e) {}
      const rec = [id, String(it.k), new Date(), ans, it.d];
      const r = row[id + '|' + it.k];
      if (r) sh.getRange(r, 1, 1, 5).setValues([rec]);
      else { sh.appendRow(rec); row[id + '|' + it.k] = sh.getLastRow(); }
    });
  } finally { try { lock.releaseLock(); } catch (e) {} }
}
function loadProg_(ss, id) {
  const sh = ss.getSheetByName(SHEET.progress), out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues().forEach(function (r) {
    if (normId_(r[0]) === id && PROG_KEY_RE.test(String(r[1])) && r[4]) out[String(r[1])] = String(r[4]);
  });
  return out;
}

// ===== スプレッドシート全体の自動バックアップ（毎日、Excel形式でドライブに保存） =====
function backupFolder_() {
  const it = DriveApp.getFoldersByName(BACKUP_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(BACKUP_FOLDER);
}
function backupNow() {
  const ss = ss_(), folder = backupFolder_();
  const name = ss.getName() + ' ' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HHmm');
  try {
    const url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx';
    const blob = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }).getBlob().setName(name + '.xlsx');
    folder.createFile(blob);
  } catch (e) {
    DriveApp.getFileById(ss.getId()).makeCopy(name, folder);   // Excel 形式で保存できないときは、スプレッドシートのコピーを残す
  }
  // 古いものから削除して BACKUP_KEEP 件だけ残す
  const files = [], it = folder.getFiles();
  while (it.hasNext()) files.push(it.next());
  const keepId = PropertiesService.getScriptProperties().getProperty('ARCHIVE_ID');
  for (let i = files.length - 1; i >= 0; i--) if (files[i].getId() === keepId || files[i].getName().indexOf(ss.getName() + ' ') !== 0) files.splice(i, 1);   // バックアップ以外は消さない
  files.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  files.slice(BACKUP_KEEP).forEach(function (f) { f.setTrashed(true); });
  return name;
}
// メニューから：毎日午前3時ごろの保守（バックアップ・古い結果のアーカイブ・集計の更新）を有効にする（すぐに1回目のバックアップも作る）
function enableDailyBackup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { const f = t.getHandlerFunction(); if (f === 'backupNow' || f === 'dailyJob') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dailyJob').timeBased().everyDays(1).atHour(3).inTimezone(TZ).create();   // バックアップ・アーカイブ・集計の更新
  const name = backupNow();
  SpreadsheetApp.getActiveSpreadsheet().toast('毎日の自動バックアップ（と古い結果のアーカイブ・集計の更新）を有効にしました。ドライブのフォルダ「' + BACKUP_FOLDER + '」に「' + name + '」を作りました（' + BACKUP_KEEP + '日分を残します）。', 'バックアップ', 10);
}
function backupFromMenu() {
  const name = backupNow();
  SpreadsheetApp.getActiveSpreadsheet().toast('ドライブのフォルダ「' + BACKUP_FOLDER + '」に「' + name + '」を保存しました。', 'バックアップ', 8);
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


// ===== その学生の記録を集計して返す（画面の復元用）=====
function emptyStats_() {
  return { tries: 0, answered: 0, correct: 0, best: null, dur: 0,
    bestTimes: { 'être': null, aller: null, avoir: null, faire: null, mix: null } };
}

// =====================================================================
//  生徒ごとの集計（シート「生徒データ」に1人1行）
//  結果が届くたびにその人の行だけ更新するので、結果シートが何行になっても速さは変わらない。
// =====================================================================
const SD_HEADERS = ['学生ID', '氏名', '更新日時', 'データ（自動・編集しない）'];
const SD_RECENT = 400;          // 学習記録ページに出す「最近の記録」の件数
const SD_RIDS = 80;             // 再送の重複チェックに使う、最近の送信番号の数
const SD_MAX = 45000;           // 1セルに入れる最大文字数

// ロック：1回の処理の中で二重に取らないよう、取っているかどうかを覚えておく
let LOCKED_ = false;
function withLock_(ms, fn) {
  if (LOCKED_) return fn();
  const lock = LockService.getScriptLock();
  lock.waitLock(ms);
  LOCKED_ = true;
  try { return fn(); } finally { LOCKED_ = false; lock.releaseLock(); }
}
function newData_(name) {
  return { v: 2, name: name || '', apps: { conj: emptyStats_(), grammar: emptyStats_(), talk: emptyStats_() },
    dayCount: {}, hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    dur: 0, recent: [], rids: [], last: '' };
}
function sdSheet_(ss) {
  let sh = ss.getSheetByName(SHEET.studentData);
  if (!sh) {
    sh = ss.insertSheet(SHEET.studentData);
    sh.getRange(1, 1, 1, SD_HEADERS.length).setValues([SD_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');
    try { sh.hideSheet(); } catch (e) {}
  }
  return sh;
}
// 1件の結果を集計に足す。e = {t:Date, app, section(結果シートの表記), score, total, timeSec, rank, dur, rid}
const LABEL_TO_SEC_ = (function () { const o = {}; Object.keys(SECTION_LABEL).forEach(function (k) { o[SECTION_LABEL[k]] = k; }); return o; })();
const LABEL_TO_APP_ = (function () { const o = {}; Object.keys(APP_LABEL).forEach(function (k) { o[APP_LABEL[k]] = k; }); return o; })();
function sdApply_(d, e) {
  const st = d.apps[e.app];
  if (!st) return;
  const day = Utilities.formatDate(e.t, TZ, 'yyyy-MM-dd');
  d.dayCount[day] = (d.dayCount[day] || 0) + 1;
  const hr = Number(Utilities.formatDate(e.t, TZ, 'H'));
  if (hr >= 0 && hr < 24) d.hours[hr]++;
  const dur = Number(e.dur) || 0;
  st.tries++; st.answered += e.total; st.correct += e.score; st.dur = (st.dur || 0) + dur;
  if (st.best === null || e.score > st.best) st.best = e.score;
  if (e.app === 'conj' && e.rank && Number(e.timeSec) > 0) {
    const key = LABEL_TO_SEC_[e.section];
    if (key) {
      const ms = Math.round(Number(e.timeSec) * 1000);
      if (st.bestTimes[key] === null || ms < st.bestTimes[key]) st.bestTimes[key] = ms;
    }
  }
  d.dur += dur;
  const t = Utilities.formatDate(e.t, TZ, "yyyy-MM-dd'T'HH:mm");
  d.last = t;
  d.recent.push({ t: t, app: e.app, sec: String(e.section || ''), score: e.score, total: e.total, dur: dur });
  if (d.recent.length > SD_RECENT) d.recent = d.recent.slice(-SD_RECENT);
  if (e.rid) { d.rids.push(String(e.rid)); if (d.rids.length > SD_RIDS) d.rids = d.rids.slice(-SD_RIDS); }
}
// 結果シート（またはアーカイブ）の1行 → sdApply_ に渡す形
function rowToEntry_(r) {
  const t = r[COL.time - 1] instanceof Date ? r[COL.time - 1] : new Date(r[COL.time - 1]);
  if (isNaN(t)) return null;
  const app = LABEL_TO_APP_[r[COL.app - 1]];
  if (!app) return null;
  return { t: t, app: app, section: String(r[COL.section - 1] || ''), score: Number(r[COL.score - 1]) || 0,
    total: Number(r[COL.total - 1]) || 0, timeSec: r[COL.sec - 1], rank: r[COL.rank - 1], dur: Number(r[COL.dur - 1]) || 0,
    rid: String(r[COL.rid - 1] || '') };
}
// 生徒データの行番号（キャッシュつき）
function sdFind_(sh, cache, id) {
  const c = Number(cache.get('sd:' + id) || 0);
  if (c >= 2 && c <= sh.getLastRow() && normId_(sh.getRange(c, 1).getValue()) === id) return c;
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (normId_(ids[i][0]) === id) { cache.put('sd:' + id, String(i + 2), 21600); return i + 2; }
  }
  return 0;
}
// その人のデータを読む。まだ無ければ、結果シートとアーカイブから一度だけ作る
function sdLoad_(ss, id, name) {
  const sh = sdSheet_(ss), cache = CacheService.getScriptCache();
  const row = sdFind_(sh, cache, id);
  if (row) {
    try {
      const d = JSON.parse(String(sh.getRange(row, 4).getValue()));
      if (d && d.v === 2) { if (name) d.name = name; return { row: row, data: d }; }
    } catch (e) {}
  }
  // まだ無い（新しい学生、または初回）：ほかの処理と重ならないようにして、結果から一度だけ作る
  return withLock_(15000, function () {
    const again = sdFind_(sh, cache, id);
    if (again && again !== row) {
      try { const d0 = JSON.parse(String(sh.getRange(again, 4).getValue())); if (d0 && d0.v === 2) return { row: again, data: d0 }; } catch (e) {}
    }
    const d = newData_(name);
    eachResultRow_(ss, function (r) { if (normId_(r[COL.id - 1]) === id) { const e = rowToEntry_(r); if (e) sdApply_(d, e); } });
    const out = { row: again || row, data: d };
    sdSave_(ss, id, out);
    return out;
  });
}
function sdSave_(ss, id, sd) {
  const sh = sdSheet_(ss), d = sd.data;
  let json = JSON.stringify(d);
  while (json.length > SD_MAX && d.recent.length > 50) { d.recent = d.recent.slice(Math.floor(d.recent.length / 4)); json = JSON.stringify(d); }
  const rec = [id, safe_(d.name, 60), new Date(), json];
  if (sd.row) sh.getRange(sd.row, 1, 1, 4).setValues([rec]);
  else {
    sh.appendRow(rec);
    sd.row = sh.getLastRow();
    CacheService.getScriptCache().put('sd:' + id, String(sd.row), 21600);
  }
}
// クイズ画面が使う形（以前の statsFor_ と同じ）
function statsOut_(d) {
  const apps = {};
  Object.keys(d.apps).forEach(function (k) {
    const s = d.apps[k];
    apps[k] = { tries: s.tries, answered: s.answered, correct: s.correct, best: s.best, bestTimes: s.bestTimes, timeMs: (s.dur || 0) * 1000 };
  });
  return { days: Object.keys(d.dayCount).sort().slice(-400), apps: apps };
}
function statsFor_(ss, id) { return statsOut_(sdLoad_(ss, id).data); }
// 学習記録ページ用：全期間の集計と、最近の記録
function historyFor_(ss, id) {
  const d = sdLoad_(ss, id).data;
  const apps = {};
  Object.keys(d.apps).forEach(function (k) { const s = d.apps[k]; apps[k] = { n: s.tries, q: s.answered, c: s.correct, dur: s.dur || 0 }; });
  return { history: d.recent, agg: { dayCount: d.dayCount, hours: d.hours, apps: apps, dur: d.dur } };
}

// 結果シート → アーカイブの順に、全行を古い順にたどる（作り直し用）
function eachResultRow_(ss, fn) {
  const sources = [];
  const aid = PropertiesService.getScriptProperties().getProperty('ARCHIVE_ID');
  if (aid) { try { const a = SpreadsheetApp.openById(aid).getSheetByName(SHEET.results); if (a) sources.push(a); } catch (e) {} }
  const r = ss.getSheetByName(SHEET.results);
  if (r) sources.push(r);
  sources.forEach(function (sh) {
    const last = sh.getLastRow();
    for (let s = 2; s <= last; s += 5000) {
      const n = Math.min(5000, last - s + 1);
      sh.getRange(s, 1, n, N_COLS).getValues().forEach(fn);
    }
  });
}

// 結果を記録する（重複は生徒データの送信番号で判定し、結果シート全体は読まない）
function recordResult_(ss, user, v) {
  return withLock_(20000, function () {
    ensureSummaryV2_(ss);
    const sd = sdLoad_(ss, user.id, user.name);
    if (sd.data.rids.indexOf(v.rid) >= 0) return statsOut_(sd.data);   // 再送による重複は無視
    const now = new Date();
    const sh = resultsSheet_(ss), last = sh.getLastRow();
    const row = [now, Utilities.formatDate(now, TZ, 'yyyy-MM-dd'), user.id, safe_(user.name, 60),
      APP_LABEL[v.app], v.section, v.mode, v.score, v.total, v.timeSec, v.timeAttack ? '○' : '', v.rank, v.misses, v.rid, v.dur];
    const rng = sh.getRange(last + 1, 1, 1, N_COLS);
    rng.setNumberFormats([ROW_FORMATS]);
    rng.setValues([row]);
    sdApply_(sd.data, { t: now, app: v.app, section: v.section, score: v.score, total: v.total,
      timeSec: v.timeSec, rank: v.rank, dur: v.dur, rid: v.rid });
    sdSave_(ss, user.id, sd);
    summaryRow_(ss, user.id, sd.data);
    return statsOut_(sd.data);
  });
}

// =====================================================================
//  集計表（先生が見る「集計」シート）：計算式を使わず、値で書く
// =====================================================================
const SUMMARY_HEADERS = ['学生ID', '氏名', 'ラウンド数', '学習時間(分)', '学習日数', '直近7日の学習日数', '最終学習日', '累計解答数', '正答率',
  '動詞活用(回)', '文法練習(回)', '会話練習(回)', '最速 être(秒)', '最速 aller(秒)', '最速 avoir(秒)', '最速 faire(秒)', '最速 総まとめ(秒)'];
const SUMMARY_FORMATS = ['@', '@', '0', '0', '0', '0', '@', '0', '0%', '0', '0', '0', '0.0', '0.0', '0.0', '0.0', '0.0'];
function summaryValues_(id, name, d) {
  const a = d.apps, tries = a.conj.tries + a.grammar.tries + a.talk.tries;
  const q = a.conj.answered + a.grammar.answered + a.talk.answered, c = a.conj.correct + a.grammar.correct + a.talk.correct;
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const from = Utilities.formatDate(new Date(Date.now() - 6 * 86400000), TZ, 'yyyy-MM-dd');
  const days = Object.keys(d.dayCount);
  const bt = function (k) { const ms = a.conj.bestTimes[k]; return ms == null ? '' : Math.round(ms / 100) / 10; };
  return [id, name || d.name || '', tries, Math.round(d.dur / 60), days.length,
    days.filter(function (x) { return x >= from && x <= today; }).length,
    d.last ? d.last.slice(0, 10) : '', q, q ? c / q : '',
    a.conj.tries, a.grammar.tries, a.talk.tries, bt('être'), bt('aller'), bt('avoir'), bt('faire'), bt('mix')];
}
function summarySheet_(ss) {
  const sh = ensureSheet_(ss, SHEET.summary, null);
  sh.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  return sh;
}
function summaryRow_(ss, id, d) {
  const sh = summarySheet_(ss), last = sh.getLastRow();
  let row = 0;
  if (last >= 2) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (normId_(ids[i][0]) === id) { row = i + 2; break; }
  }
  if (!row) row = last + 1;
  const rng = sh.getRange(row, 1, 1, SUMMARY_HEADERS.length);
  rng.setNumberFormats([SUMMARY_FORMATS]);
  rng.setValues([summaryValues_(id, lookupRoster_(ss, id) || d.name, d)]);
}
// 全員分を書き直す（毎日の保守と、メニューから）。名簿の順に並べ、名簿にない人は後ろに
function refreshSummary_(ss) {
  const sh = summarySheet_(ss), sd = sdSheet_(ss);
  const data = {};
  if (sd.getLastRow() >= 2) {
    sd.getRange(2, 1, sd.getLastRow() - 1, 4).getValues().forEach(function (r) {
      try { const d = JSON.parse(String(r[3])); if (d && d.v === 2) data[normId_(r[0])] = d; } catch (e) {}
    });
  }
  const rows = [], seen = {};
  const roster = ss.getSheetByName(SHEET.roster);
  if (roster && roster.getLastRow() >= 2) {
    roster.getRange(2, 1, roster.getLastRow() - 1, 2).getValues().forEach(function (r) {
      const id = normId_(r[0]);
      if (!id || seen[id]) return;
      seen[id] = 1;
      rows.push(summaryValues_(id, String(r[1] || ''), data[id] || newData_(String(r[1] || ''))));
    });
  }
  Object.keys(data).forEach(function (id) { if (!seen[id]) rows.push(summaryValues_(id, data[id].name, data[id])); });
  const last = sh.getLastRow();
  if (last >= 2) sh.getRange(2, 1, last - 1, Math.max(sh.getLastColumn(), SUMMARY_HEADERS.length)).clearContent();
  if (rows.length) {
    sh.getRange(2, 1, rows.length, SUMMARY_HEADERS.length).setValues(rows);
    sh.getRange(2, 1, rows.length, SUMMARY_HEADERS.length).setNumberFormats(rows.map(function () { return SUMMARY_FORMATS; }));
  }
}
// 生徒データを結果シート（とアーカイブ）から全員分作り直す。初回の切り替えと、メニューから
function rebuildAll_(ss) {
  const map = {}, names = {};
  eachResultRow_(ss, function (r) {
    const id = normId_(r[COL.id - 1]); if (!id) return;
    const e = rowToEntry_(r); if (!e) return;
    if (!map[id]) map[id] = newData_(String(r[COL.name - 1] || ''));
    sdApply_(map[id], e);
  });
  const sh = sdSheet_(ss), last = sh.getLastRow();
  if (last >= 2) sh.getRange(2, 1, last - 1, 4).clearContent();
  const rows = Object.keys(map).map(function (id) {
    const d = map[id];
    let json = JSON.stringify(d);
    while (json.length > SD_MAX && d.recent.length > 50) { d.recent = d.recent.slice(Math.floor(d.recent.length / 4)); json = JSON.stringify(d); }
    return [id, safe_(d.name, 60), new Date(), json];
  });
  if (rows.length) sh.getRange(2, 1, rows.length, 4).setValues(rows);
  const cache = CacheService.getScriptCache();
  rows.forEach(function (r, i) { cache.put('sd:' + r[0], String(i + 2), 21600); });
  refreshSummary_(ss);
  PropertiesService.getScriptProperties().setProperty('SUMMARY_V', '2');
  return rows.length;
}
// 新しい方式に切り替わっていなければ、一度だけ作り直す
function ensureSummaryV2_(ss) {
  if (PropertiesService.getScriptProperties().getProperty('SUMMARY_V') === '2') return;
  withLock_(30000, function () {
    if (PropertiesService.getScriptProperties().getProperty('SUMMARY_V') !== '2') rebuildAll_(ss);
  });
}

// =====================================================================
//  古い結果のアーカイブ：結果シートが ARCHIVE_AT 行を超えたら、新しい ARCHIVE_KEEP 行を残して
//  古い行を別ファイル「Naralingo 結果アーカイブ」に移す（毎日の保守で実行）
// =====================================================================
const ARCHIVE_AT = 3000, ARCHIVE_KEEP = 1000;
function archiveBook_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ARCHIVE_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const book = SpreadsheetApp.create('Naralingo 結果アーカイブ');
  const sh = book.getSheets()[0];
  sh.setName(SHEET.results);
  sh.getRange(1, 1, 1, N_COLS).setValues([RESULT_HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  props.setProperty('ARCHIVE_ID', book.getId());
  try { const it = DriveApp.getFoldersByName('Naralingo 結果アーカイブ'); DriveApp.getFileById(book.getId()).moveTo(it.hasNext() ? it.next() : DriveApp.createFolder('Naralingo 結果アーカイブ')); } catch (e) {}
  return book;
}
function archiveOld_(ss) {
  const sh = ss.getSheetByName(SHEET.results);
  if (!sh) return 0;
  const n = sh.getLastRow() - 1;
  if (n <= ARCHIVE_AT) return 0;
  return withLock_(30000, function () {
    ensureSummaryV2_(ss);   // 移す前に、生徒データがそろっていることを確かめる
    const move = sh.getLastRow() - 1 - ARCHIVE_KEEP;
    if (move <= 0) return 0;
    const vals = sh.getRange(2, 1, move, N_COLS).getValues();
    const a = archiveBook_().getSheetByName(SHEET.results);
    const al = a.getLastRow();
    a.getRange(al + 1, 1, move, N_COLS).setValues(vals);
    SpreadsheetApp.flush();
    if (a.getLastRow() !== al + move) throw new Error('アーカイブへの書き込みを確認できませんでした');   // 写せたのを確かめてから消す
    sh.deleteRows(2, move);
    return move;
  });
}
// 毎日の保守：バックアップ → 古い結果のアーカイブ → 集計表の更新（直近7日など）
function dailyJob() {
  const ss = ss_();
  try { backupNow(); } catch (e) { console.error('backup', e); }
  try { archiveOld_(ss); } catch (e) { console.error('archive', e); }
  try { ensureSummaryV2_(ss); refreshSummary_(ss); } catch (e) { console.error('summary', e); }
}
function rebuildFromMenu() {
  const n = withLock_(60000, function () { return rebuildAll_(SpreadsheetApp.getActiveSpreadsheet()); });
  SpreadsheetApp.getActiveSpreadsheet().toast(n + '人分の生徒データと集計を、結果シートとアーカイブから作り直しました。', '作り直し', 8);
}
function refreshSummaryFromMenu() {
  refreshSummary_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getActiveSpreadsheet().toast('集計を更新しました。', '集計', 5);
}

// ===== 初期設定・ID発行 =====
function onOpen() {
  SpreadsheetApp.getUi().createMenu('活用クイズ')
    .addItem('初期設定（シート作成）', 'setup')
    .addItem('名簿の空欄にIDを発行', 'issueIds')
    .addItem('共通パスワードを設定', 'setPassword')
    .addSeparator()
    .addItem('毎日の自動バックアップを有効にする', 'enableDailyBackup')
    .addItem('今すぐバックアップ', 'backupFromMenu')
    .addItem('集計を今すぐ更新', 'refreshSummaryFromMenu')
    .addItem('生徒データを作り直す（結果とアーカイブから）', 'rebuildFromMenu')
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
  progSheet_(ss);
  noticeSheet_(ss);
  rebuildAll_(ss);   // 生徒データと集計を作る（すでにあれば作り直す）
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
