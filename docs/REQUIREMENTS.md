# 制作指示書との対応表

原文は [BRIEF.md](BRIEF.md)。ページ・UI・更新コードと、本人素材がないため公開内容を確定できない項目を分けて記載します。検証結果の正否は [VALIDATION.md](VALIDATION.md) を参照してください。

## 40項目の対応

| 番号 | 指示書の項目                | 対応箇所・方針                                                                                                 | 本人素材・外部条件                                                                  |
| ---- | --------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 01   | Webサイトの最終目的         | `index.html`から人物・レース・フォロー・個人支援・企業相談への導線、全ページ共通ナビ                           | SNS・相談窓口の実URLは未提供                                                        |
| 02   | ブランドコンセプト          | HOME、STORY、`DESIGN.md`。RACING × HUMAN × MOMENTUMと短い和文を軸にする                                        | 本人の言葉・写真は未提供                                                            |
| 03   | 現在地を正確に表現          | 全ページで「全日本ロードレース選手権に挑戦」。未確認の世界選手権参戦を示さない                                 | 経歴の詳細は本人確認後                                                              |
| 04   | EDITORIAL MOTORSPORT DESIGN | `css/style.css`、非対称組版、写真領域、罫線、数字、大型欧文                                                    | 本人写真を登録後に最終トリミング                                                    |
| 05   | 指定カラーと明暗            | CSS Variables、白・オフホワイト・青・黒・ネイビーのセクション切替                                              | —                                                                                   |
| 06   | テンプレート的表現の禁止    | 反復カード、過剰な角丸・ネオン・グラス表現を避け、情報に合った組版                                             | —                                                                                   |
| 07   | HERO CINEMATIC SLIDESHOW    | `index.html`、`js/slider.js`、`data/profile.json`。3〜5枚、約6秒、停止・再生・reduced motion                   | 本人写真未提供のため写真枠表示                                                      |
| 08   | LIVE RACE BAR               | HOME直下とRACEの次戦表示、`js/race.js`。確定日だけカウントダウン可能                                           | 次戦・開始日時未提供                                                                |
| 09   | TOPの13セクション           | `index.html`。HERO→NEXT RACE→人物→STORY→SEASON→RESULT→MOMENTS→NEWS→FOLLOW→SUPPORT→PARTNERSHIP→SPONSORS→CONTACT | 未登録情報は未登録と明示                                                            |
| 10   | WHO IS YUSUKE?              | HOME・`profile.html`、`data/profile.json`                                                                      | 宮城県角田市・氏名・全日本への挑戦以外の経歴は未確認                                |
| 11   | THE STORY                   | `story.html`、`data/profile.json`、5つの時間軸                                                                 | 本人の実体験・言葉は未提供                                                          |
| 12   | RACE EXPERIENCE             | `race.html`、`js/race.js`、`data/races.json`。ラウンド詳細、予選・決勝・結果                                   | 参戦・公式結果未提供                                                                |
| 13   | NEXT RACE情報               | RACEの大会詳細、日付・会場・場所・クラス・タイムスケジュール・アクセス・観戦・地図・公式リンク                 | 確定情報の登録が必要                                                                |
| 14   | NEWS                        | `news.html`、`news-detail.html`、`js/news.js`、最新3件と7カテゴリー                                            | ニュース原稿未提供                                                                  |
| 15   | JSON分離                    | `data/profile.json`、`news.json`、`races.json`、`sponsors.json`と共通取得処理                                  | CMS連携自体は未導入。取得層を交換できる構造                                         |
| 16   | PHOTO JOURNAL               | `gallery.html`、HOMEのMOMENTS、写真・ラウンド・日付・会場・撮影者                                              | 本人写真未提供                                                                      |
| 17   | SNS                         | ヘッダー・フッター・FOLLOW、ローカルアイコン、HTTPS URL検証、外部リンク属性                                    | 本人確認済みURL未提供。無効なリンクを置かない                                       |
| 18   | SUPPORT                     | `support.html`、HOME。フォロー・観戦・支援の選択肢と6種の用途                                                  | 実際の支援条件・送金先・受付は未提供                                                |
| 19   | SPONSOR                     | `sponsor.html`。人物・レース・発信・イベント・ブランディング・協働例・パートナー・相談                         | ロゴ・PDFは許諾済みデータだけ登録                                                   |
| 20   | 企業向け数字                | `data/sponsors.json`、実績の項目・値・期間・出典を扱える構造                                                   | 未提供の数字は生成しない                                                            |
| 21   | Google Forms                | `contact.html`の登録用スロット、プロフィールJSONのフォーム設定。リンクまたは同意後iframe                       | 実際のGoogle Forms作成・URL登録が必要                                               |
| 22   | PHP不使用                   | HTML / CSS / JavaScript / JSONによる静的構成。GitHub Pagesで動く                                               | バックエンド・独自DBなし                                                            |
| 23   | SECURITY                    | CSP、HTMLから読み込むCSS/JSのSHA-384 SRI、HTTPS外部リンク、noopener/noreferrer、安全なDOM描画、`SECURITY.md`   | GitHub PagesのHTTPS有効化は公開設定で実施                                           |
| 24   | PERFORMANCE                 | ローカルフォント、画像寸法、WebP/AVIF登録、srcset/sizes、lazy loading、外部JS依存なし                          | LCP/INP/CLSは本番素材・本番配信で測定。目標達成を未測定で断言しない                 |
| 25   | スマートフォン最優先        | CSSの可変サイズ・段組・メニュー。320/390/768/1366/1920pxの検証は`VALIDATION.md`                                | iPhone実機/Safariは別検証                                                           |
| 26   | TYPOGRAPHY                  | ローカルBarlow Condensed・Noto Sans JP、`css/fonts.css`、`clamp()`                                             | ライセンスはフォント同梱資料参照                                                    |
| 27   | 本人写真・AI写真禁止        | 本人写真登録枠、写真とクレジットのJSON構造。AI生成・無関係なライダー写真なし                                   | 本人写真と使用許諾の提供が必要                                                      |
| 28   | SCROLL MOTION               | 通常のスクロールと抑制的なフェード。長い演出・3D・スクロールジャックなし                                       | —                                                                                   |
| 29   | アクセシビリティ            | skip link、見出し、alt、focus-visible、キーボード操作、動きを減らす設定                                        | 実機・支援技術を用いた包括監査は別途                                                |
| 30   | SEO                         | 各HTMLのmetadata、canonical、OGP、構造化データ、robots、sitemap、favicon                                       | 実際の公開URLで確認。記事metadataはJS更新なので、JS非実行のSNSクローラーには共通OGP |
| 31   | 指定ファイル構成            | 指定12HTML、css/js/data/images/assets、robots、sitemap、manifestを一式で配布                                   | 空の画像用フォルダも配布対象                                                        |
| 32   | DESIGN SYSTEM               | `css/style.css`冒頭のCSS Variables、共通コンポーネント                                                         | —                                                                                   |
| 33   | COMPONENT                   | 見出し、CTA、レース、ニュース、SNS、写真、スポンサー、状態表示の共通化                                         | —                                                                                   |
| 34   | HEADER                      | 氏名ロゴ、7つの主要ナビ、SNS、携帯MENU                                                                         | SNS実URL未提供時は架空のアカウントへ遷移しない                                      |
| 35   | FOOTER                      | 大型YUSUKE IKEDA、RIDER / MIYAGI JAPAN、FOLLOW、Navigation、Copyright、Privacy                                 | SNS実URLは後からJSON登録                                                            |
| 36   | COPYWRITING                 | 短い和文、写真、データの順序。過度な広告表現を使わない                                                         | 本人引用は提供・確認後                                                              |
| 37   | コピー候補                  | 「挑戦は、まだ途中だ。」「その応援が、次の一周につながる。」などを文脈に沿って配置                             | —                                                                                   |
| 38   | 開発品質                    | HTML5、整理したCSS、ES Modules、JSON、各セクションコメント、更新資料                                           | 外部フレームワーク・ビルド不要                                                      |
| 39   | 制作手順                    | 調査試行→制約記録→再解釈→サイトマップ→フロー→ワイヤー→トークン→携帯/PC→実装                                    | 実地の参考サイト分析はネットワーク403で未完了                                       |
| 40   | 本人中心・コピー禁止        | オリジナルの組版・コード、本人データのみ登録する方針、実績捏造なし                                             | 本人写真・経歴・言葉の受領後に内容を完成させる                                      |

