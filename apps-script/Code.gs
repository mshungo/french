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
 *  5. 登録フォームを使うとき: フォームの回答先をこのスプレッドシートの「フォーム回答」シート（タイムスタンプ／氏名／希望ID／ニックネーム）にして、
 *     メニュー「活用クイズ > フォーム回答を名簿に反映（以後は自動）」を一度実行する。
 *     希望ID→名簿A、ニックネーム→名簿B（アプリに出る名前）、氏名→名簿F（先生用。アプリには出ない）に写る。
 *     IDの形が使えない・ほかの人と重複などで写せなかった行は、「フォーム回答」の「名簿への反映」列に理由が出る。
 *     同じ氏名・同じIDで出し直すと、ニックネームだけ更新される。
 *     手で追加するとき: シート「名簿」のB列に名前、C列に名字のローマ字（例：MORITA）を書き、
 *     メニュー「活用クイズ > 名簿の空欄にIDを発行」を実行する → A列に「名字＋英数字4文字」のID（例：MORITA7K3Q）が入る。
 *     IDが漏れたときは、A列のIDを消して再発行すれば、古いIDは使えなくなる（記録は古いIDのまま残る）。
 *     そのIDを学生に伝える。いつでも追加できる。
 *     利用をやめさせたい学生は、名簿のその行を削除する（結果の記録は残る）。
 *
 * コードを書き換えたあとは、「デプロイを管理 > 編集 > 新バージョン」で反映する。
 */

// ===== 以下は通常変更しない =====
const VERSION = '2026-10-08b';   // 公開中のコードがどれか確認するための番号（ウェブアプリのURLを開くと表示）
const TZ = 'Asia/Tokyo';
const SHEET = { roster: '名簿', results: '結果', summary: '集計', feedback: 'フィードバック', progress: '進み具合', studentData: '生徒データ' };
const PROG_HEADERS = ['学生ID', '教材データ', '更新日時', '解答数', 'データ（自動バックアップ・編集しない）'];
const PROG_KEY_RE = /^(conjQuizStats_v4|talkQuiz_v1|gramQuiz_L[1-9]_v1|conjQuizDays|nlWelcome_v1|nlStamp_v1)$/;   // 端末の記録のうち、バックアップするもの
const PROG_MAX = 45000;      // 1件あたりの最大文字数（セルの上限は5万字）
const BACKUP_FOLDER = 'Naralingo バックアップ';
const BACKUP_KEEP = 30;   // 自動バックアップを何日分残すか
const PRACTICE_ID = 'NARAF26';   // 練習用ID（名簿には載せない）。フィードバックの送信だけ受け付ける
const FEEDBACK_HEADERS = ['日時', '学生ID', '氏名', 'ページ', '種類', 'コメント', 'そのときの画面', '端末', '対応メモ'];
const FEEDBACK_KINDS = ['感想', '改善のアイデア', 'うまく動かない', '答えがおかしい', '選択肢がおかしい', '訳・解説がおかしい', '音声・表示の不具合', 'その他'];
const ANON_FEEDBACK = { perHour: 30, perDay: 150 };   // ログイン前のひとことは、全員合わせてこの回数まで
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
function doGet(e) {
  // 動作確認用（URLをブラウザで開くと表示）。ログイン画面はここから「お知らせ」と鹿コーチの版番号も受け取る
  if (e && e.parameter && e.parameter.coach) {   // 鹿コーチのセリフ本体（版番号が変わったときだけ取りに来る）
    let c = { v: '', d: null };
    try { c = coachData_(); } catch (err) {}
    return json_({ ok: true, coachV: c.v, coach: c.d });
  }
  let notices = [], coachV = '';
  try { notices = notices_(); } catch (err) {}
  try { coachV = coachData_().v; } catch (err) {}
  return json_({ ok: true, service: 'conjugation-quiz', version: VERSION, password: password_() ? '設定済み' : '未設定', notices: notices, coachV: coachV });
}

