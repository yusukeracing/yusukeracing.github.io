// 公開情報の編集はこのファイルから。確認済みの情報だけを入力してください。
// パスはサイトのルート（index.htmlのある階層）からの相対パスです。
export const siteData = {
  name: "池田 優介",
  hometown: "宮城県角田市",
  team: "",
  category: "",
  email: "", // 公開可能な問い合わせ先メール。入力するとメール作成機能が有効になります。
  social: { instagram: "", x: "", threads: "", facebook: "" },
  supportUrl: "", // 正式な支援サービスのHTTPS URL
  sponsorPdf: "", // 例: assets/sponsorship.pdf
  // 本人写真を追加し、illustrativeをfalseにしてください。
  // 複数枚登録すると6秒ごとに自動切替されます。
  heroImages: [
    {
      src: "images/hero/racing.webp",
      alt: "青いレーシングマシンでコーナーを走る架空のライダーのイメージ",
      caption: "RACING / イメージビジュアル",
      illustrative: true,
    },
    {
      src: "images/hero/pit.webp",
      alt: "ピットに置かれた青いレーシングマシンのイメージ",
      caption: "BEHIND THE RACE / イメージビジュアル",
      illustrative: true,
    },
  ],
  // 経歴例: { year: '2026', title: '正式な経歴', description: '確認済みの説明' }
  career: [
    {
      year: "2021",
      title: "SUGO ST150 クラスチャンピオン",
      description:
        "SUGOロードレース選手権 ST150 クラスチャンピオン。SUGO ST150 6時間耐久レース優勝。",
    },
    {
      year: "2022",
      title: "JP250へ。新たなカテゴリーへの挑戦。",
      description:
        "SUGOロードレース選手権 JP250（NAT）年間ランキング2位。MFJ CUP JP250（NAT）年間ランキング6位。",
    },
    {
      year: "2023",
      title: "SUGO 4時間耐久レース 総合優勝",
      description:
        "MFJ CUP JP250（NAT）年間ランキング7位。SUGO JP250 4時間耐久レース総合優勝。",
    },
    {
      year: "2024",
      title: "MFJ CUP JP250で挑戦を重ねる。",
      description: "MFJ CUP JP250（NAT）年間ランキング9位。",
    },
    {
      year: "2025",
      title: "筑波とSUGO、ST600で年間ランキング1位。",
      description:
        "筑波ロードレース選手権 ST600（NAT）年間ランキング1位。SUGOロードレース選手権 ST600（NAT）年間ランキング1位。",
    },
  ],
  // 日付が不明な年間戦績は、日程と分けて管理します。
  seasonResults: [
    {
      year: "2025",
      championship: "筑波ロードレース選手権",
      category: "ST600（NAT）",
      result: "年間ランキング1位",
    },
    {
      year: "2025",
      championship: "SUGOロードレース選手権",
      category: "ST600（NAT）",
      result: "年間ランキング1位",
    },
    {
      year: "2024",
      championship: "MFJ CUP",
      category: "JP250（NAT）",
      result: "年間ランキング9位",
    },
    {
      year: "2023",
      championship: "SUGO JP250 4時間耐久レース",
      category: "JP250",
      result: "総合優勝",
    },
    {
      year: "2023",
      championship: "MFJ CUP",
      category: "JP250（NAT）",
      result: "年間ランキング7位",
    },
    {
      year: "2022",
      championship: "SUGOロードレース選手権",
      category: "JP250（NAT）",
      result: "年間ランキング2位",
    },
    {
      year: "2022",
      championship: "MFJ CUP",
      category: "JP250（NAT）",
      result: "年間ランキング6位",
    },
    {
      year: "2021",
      championship: "SUGOロードレース選手権",
      category: "ST150",
      result: "クラスチャンピオン",
    },
    {
      year: "2021",
      championship: "SUGO ST150 6時間耐久レース",
      category: "ST150",
      result: "優勝",
    },
  ],
  // レース例（dateは日本時間）:
  // { id: 'round-1', round: 'ROUND 01', circuit: 'SPORTSLAND SUGO', date: '2026-04-26',
  //   endDate: '2026-04-26', championship: '全日本ロードレース選手権', category: '正式なクラス',
  //   qualifying: '5位', result: '4位', url: 'https://公式大会ページ' }
  // 次戦は終了日が過ぎていない日程から自動選択します。未登録ならカウントダウンは表示しません。
  races: [],
  // 過去戦績もracesに追加できます。日付順に表示します。
  // ニュース例:
  // { id: 'report-1', date: '2026-04-27', category: 'race', title: '正式な記事タイトル',
  //   summary: '一覧用の要約', body: '本文。改行も使用できます。', image: 'images/race/report.webp' }
  // category: race / activity / sponsor / media
  news: [],
};
