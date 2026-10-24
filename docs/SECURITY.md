# セキュリティとホスティング設定

## 現在の静的サイト

外部JavaScriptライブラリ、独自PHPフォーム、アプリケーション用DB、APIキーは使用しません。コンテンツは同じサイトのJSONから取得し、文字列は`textContent`とDOM要素で描画します。JSONの本文や見出しをHTMLとして解釈する処理、`eval()`、インラインのイベント属性は使用しません。

外部URLはHTTPSに限定します。SNSはサービスのドメイン、Google Formsは`docs.google.com`のFormsパスまたは`forms.gle`のリンクを検証します。新しいタブで開くリンクには`target="_blank" rel="noopener noreferrer"`を設定します。同一サイトの画像・PDFにもパス検証を適用します。

これらはすべての入力・運用リスクをなくす保証ではありません。公開するJSONは管理者が編集・レビューし、提供された実URLと権利を確認してください。

## Content Security Policy

各HTMLにmeta CSPを設定し、基本は同一オリジンのJavaScript・CSS・画像・フォント・JSONだけを許可します。Google Formsのiframeが必要な場合だけ`docs.google.com`を接続先とします。構造化データのJSON-LDとCSPの扱いは実際のHTML・更新スクリプトに従ってください。

HTMLやJSON-LD、直接読み込むCSS・JavaScriptを編集・整形して対象が変わる場合は、`python3 scripts/update-csp.py`でCSPハッシュとSRIを再計算します。`unsafe-inline`や`unsafe-eval`を追加してエラーを隠さないでください。

### Subresource Integrity

HTMLが直接読み込む同一サイトの`css/fonts.css`、`css/style.css`、`js/main.js`にはSHA-384の`integrity`を設定します。変更後は更新スクリプトで同期しないと、ブラウザが読み込みを拒否するので注意してください。ES Modulesからさらにimportする個々のファイルまで、HTMLのSRIが再帰的に検証するわけではありません。

外部CDNのJavaScript・CSSは使用しません。将来、固定バージョンの外部リソースを導入するなら、その配布物の正規ハッシュを確認し、`integrity`と`crossorigin`を設定し、必要最小限のCSP接続先も追加します。

## Google Forms

フォームURLは本人・運営者の正規フォームだけを登録します。短縮URLは外部ボタン向けで、埋め込みには`docs.google.com/forms/...`の正規URLを使います。リンクを開くか、利用者が埋め込みの表示操作を行うまでGoogleに接続しない設計です。

公開前にフォーム側と`privacy.html`で、運営者、取得項目、利用目的、保存期間、連絡先を一致させてください。Google FormsとGoogle Sheetsの共有設定を確認し、回答シートを一般公開しないでください。フォーム未登録状態では、動作しない送信ボタンを表示しません。

## GitHub Pages

Settings → Pagesで公開し、HTTPSの適用を有効にします。Pagesは静的サイトのため、PHPを実行せず、任意のHTTPレスポンスヘッダーも設定できません。meta CSPは`frame-ancestors`などレスポンスヘッダー専用の制御を代替できません。

この制作作業はGitHubへのpushやPagesへのデプロイを実施するものではありません。

## Cloudflare Pages等へ移行する場合の案

HTTPヘッダーを設定できるホスティングでは、次を検討できます。これは移行時の設計案であり、現在のGitHub Pagesに反映済みの設定ではありません。

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSPは、各HTMLのポリシーをレスポンスヘッダーへ移し、さらに次を加えます。

```text
frame-ancestors 'none';
```

`script-src`のハッシュ・nonce要件は、配信されるHTMLのJSON-LDやスクリプトと整合させます。コピーした古いハッシュで配信しないでください。CSPを段階的に導入する場合は`Content-Security-Policy-Report-Only`と収集先を用いて確認し、検証後に強制します。

HSTSはHTTPSの継続提供と対象サブドメインを確認してから導入します。`includeSubDomains`やpreloadは対象全体に影響するため、ドメインの管理方針を確認せず追加しません。

## 公開前の確認

- すべてのページでCSP違反、404のCSS・JavaScript、JSON読込失敗がない。
- 記事本文に`<script>`などの文字列を入れてもコードとして実行されない。
- 不正なURLスキームや未登録SNSへリンクしない。
- フォームが正しい回答先へつながり、個人情報案内が確認できる。
- ログイン情報・秘密鍵・トークン・回答シートをリポジトリへ入れない。
- 実際の公開URL、canonical、OGP、sitemapのホストが一致する。