// ===== 鹿コーチのセリフ（シート「鹿コーチ」で、いつでも足したり直したりできる）=====
// A列：使う（チェック） B列：種類 C列：フランス語（任意） D列：日本語訳（任意） E列：本文 F列：メモ（表示されない）
// 種類：勉強のコツ／動詞のコツ／文法のコツ／会話のコツ（E列の文が「勉強のコツ」として出る）
//       ことわざ／名言／フランス語の表現／フランスのこぼれ話（C・D列があれば « » つきで出し、E列は説明）
// サイトは「版番号」だけを毎回受け取り、変わったときだけ中身を取りに行く（ふだんの読み込みは増えない）。
const COACH_SHEET = '鹿コーチ';
const COACH_HEADERS = ['使う', '種類', 'フランス語（任意）', '日本語訳（任意）', '本文', 'メモ（表示されない）'];
const COACH_TIP_KINDS = { '勉強のコツ': 'general', '動詞のコツ': 'conj', '文法のコツ': 'grammar', '会話のコツ': 'talk' };
const COACH_STORY_KINDS = ['ことわざ', '名言', 'フランス語の表現', 'フランスのこぼれ話'];
const COACH_SEED = [["勉強のコツ", "", "", "一度にまとめて勉強するより、日をあけて何回か復習したほうが記憶に残りやすい（分散学習と呼ばれる方法）。1日10分でも、何日か続けるのが近道。"], ["勉強のコツ", "", "", "眠っている間に、その日に覚えたことが整理されると言われているよ。寝る前の5分の復習は、とてもお得な時間。"], ["勉強のコツ", "", "", "やる気は、始めてから出てくることが多いんだって。« L'appétit vient en mangeant. »（食欲は食べているうちに湧いてくる）ということわざもあるよ。"], ["勉強のコツ", "", "", "間違えた問題は「伸びしろ」。一度まちがえて正しい答えを見た問題は、はじめから当たった問題よりよく覚えていることも多いんだ。"], ["勉強のコツ", "", "", "声に出すと、目・口・耳を全部使うから覚えやすい。電車の中なら、口の中でつぶやくだけでも効果があるよ。"], ["勉強のコツ", "", "", "時間を計ると集中できる人もいれば、焦ってしまう人もいる。解いている画面の時間表示はタップでかくせるから、自分に合うほうでどうぞ。"], ["勉強のコツ", "", "", "「自分のこと」で文を作ると覚えやすい。好きな食べもの、出身地、週末の予定……教科書の文を、自分バージョンに書きかえてみると楽しいよ。"], ["動詞のコツ", "", "", "-er 動詞は、je parle／tu parles／il parle／ils parlent が全部同じ発音。変わるのはつづりだけだから、耳で覚えて、目でつづりを確かめるのがコツだよ。"], ["動詞のコツ", "", "", "être・avoir・aller・faire は形がばらばらだけど、いちばんよく使う動詞たち。je suis, tu es, il est… とリズムに乗せて唱えると、口が先に覚えてくれるよ。"], ["動詞のコツ", "", "", "nous の形は -ons で終わることが多い（nous avons, nous allons）。例外は nous sommes（être）。nous faisons は「フゾン」と読むのも、ちょっとしたひっかけポイント。"], ["動詞のコツ", "", "", "vous の形はふつう -ez。でも vous êtes・vous faites・vous dites の3つだけは -tes で終わる、特別な形なんだ。"], ["動詞のコツ", "", "", "ils の形は、ils sont・ils ont・ils vont・ils font と「-ont」がそろう4兄弟。まとめて覚えると忘れにくいよ。"], ["動詞のコツ", "", "", "活用は、文ごと覚えると強い。« Je vais à Nara. » « J'ai un chat. » みたいに自分のことで短い文を作ると、そのまま会話でも使えるよ。"], ["動詞のコツ", "", "", "j'ai・j'aime・j'habite のように、母音や無音の h で始まる動詞の前では je が j' になる（エリジオン）。書き取りで落としやすいところだから、ここだけ意識するだけでも点数が変わるよ。"], ["文法のコツ", "", "", "名詞は冠詞とセットで覚えるのがおすすめ。« livre » より « un livre »。男性か女性かが、いっしょに頭に入るよ。"], ["文法のコツ", "", "", "形容詞の女性形は、基本は -e を足すだけ（petit → petite）。-eux → -euse（curieux → curieuse）、-if → -ive（actif → active）のパターンを知っておくと楽になるよ。"], ["文法のコツ", "", "", "否定は ne … pas で動詞をはさむ。会話では ne が落ちて « Je sais pas. » と言うことも多いけれど、書くときは ne を忘れずにね。"], ["文法のコツ", "", "", "疑問文の作り方は3つ。語尾を上げる（Tu viens ?）／Est-ce que をつける／主語と動詞を入れかえる（Viens-tu ?）。会話でいちばんよく使うのは、語尾を上げるやり方。"], ["文法のコツ", "", "", "近い未来は aller ＋ 動詞の原形（Je vais partir.）、ついさっきのことは venir de ＋ 原形（Je viens de manger.）。「行く」と「来る」が、時間の矢印になっているんだ。"], ["文法のコツ", "", "", "à ＋ le は au、à ＋ les は aux、de ＋ le は du、de ＋ les は des にまとまる（縮約）。au Japon の au も、じつはこれ。"], ["文法のコツ", "", "", "目的語の代名詞（le, la, lui…）は動詞の前に置く。Je le vois.（それが見える）。英語とは順番がちがうけれど、日本語の「それを・見る」と同じ順番なんだ。声に出して慣れるのがいちばんの近道。"], ["文法のコツ", "", "", "記述式は「見てわかる」を「自分で書ける」に変える練習。少し時間がかかっても、自分の手で書いた答えは記憶に残りやすいよ。"], ["会話のコツ", "", "", "会話は完璧じゃなくて大丈夫。« Vous pouvez répéter ? »（もう一度言ってもらえますか？）が言えれば、会話はちゃんと続けられるよ。"], ["会話のコツ", "", "", "« Et toi ? » をつけると、質問が相手に返って会話が続く。« Ça va, merci. Et toi ? » だけで、立派な会話なんだ。"], ["会話のコツ", "", "", "相づちの « Ah bon ? »（へえ、そうなの？）や « C'est génial ! »（すごいね！）が言えると、ぐっと自然に聞こえるよ。"], ["会話のコツ", "", "", "聞き取りは、全部わからなくて当たり前。知っている単語を2つ3つ拾えたら、それで十分なスタートだよ。"], ["会話のコツ", "", "", "お手本の音声に、少し遅れて重ねるように声を出す「シャドーイング」は、発音とリズムをいっしょに鍛えられる練習法。"], ["会話のコツ", "", "", "フランス語は単語どうしがつながって聞こえる（リエゾン）。vous avez は「ヴザヴェ」。つながりに慣れると、聞き取りがぐっと楽になるよ。"], ["ことわざ", "Petit à petit, l'oiseau fait son nid.", "少しずつ、鳥は巣を作る。", "コツコツ続ければ、大きなことができるという意味。"], ["ことわざ", "Paris ne s'est pas fait en un jour.", "パリは一日にして成らず。", "日本では「ローマは一日にして成らず」が有名だけど、フランス語にはパリ版もあるんだ。"], ["ことわざ", "C'est en forgeant qu'on devient forgeron.", "鉄を打つことで、鍛冶屋になる。", "日本語の「習うより慣れろ」に近いね。"], ["ことわざ", "Les petits ruisseaux font les grandes rivières.", "小さな小川が、大きな川になる。", "「塵も積もれば山となる」。1日1ラウンドも、こうやって大きくなっていくよ。"], ["ことわざ", "La nuit porte conseil.", "夜は助言を運んでくる。", "迷ったら、一晩寝てから考えよう、という意味。"], ["ことわざ", "Une hirondelle ne fait pas le printemps.", "ツバメ一羽で、春にはならない。", "一度の結果だけで決めつけない、ということ。点数がふるわない日にも思い出してね。"], ["ことわざ", "Après la pluie, le beau temps.", "雨のあとは、晴れ。", "つらいことのあとには、いいことが来るよ。"], ["ことわざ", "Vouloir, c'est pouvoir.", "望むことは、できること。", "「意志あるところに道あり」。"], ["ことわざ", "Mieux vaut tard que jamais.", "遅くても、しないよりはまし。", "久しぶりの日にぴったりの言葉。"], ["ことわざ", "Qui ne risque rien n'a rien.", "何も賭けない人は、何も得られない。", "記述式にはじめて挑戦するときに、そっと思い出してみて。"], ["ことわざ", "Ce n'est pas la mer à boire.", "海を飲み干すほどのことじゃない。", "「たいしたことないよ、だいじょうぶ」という励まし。"], ["ことわざ", "Il faut tourner sept fois sa langue dans sa bouche avant de parler.", "話す前に、舌を口の中で7回まわせ。", "よく考えてから話そう、という意味。"], ["ことわざ", "Tout vient à point à qui sait attendre.", "待つことを知る人には、すべてがちょうどよく訪れる。", "「待てば海路の日和あり」。"], ["ことわざ", "Rien ne sert de courir ; il faut partir à point.", "走っても意味はない。ちょうどいいときに出発することだ。", "ラ・フォンテーヌの寓話「ウサギとカメ」の一節。"], ["名言", "Je pense, donc je suis.", "われ思う、ゆえにわれあり。", "デカルト『方法序説』（1637年）の有名な言葉。je suis は être の活用だね。"], ["名言", "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", "心で見なくちゃ、よく見えない。大切なものは目に見えない。", "サン＝テグジュペリ『星の王子さま』（1943年）で、キツネが王子さまに教える言葉。"], ["名言", "Il faut cultiver notre jardin.", "わたしたちの畑を耕さなければならない。", "ヴォルテール『カンディード』（1759年）の最後の一文。目の前のことをこつこつと、という読み方もあるよ。"], ["名言", "L'homme n'est qu'un roseau, le plus faible de la nature ; mais c'est un roseau pensant.", "人間は自然のなかでいちばん弱い一本の葦にすぎない。だが、それは考える葦である。", "パスカル『パンセ』の言葉。"], ["名言", "Impossible n'est pas français.", "「不可能」はフランス語ではない。", "ナポレオンの言葉として知られているよ。"], ["フランス語の表現", "Il pleut des cordes.", "ロープが降っている。", "「どしゃ降り」のこと。雨がロープみたいに太く見える、というイメージ。"], ["フランス語の表現", "Être dans la lune.", "月の中にいる。", "「ぼんやりしている」という意味。授業中は気をつけて？"], ["フランス語の表現", "Coûter les yeux de la tête.", "頭の目玉ほどの値段がする。", "「ものすごく高い」という意味。"], ["フランス語の表現", "Poser un lapin à quelqu'un.", "だれかにウサギを置く。", "「約束をすっぽかす」という意味。なぜウサギなのかは、はっきりしないんだって。"], ["フランス語の表現", "Avoir un chat dans la gorge.", "のどに猫がいる。", "「声がかすれる」という意味。発音練習のしすぎに注意？"], ["フランスのこぼれ話", "", "", "70 は soixante-dix（60＋10）、80 は quatre-vingts（4×20）、90 は quatre-vingt-dix（4×20＋10）。ベルギーやスイスでは、70 を septante、90 を nonante と言うよ。"], ["フランスのこぼれ話", "", "", "7月14日はフランスの「革命記念日」（le 14 Juillet）。1789年のバスティーユ襲撃にちなむ祝日で、パリでは軍事パレードや花火があるんだ。"], ["フランスのこぼれ話", "", "", "フランスでは、お店に入るとき « Bonjour ! » とあいさつするのが大切なマナー。言わないと、ちょっと失礼に思われることもあるよ。"], ["フランスのこぼれ話", "", "", "頬を寄せるあいさつ « la bise » の回数は、地域によってちがう。2回が多いけれど、3回や4回の地域もあるんだ。"], ["フランスのこぼれ話", "", "", "バゲットを作る職人の技と文化は、2022年にユネスコの無形文化遺産に登録されたよ。"], ["フランスのこぼれ話", "", "", "エッフェル塔は、1889年のパリ万国博覧会のために建てられた。建てる前には「醜い」と反対する芸術家たちもいたんだって。"], ["フランスのこぼれ話", "", "", "フランス語を話す人は、世界に3億人以上いるとされているよ（フランス語圏国際機関 OIF の推計）。アフリカにも話す人がたくさんいるんだ。"], ["フランスのこぼれ話", "", "", "日本語になったフランス語：アンケート（enquête）、アトリエ（atelier）、クレヨン（crayon）、シュークリーム（chou à la crème）、デジャヴ（déjà-vu）。意外と身近でしょう？"], ["フランスのこぼれ話", "", "", "1635年にできたアカデミー・フランセーズは、フランス語の辞書を作り続けている機関。会員は40人で、「不滅の人々（les Immortels）」と呼ばれているよ。"], ["フランスのこぼれ話", "", "", "太陽は le soleil（男性名詞）、月は la lune（女性名詞）。ドイツ語では逆で、太陽が女性、月が男性なんだ。名詞の性は言語によってさまざま。"], ["フランスのこぼれ話", "", "", "フランスの学校の成績は、20点満点がふつう。10点が合格ライン、16点以上ならとても優秀。20点はめったに出ないんだって。"], ["フランスのこぼれ話", "", "", "« Bon appétit ! » は「めしあがれ」。食事の前に、みんなで言い合うことが多いよ。"]];

