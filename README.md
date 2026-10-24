# 池田優介 Official Support Website

全日本ロードレース選手権に挑戦する池田優介の公式応援サイト。HTML・CSS・JavaScript・JSONだけで動く、GitHub Pages向けの静的サイト一式です。ビルド、npm install、PHP、APIキーは不要です。

## ダウンロードしたら

1. **ZIPをすべて展開**してください。ZIPの中から`index.html`だけを開かないでください。
2. `index.html`と同じ階層に、`css`・`js`・`data`・`images`・`assets`フォルダがあることを確認します。
3. 下の起動方法で確認します。CSSを別途ダウンロードする必要はありません。

```text
yusuke-ikeda-website/
├── index.html              ← トップページ
├── css/
│   ├── style.css           ← サイト全体のデザイン
│   └── fonts.css           ← 同梱フォントの定義
├── js/                     ← メニュー・写真・レース・ニュース
├── data/                   ← 更新する情報4ファイル
├── images/                 ← OGPと本人写真用フォルダ
├── assets/                 ← アイコン・ローカルフォント
├── docs/                   ← 指示書・設計・要件対応・検証
├── scripts/                ← 保守・配布用スクリプト
├── start-windows.bat
├── start-macos.command
├── start-server.py
└── profile.html ほか        ← 合計12ページ
```

### Windows

Python 3がインストールされていれば、`start-windows.bat`をダブルクリックします。手動の場合は、展開したフォルダでターミナルを開きます。

```powershell
py -3 -m http.server 8000 --bind 127.0.0.1
```

### Mac

Python 3がインストールされていれば、`start-macos.command`で起動します。実行権限のため開けない場合は、そのフォルダでターミナルを開き、次を実行してください。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

### 共通

手動起動ではブラウザで `http://127.0.0.1:8000/` を開きます。停止は起動したターミナルで`Ctrl+C`。ポート8000が使用中なら別のポート番号を指定します。

`index.html`のダブルクリックによる`file://`表示では、ブラウザの制限でJavaScriptモジュールやJSONを読み込めません。ニュース・レース・SNSなどの動作確認にはHTTP配信が必要です。Pythonを入れない場合は、エディタの静的HTTPサーバー機能かGitHub Pagesを使用してください。

## 収録ページ

HOME / PROFILE / STORY / RACE / NEWS / NEWS DETAIL / MOMENTS / SUPPORT / PARTNERSHIP / CONTACT / PRIVACY / 404の12ページ。写真3〜5枚のスライド、次戦、シーズンと結果、ニュース絞り込み、SNS、写真クレジット、パートナー、Google Formsの登録箇所を用意しています。

実装と検証結果は[docs/VALIDATION.md](docs/VALIDATION.md)、40項目の指示との対応は[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)を確認してください。

## 更新するファイル

定期的な情報更新は`data/`の4ファイルで行います。UTF-8のJSONとして保存し、末尾の不要なカンマやコメントを入れないでください。未登録は`null`または`[]`で表します。

| ファイル             | 更新内容                                                |
| -------------------- | ------------------------------------------------------- |
| `data/profile.json`  | 基本情報、経歴、ストーリー、本人写真、SNS、Google Forms |
| `data/races.json`    | シーズン、次戦、日程、観戦案内、予選・決勝・結果        |
| `data/news.json`     | ニュース原稿・公開日・カテゴリー・写真                  |
| `data/sponsors.json` | 許諾済みパートナー、公開できる実績数値、任意PDF         |

HTMLに表示する未確認の実績、架空の参戦日程、別人のSNSは作っていません。現在は写真・ニュース・戦績・公式リンクを受け取ってから登録する状態です。

### profile.json

- `name` / `englishName` / `hometown` / `description`：氏名、欧文名、出身、活動紹介。
- `biography`：`{"year":"確認済みの年","text":"確認済みの経歴"}`の配列。
- `story`：`id`、`label`、`title`、`body`、`photo`を持つ配列。START / FIRST RACE / CHALLENGE / ALL JAPAN / TODAYの文章を本人の言葉で更新します。
- `photos.hero`：ヒーロー写真3〜5枚。`photos.profile`と`photos.story`：各ページの写真。`photos.moments`：Journalの写真一覧。
- `socials`：`Instagram`、`X`、`Threads`、`Facebook`の公式HTTPS URL。サービス名の大文字・小文字を保ってください。未登録は`null`。
- `contact`：Google Formsの表示方法・URL・問い合わせ分類。