## 最終成果物21項目

| 指示書の成果物               | 収録先                                                              |
| ---------------------------- | ------------------------------------------------------------------- |
| 1. コンセプト説明            | `docs/DESIGN.md` §1                                                 |
| 2. 参考サイト分析            | `docs/DESIGN.md` §2。取得制限と設計仮説を明示                       |
| 3. サイトマップ              | `docs/DESIGN.md` §3、`sitemap.xml`                                  |
| 4. ユーザーフロー            | `docs/DESIGN.md` §4                                                 |
| 5. TOPページ構成             | `docs/DESIGN.md` §5、`index.html`                                   |
| 6. 各ページ構成              | `docs/DESIGN.md` §6、各HTML                                         |
| 7. デザインシステム          | `docs/DESIGN.md` §7、`css/style.css`                                |
| 8. スマートフォンUI          | `docs/DESIGN.md` §8、レスポンシブCSS、`docs/VALIDATION.md`          |
| 9. PC UI                     | 同上、各HTMLとCSS                                                   |
| 10. HTML                     | ルートの12HTML                                                      |
| 11. CSS                      | `css/style.css`、`css/fonts.css`                                    |
| 12. JavaScript               | `js/main.js`、`slider.js`、`race.js`、`news.js`、共通モジュール     |
| 13. JSONデータ               | `data/`の4ファイル                                                  |
| 14. Google Forms埋め込み箇所 | `contact.html`、フォーム設定と描画処理、README                      |
| 15. SEO設定                  | 各HTMLのhead、robots、sitemap                                       |
| 16. OGP                      | 各HTMLのOG metadata、`images/ogp.png`                               |
| 17. 構造化データ             | 各HTMLと実データに対応したruntime処理。未登録記事・大会は生成しない |
| 18. sitemap.xml              | ルートの`sitemap.xml`                                               |
| 19. robots.txt               | ルートの`robots.txt`                                                |
| 20. セキュリティ設定案       | `docs/SECURITY.md`、各HTMLのmeta CSP                                |
| 21. GitHub Pages公開手順     | `README.md`                                                         |

## ZIPでの受け取り

配布ZIPはGitの追跡済みファイルだけから作るのではなく、実ファイル一式から生成します。HTMLと同じ階層に`css`、`js`、`data`、`images`、`assets`が揃う構成です。ZIPを展開後、同梱の起動方法でHTTP配信し、CSSとJavaScriptの読み込みを確認します。

未登録の本人情報が残っていること、環境の公開・GitHub Pagesへのデプロイが別操作であることは、コードの収録漏れとは別の制約です。