// シートを作り、今サイトに入っているセリフを書き出す（すでにあれば何もしない）
function createCoachSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(COACH_SHEET);
  if (sh && sh.getLastRow() > 1) { ss.toast('「' + COACH_SHEET + '」シートはもうあります。行を足したり直したりすると、数分以内にサイトに反映されます。', '鹿コーチ', 8); return; }
  if (!sh) sh = ss.insertSheet(COACH_SHEET);
  sh.getRange(1, 1, 1, COACH_HEADERS.length).setValues([COACH_HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  const rows = COACH_SEED.map(function (r) { return [true, r[0], r[1], r[2], r[3], '']; });
  sh.getRange(2, 1, rows.length, COACH_HEADERS.length).setValues(rows);
  try {
    sh.getRange(2, 1, 400, 1).insertCheckboxes();
    const kinds = Object.keys(COACH_TIP_KINDS).concat(COACH_STORY_KINDS);
    sh.getRange(2, 2, 400, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(kinds, true).setAllowInvalid(false).build());
    sh.setColumnWidth(2, 130); sh.setColumnWidth(3, 260); sh.setColumnWidth(4, 220); sh.setColumnWidth(5, 420);
    sh.getRange(2, 3, 400, 3).setWrap(true);
  } catch (e) {}
  CacheService.getScriptCache().remove('coach');
  ss.toast('「' + COACH_SHEET + '」シートを作りました（' + rows.length + '件）。A列のチェックを外すと、そのセリフは出なくなります。', '鹿コーチ', 10);
}
// シートの中身。シートがなければ { v:'', d:null }
function coachData_() {
  const cache = CacheService.getScriptCache();
  const c = cache.get('coach');
  if (c) { try { return JSON.parse(c); } catch (e) {} }
  const sh = ss_().getSheetByName(COACH_SHEET);
  let out = { v: '', d: null };
  if (sh && sh.getLastRow() >= 2) {
    const d = { tips: { general: [], conj: [], grammar: [], talk: [] }, stories: [] };
    sh.getRange(2, 1, Math.min(sh.getLastRow() - 1, 400), 5).getValues().forEach(function (r) {
      if (r[0] !== true) return;
      const kind = String(r[1] || '').trim(), fr = safe_(r[2], 200), ja = safe_(r[3], 200), body = safe_(r[4], 400);
      if (COACH_TIP_KINDS[kind]) { if (body) d.tips[COACH_TIP_KINDS[kind]].push(body); return; }
      if (COACH_STORY_KINDS.indexOf(kind) >= 0 && (body || fr)) d.stories.push({ t: kind, fr: fr, ja: ja, n: body });
    });
    const json = JSON.stringify(d);
    const dig = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, json, Utilities.Charset.UTF_8);
    out = { v: dig.slice(0, 6).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''), d: d };
  }
  try { cache.put('coach', JSON.stringify(out), 1800); } catch (e) {}   // 30分。シートを書きかえたときは onEdit ですぐ消す
  return out;
}