### 本人写真の登録

AI生成写真は使用しません。本人または権利者から使用許諾を得た写真を、用途に応じて`images/hero`、`images/profile`、`images/story`、`images/race`、`images/news`、`images/gallery`、`images/sponsor`に保存します。

写真オブジェクトの形式例です。ファイル名・代替テキスト・寸法・クレジットは、実際の写真に合わせて変更します。

```json
{
  "src": "images/hero/racing.webp",
  "alt": "写真に写っている本人と状況を具体的に説明",
  "width": 1800,
  "height": 1200,
  "srcset": "images/hero/racing-800.webp 800w, images/hero/racing.webp 1800w",
  "sources": [
    {
      "type": "image/avif",
      "srcset": "images/hero/racing-800.avif 800w, images/hero/racing.avif 1800w"
    }
  ],
  "caption": "写真の短い説明",
  "credit": "撮影者名",
  "round": "ラウンド",
  "date": "YYYY-MM-DD",
  "circuit": "サーキット名"
}
```

`srcset`・`sources`は用意した画像だけを指定します。まだ作成していないサイズを列挙すると404になります。画像は同一サイトのパスで指定し、`alt`は必ず入力します。元画像の寸法を指定してレイアウトの揺れを減らしてください。

ヒーローは約6秒でフェードし、停止・再生操作があります。動きを減らす設定では自動再生を抑えます。本人写真が未提供の場合は、写真があるように見せかけず素材待ちの状態を表示します。

### races.json

トップレベルは`season`、`nextRaceId`、`races`。次戦に設定するレースの`id`を`nextRaceId`に登録します。

各レースで扱える項目は次のとおりです。

| 項目                                | 内容                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `id` / `round`                      | 固有ID、ラウンド表記                                                    |
| `date`                              | 開催日、`YYYY-MM-DD`                                                    |
| `startAt`                           | 任意の開始日時。カウントダウンを使う場合は`+09:00`など時差を含むISO形式 |
| `status`                            | `scheduled` / `completed` / `postponed` / `cancelled`                   |
| `circuit` / `location` / `category` | 会場名・所在地・クラス                                                  |
| `schedule` / `access` / `spectator` | 時間・交通・観戦案内                                                    |
| `qualify` / `final` / `result`      | 予選・決勝・結果の確認済み記録                                          |
| `officialUrl` / `mapsUrl`           | 公式大会と地図のHTTPS URL                                               |
| `photo`                             | 任意の写真オブジェクト                                                  |

完了済み・中止・過去日の大会を次戦と表示しないようにしています。カウントダウンは、将来の開始日時とタイムゾーンが確定している場合だけ表示します。開催予定と本人の参戦予定は、両方を確認してから掲載してください。

### news.json

`articles`配列に次の項目を登録します。

- `id`：記事ごとに重複しない文字列。
- `date`：公開日、`YYYY-MM-DD`。日本時間で未来日の記事は公開日まで一覧から除外します。
- `category`：`RACE` / `RESULT` / `ACTIVITY` / `EVENT` / `MEDIA` / `SPONSOR` / `INFORMATION`。
- `title` / `body`：見出しと本文。HTMLタグを記入せずプレーンテキストにします。
- `photo`：任意の写真オブジェクト。
- `author`：任意の著者名。

トップには最新3件、NEWSにはカテゴリーで絞り込める一覧を表示します。記事詳細は`news-detail.html?id=記事ID`。IDを変更すると既存の詳細リンクが変わるため、公開後は維持してください。

### sponsors.json

- `partners`：`name`、公式HTTPS `url`、同一サイト画像パスの`logo`、任意の`alt`。
- `metrics`：`label`、`value`、`period`、`source`。確認済みの値に集計期間と出典を添えます。
- `deckUrl`：同一サイトのスポンサー資料PDF。未作成なら`null`。

掲載許諾のない企業名・ロゴや、架空のSNSフォロワー数・Web閲覧数は登録しないでください。

## Google Formsの設定

1. 運営者のGoogleアカウントでGoogle Formsを作ります。
2. 分類に「スポンサー」「取材」「イベント」「ファン」「その他」を用意します。
3. 必要な取得項目と個人情報案内を設定し、回答先をGoogle Sheetsに接続します。
4. 回答シートのアクセス権を確認し、一般公開しないようにします。
5. `profile.json`の`contact`を設定します。