// ===== お知らせ（シート「お知らせ」でA列にチェックを入れた行を、ログイン画面とメニューの上に出す）=====
const NOTICE_SHEET = 'お知らせ';
const NOTICE_HEADERS = ['表示する', '種類（お知らせ／期間限定／イベント／注意／障害）', '本文（太字・色・下線・リンクなどの装飾もそのまま出ます）', 'メモ（表示されない）'];
const NOTICE_KINDS = ['お知らせ', '期間限定', 'イベント', '注意', '障害'];   // ほかの語はすべて「お知らせ」として出す
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
    const n = Math.min(sh.getLastRow() - 1, 30), vals = sh.getRange(2, 1, n, 3).getValues();
    let rich = null, cell = null;
    try {
      const rg = sh.getRange(2, 3, n, 1);
      rich = rg.getRichTextValues();
      cell = { w: rg.getFontWeights(), st: rg.getFontStyles(), ln: rg.getFontLines(), col: rg.getFontColors() };   // セル全体にかけた装飾
    } catch (e) {}
    vals.forEach(function (r, i) {
      const on = r[0] === true || String(r[0]).toUpperCase() === 'TRUE' || r[0] === '○';
      if (!on || out.length >= 3) return;
      const def = cell ? { b: cell.w[i][0] === 'bold', i: cell.st[i][0] === 'italic', u: cell.ln[i][0] === 'underline', s: cell.ln[i][0] === 'line-through', c: String(cell.col[i][0] || '') } : {};
      const runs = noticeRuns_(rich && rich[i] && rich[i][0], r[2], def);
      const text = runs.map(function (x) { return x.t; }).join('').trim();
      if (!text) return;
      const item = { kind: NOTICE_KINDS.indexOf(String(r[1]).trim()) >= 0 ? String(r[1]).trim() : 'お知らせ', text: text };
      if (runs.some(function (x) { return Object.keys(x).length > 1; })) item.rich = runs;   // 文字装飾があるときだけ送る
      out.push(item);
    });
  }
  cache.put('notices', JSON.stringify(out), 60);   // 1分間は読み直さない（書き換えると1分以内に反映）
  return out;
}
/* セルの文字装飾（太字・斜体・下線・取り消し線・文字色・リンク）を、区切りごとの小さな記録にする。
   送るのは文字と装飾の種類だけ（HTMLは送らない）。表示する側で安全に組み立てる */
function noticeRuns_(rv, plain, def) {
  def = def || {};
  const clean = function (t) { return String(t || '').replace(/[\u0000-\u0009\u000b-\u001f]/g, ' '); };
  const out = [];
  let len = 0;
  const push = function (t, st, url) {
    t = clean(t);
    if (!t || len >= 400) return;
    t = t.slice(0, 400 - len); len += t.length;
    const x = { t: t };
    // 部分ごとの装飾があればそれを、なければセル全体の装飾を使う
    const get = function (fn, d) { try { const v = st && st[fn] ? st[fn]() : null; return v === null || v === undefined ? d : v; } catch (e) { return d; } };
    if (get('isBold', def.b)) x.b = 1;
    if (get('isItalic', def.i)) x.i = 1;
    if (get('isUnderline', def.u)) x.u = 1;
    if (get('isStrikethrough', def.s)) x.s = 1;
    const col = String(get('getForegroundColor', def.c) || '');
    if (/^#[0-9a-f]{6}$/i.test(col) && !/^#000000$/i.test(col)) x.c = col.toLowerCase();
    if (url && /^https?:\/\//i.test(url)) x.h = String(url).slice(0, 500);
    out.push(x);
  };
  try {
    if (rv && rv.getRuns) {
      rv.getRuns().forEach(function (run) { push(run.getText(), run.getTextStyle(), run.getLinkUrl && run.getLinkUrl()); });
      if (out.length > 40) { const t = out.map(function (x) { return x.t; }).join(''); return [{ t: t }]; }
      if (out.length) return out;
    }
  } catch (e) {}
  out.length = 0; len = 0;
  push(plain, null, null);
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

  // ログイン画面の「ひとことポスト」（IDなし）
  if (req.action === 'feedback' && !normId_(req.id)) {
    if (!rateOk_(cache, 'f:anon:h', ANON_FEEDBACK.perHour, 3600) || !rateOk_(cache, 'f:anon:d', ANON_FEEDBACK.perDay, 86400)) return { ok: false, error: 'rate' };
    return saveFeedback_(ss, { id: '（ログイン前）', name: '' }, req.feedback);
  }

  const pass = password_();
  if (!pass) return { ok: false, error: 'nopass' };   // 共通パスワードが未設定
  const id = normId_(req.id);
  const pwOk = normPw_(req.pw) === pass;
  const row = (pwOk && ID_RE.test(id)) ? rosterRow_(ss, id) : null;   // パスワード違い・名簿にいなければ null
  let name = row ? row.name : null;
  if (name === null && pwOk && id === PRACTICE_ID && req.action === 'feedback') name = '練習用';
  if (name === null) {
    addFail_(cache);
    return { ok: false, error: 'auth' };
  }
  const user = { id: id, name: name || id };            // 先生のシートに書く名前（サーバーの中だけで使う）
  const pub = { id: id, name: row ? row.pub : '' };      // 学生の画面に返す名前：ニックネームだけ。本名は決して返さない

  if (req.action === 'sync' || req.action === 'history') {
    if (!rateOk_(cache, 'r:' + id, LIMIT.readPerMin, 60)) return { ok: false, error: 'rate' };
    try { touchLogin_(ss, cache, id); } catch (e) {}   // 失敗してもログインは止めない
    if (req.action === 'history') { const h = historyFor_(ss, id); return { ok: true, user: pub, history: h.history, agg: h.agg }; }
    const res = { ok: true, user: pub, stats: statsFor_(ss, id) };
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
    return { ok: true, user: pub, stats: recordResult_(ss, user, v) };
  }
  if (req.action === 'setnick') {   // 学生が自分でニックネームを決める（名簿のG列に書く）
    if (!rateOk_(cache, 'n:' + id, 6, 3600)) return { ok: false, error: 'rate' };
    const nick = cleanNick_(req.nick);
    if (!nick) return { ok: false, error: 'bad_request' };
    const done = withLock_(15000, function () { return setNick_(ss, id, nick); });
    return done ? { ok: true, user: { id: id, name: nick } } : { ok: false, error: 'auth' };
  }
  if (req.action === 'feedback') {
    if (!rateOk_(cache, 'f:h:' + id, LIMIT.feedbackPerHour, 3600) || !rateOk_(cache, 'f:d:' + id, LIMIT.feedbackPerDay, 86400)) return { ok: false, error: 'rate' };
    return saveFeedback_(ss, user, req.feedback);
  }
  return { ok: false, error: 'bad_request' };
}
function saveFeedback_(ss, user, f) {
  f = f || {};
  const known = FEEDBACK_KINDS.indexOf(f.kind) >= 0;
  const kind = known ? f.kind : 'その他';
  const text = safe_(f.text, 500), ctx = safe_(f.context, 800);
  if (!text && !ctx && !known) return { ok: false, error: 'bad_request' };
  const sh = ensureSheet_(ss, SHEET.feedback, FEEDBACK_HEADERS);
  sh.appendRow([new Date(), user.id, safe_(user.name, 40), safe_(f.page, 80), kind, text, ctx, safe_(f.device, 120), '']);
  return { ok: true };
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

// 名簿の1行：name＝B列（先生のシート用）、pub＝学生の画面に出してよい名前。
// F列「氏名（本名）」が入っている行（フォームで登録した行）だけ、B列はニックネームなので画面に返す。
// F列が空の行（以前の名簿）はB列が本名かもしれないので、画面には何も返さない（IDを表示）。
function rosterRow_(ss, id) {
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh || sh.getLastRow() < 2) return null;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, NICK_COL).getValues();
  for (const r of vals) {
    if (normId_(r[0]) === id) {
      const name = String(r[1] || '').trim();
      let pub = String(r[NICK_COL - 1] || '').trim();                       // G列：本人が決めたニックネーム（いちばん優先）
      if (!pub) pub = String(r[5] || '').trim() ? safe_(name, 20) : '';   // F列（本名）がある行は、B列がニックネーム
      if (!pub) { try { pub = formNick_(ss, id); } catch (e) { pub = ''; } }   // 名簿にF列がなくても、フォームで登録したニックネームがあれば使う
      return { name: name, pub: pub };
    }
  }
  return null;
}
// 名簿のG列「ニックネーム（本人が設定）」に書く
const NICK_COL = 7;
function setNick_(ss, id, nick) {
  const sh = ss.getSheetByName(SHEET.roster);
  if (!sh || sh.getLastRow() < 2) return false;
  if (!String(sh.getRange(1, NICK_COL).getValue()).trim()) sh.getRange(1, NICK_COL).setValue('ニックネーム（本人が設定）').setFontWeight('bold');
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (normId_(ids[i][0]) === id) { sh.getRange(i + 2, NICK_COL).setValue(nick); return true; }
  }
  return false;
}
// 登録フォームの回答から「ID → ニックネーム」（名簿に反映済みの行だけ。同じIDは新しい回答を優先）。5分キャッシュ
function formNick_(ss, id) {
  const cache = CacheService.getScriptCache();
  let map = null;
  const c = cache.get('formnick');
  if (c) { try { map = JSON.parse(c); } catch (e) { map = null; } }
  if (!map) {
    map = {};
    const fs = formSheet_(ss);
    if (fs && fs.getLastRow() >= 2) {
      const head = fs.getRange(1, 1, 1, fs.getLastColumn()).getValues()[0];
      const fc = formCols_(head);
      if (fc.id >= 0 && fc.nick >= 0) {
        fs.getRange(2, 1, fs.getLastRow() - 1, head.length).getValues().forEach(function (r) {
          if (fc.status >= 0 && String(r[fc.status] || '').indexOf('反映済み') !== 0) return;
          const k = normId_(r[fc.id]), v = cleanNick_(r[fc.nick]);
          if (k && v) map[k] = v;
        });
      }
    }
    try { cache.put('formnick', JSON.stringify(map), 300); } catch (e) {}
  }
  return map[id] || '';
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
    .addItem('フォーム回答を名簿に反映（以後は自動）', 'syncFormFromMenu')
    .addItem('鹿コーチのシートを作る（今のセリフを書き出す）', 'createCoachSheet')
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
  roster.getRange(1, 1, 1, 6).setValues([['学生ID', NICK_HEADER, '名字（ローマ字）', 'メモ(任意)', '最終ログイン', REAL_HEADER]]).setFontWeight('bold');
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


// ===== 登録フォームの回答 → 名簿 =====
// 先生が作ったGoogleフォームの回答シート（タイムスタンプ／氏名／希望ID／ニックネーム）を名簿に写す。
//   希望ID → 名簿A「学生ID」
//   ニックネーム → 名簿B（アプリに出る名前。空欄ならIDを表示）
//   氏名 → 名簿F「氏名（本名）」（先生用。アプリには出さない）
// 回答シートの右端「名簿への反映」に結果を書く。ここが空の行だけを処理するので、何度実行しても二重にはならない。
const FORM_SHEET = 'フォーム回答';
const FORM_STATUS = '名簿への反映';
const REAL_NAME_COL = 6;
const NICK_HEADER = 'ニックネーム（アプリに表示）';
const REAL_HEADER = '氏名（本名・アプリには出ない）';

function formCols_(head) {
  const h = head.map(function (x) { return String(x).replace(/\s/g, ''); });
  const has = function (k) { return h.findIndex(function (x) { return x.indexOf(k) >= 0; }); };
  return {
    real: h.findIndex(function (x) { return x.indexOf('氏名') >= 0 && x.indexOf('ニックネーム') < 0; }),
    id: has('希望ID'), nick: has('ニックネーム'),
    status: h.indexOf(FORM_STATUS)
  };
}
function formSheet_(ss) {
  const s0 = ss.getSheetByName(FORM_SHEET);
  if (s0) return s0;
  return ss.getSheets().find(function (sh) {
    if (sh.getLastRow() < 1 || sh.getLastColumn() < 1) return false;
    const c = formCols_(sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]);
    return c.id >= 0 && c.nick >= 0;
  }) || null;
}
function cleanNick_(s) {
  return safe_(String(s == null ? '' : s).normalize('NFKC').replace(/[<>]/g, '').replace(/\s+/g, ' '), 20);
}