リンクとして表示する場合：

```json
{
  "mode": "link",
  "url": "https://docs.google.com/forms/d/e/フォームID/viewform",
  "categories": ["スポンサー", "取材", "イベント", "ファン", "その他"]
}
```

`mode`を`embed`にすると、利用者が表示操作をしてからフォームをiframeで読み込む方式になります。埋め込みには`docs.google.com/forms/.../viewform`のURLを使用します。`https://forms.gle/...`はリンク方式だけに使用してください。未設定の`url: null`ではフォーム送信を行えません。

公開前に`privacy.html`とフォーム内で、運営者・取得項目・目的・保存期間・連絡先を確定してください。この制作物はGoogleアカウントやフォーム自体を作成しません。

## SEO・OGP・安全性

各HTMLにはtitle・description・canonical・OGP・Twitter Card、意味に合う構造化データを用意しています。未登録の記事に架空のArticle、未登録の大会に架空のEventを作りません。OGPは本人写真を装わないブランドグラフィックで、`images/ogp.png`にあります。

HTML・構造化データ・CSS・JavaScriptの編集後は、`python3 scripts/update-csp.py`（Windowsは`py -3 scripts/update-csp.py`）を実行してCSPハッシュとSRIを同期してください。HTMLが直接読み込むCSSと`js/main.js`にはSHA-384のSRIを付けています。外部JavaScriptは使わず、本文をHTMLとして挿入せず、Google Formsなど必要な接続だけを許可します。詳細と別ホスティングでのヘッダー案は[docs/SECURITY.md](docs/SECURITY.md)を参照してください。

記事ごとのtitle・description・Article構造化データはJavaScriptで更新します。JavaScriptを実行しないSNSクローラーには共通のOGPが使われるため、記事ごとに異なるSNSプレビューが必要なら、公開工程で静的な記事HTMLを生成する拡張が必要です。

ローカルフォントはBarlow Condensed（600/700/800）とNoto Sans JPの可変フォントです。日本語はUnicode範囲ごとに分割され、ブラウザは使う文字の範囲を読み込みます。ライセンスは`assets/fonts/Barlow-Condensed-OFL.txt`と`Noto-Sans-JP-OFL.txt`、取得元・バージョン・検証用情報は同フォルダの`SOURCES.json`に同梱しています。

LCP 2.5秒以下・INP 200ms以下・CLS 0.1以下は設計上の目標です。本人写真を登録し、公開環境の端末・回線で測定して初めて達成を判断できます。

## GitHub Pagesへの公開

1. 本人写真・経歴・参戦情報・SNS・問い合わせ先を確認して登録します。
2. `index.html`、`css`、`js`、`data`、`images`、`assets`を含む**一式**を`yusukeracing/yusukeracing.github.io`の`main`ブランチのルートへ反映します。ZIPファイルをそのままアップロードするのではなく、展開した中身を配置します。
3. GitHubのSettings → Pages → Build and deploymentで「Deploy from a branch」を選び、`main` / `/(root)`を指定します。
4. Saveし、デプロイの成功を確認して「Enforce HTTPS」を有効にします。
5. 公開URLで各ページ、写真、CSS、ニュース、レース、SNS、Google Forms、OGPを確認します。

この作業ではリモートへのpushや公開は実施していません。Pagesを有効にする操作は、クラウド開発環境をPublishする操作とは別です。

別ドメインを使う場合は、全HTMLのcanonical / og:url / 構造化データ、OGP画像URL、`sitemap.xml`、`robots.txt`の公開先を統一します。

## 更新後にZIPを作る場合

```sh
python3 scripts/package-site.py --output ../yusuke-ikeda-website.zip
```

Windowsは`python3`の代わりに`py -3`を使います。この処理は`.git`やキャッシュを除いた実ファイルからZIPを作成し、必要なCSSなどの存在を確認します。Gitの追跡済みファイルだけを対象にする`git archive`とは異なり、作成したばかりのファイルも含みます。

## 同梱資料

- [制作指示書の原文](docs/BRIEF.md)
- [コンセプト・参考調査・サイトマップ・ワイヤーフレーム](docs/DESIGN.md)
- [40項目と21成果物の対応表](docs/REQUIREMENTS.md)
- [実施した検証と未検証事項](docs/VALIDATION.md)
- [セキュリティとホスティング設定案](docs/SECURITY.md)