// 回答のうち未処理の行を名簿に写す。戻り値 { added, updated, ng, msgs }
function syncFormToRoster_(ss) {
  return withLock_(30000, function () {
    const out = { added: 0, updated: 0, ng: 0 };
    const fs = formSheet_(ss);
    if (!fs || fs.getLastRow() < 2) return out;
    let head = fs.getRange(1, 1, 1, fs.getLastColumn()).getValues()[0];
    let c = formCols_(head);
    if (c.id < 0) return out;
    if (c.status < 0) { c.status = head.length; fs.getRange(1, c.status + 1).setValue(FORM_STATUS).setFontWeight('bold'); }
    const n = fs.getLastRow() - 1;
    const rows = fs.getRange(2, 1, n, Math.max(head.length, c.status + 1)).getValues();

    const rs = ss.getSheetByName(SHEET.roster) || ensureSheet_(ss, SHEET.roster, null);
    if (String(rs.getRange(1, 2).getValue()).trim() === '氏名' || !String(rs.getRange(1, 2).getValue()).trim()) rs.getRange(1, 2).setValue(NICK_HEADER).setFontWeight('bold');
    if (!String(rs.getRange(1, REAL_NAME_COL).getValue()).trim()) rs.getRange(1, REAL_NAME_COL).setValue(REAL_HEADER).setFontWeight('bold');
    let last = rs.getLastRow();
    const roster = last >= 2 ? rs.getRange(2, 1, last - 1, REAL_NAME_COL).getValues() : [];
    const byId = {};
    roster.forEach(function (r, i) { const x = normId_(r[0]); if (x) byId[x] = i; });
    const nk = function (s) { return String(s || '').normalize('NFKC').replace(/\s+/g, ''); };
    const stamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    const status = [];
    let touched = false;

    rows.forEach(function (r) {
      const done = String(r[c.status] || '').trim();
      if (done) { status.push([done]); return; }
      const raw = String(r[c.id] == null ? '' : r[c.id]).trim();
      const real = safe_(c.real >= 0 ? String(r[c.real] || '').normalize('NFKC').replace(/\s+/g, ' ') : '', 40);
      const nick = c.nick >= 0 ? cleanNick_(r[c.nick]) : '';
      if (!raw && !real) { status.push(['']); return; }
      touched = true;
      const id = normId_(raw);
      if (!ID_RE.test(id)) { out.ng++; status.push(['未反映：IDの形が使えない（半角英数字3〜20文字）']); return; }
      if (id === PRACTICE_ID) { out.ng++; status.push(['未反映：練習用IDと同じ']); return; }
      if (byId[id] != null) {
        const i = byId[id], row = roster[i];
        if (real && nk(row[REAL_NAME_COL - 1]) === nk(real)) {   // 同じ人の出し直し → ニックネームだけ更新
          if (String(row[1]) !== nick) { rs.getRange(i + 2, 2).setValue(nick); row[1] = nick; out.updated++; status.push(['反映済み：ニックネームを更新']); }
          else status.push(['反映済み（同じ内容）']);
          return;
        }
        out.ng++; status.push(['未反映：このIDはほかの人が使用中']); return;
      }
      last = Math.max(last, 1) + 1;
      rs.getRange(last, 1).setNumberFormat('@');
      rs.getRange(last, 1, 1, REAL_NAME_COL).setValues([[id, nick, '', 'フォーム登録 ' + stamp, '', real]]);
      roster.push([id, nick, '', '', '', real]); byId[id] = roster.length - 1;
      out.added++;
      status.push(['反映済み' + (nick ? '' : '（ニックネーム空欄：アプリではIDを表示）')]);
    });
    if (touched) fs.getRange(2, c.status + 1, status.length, 1).setValues(status);
    if (touched) { try { CacheService.getScriptCache().remove('formnick'); } catch (e) {} }
    return out;
  });
}

// フォームが送られたとき（インストール型トリガー）
function onFormToRoster(e) {
  syncFormToRoster_(SpreadsheetApp.getActiveSpreadsheet());
}

// メニューから：いまある回答を名簿に写し、以後は送信のたびに自動で写す
function syncFormFromMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!formSheet_(ss)) { ss.toast('「' + FORM_SHEET + '」シート（希望ID・ニックネームの列）が見つかりません。', '名簿への反映', 8); return; }
  const has = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onFormToRoster'; });
  if (!has) ScriptApp.newTrigger('onFormToRoster').forSpreadsheet(ss).onFormSubmit().create();
  const r = syncFormToRoster_(ss);
  ss.toast('追加 ' + r.added + ' 件、ニックネーム更新 ' + r.updated + ' 件' +
    (r.ng ? '、未反映 ' + r.ng + ' 件（「' + FORM_SHEET + '」の「' + FORM_STATUS + '」列を見てください）' : '') +
    '。以後はフォームが送られるたびに自動で反映します。', '名簿への反映', 10);
}

// ===== 名簿の入力補助・点検 =====
// 名簿のA列にIDを手入力したら、自動で半角・大文字にそろえる
function onEdit(e) {
  try {
    const rng = e && e.range;
    if (rng && rng.getSheet().getName() === COACH_SHEET) { CacheService.getScriptCache().remove('coach'); return; }   // 鹿コーチを直したら、すぐ反映
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
