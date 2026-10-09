# Bakery POS Reconciler V2

パン屋のレジ締め作業を支援する Web アプリです。POS に記録された決済金額と CAT 端末の金額を照合し、差額がある場合は修正後の金額に一致する商品組み合わせ候補を提示します。

## Live Demo

[Bakery POS Reconciler V2 を開く](https://bakery-pos-reconciler-v2-frontend.vercel.app/)

## 開発の背景

アルバイト先のパン屋では、レジ締め時に POS と CAT 端末の決済金額を確認する必要があります。POS は「電子マネー」「国内QR」「中国QR」などの分類合計を表示する一方、CAT 端末は楽天Edy、iD、PayPay、Alipay などのサービス別に金額を表示します。

手作業での集計・比較には時間がかかり、入力ミスや確認漏れも起こりやすいため、この作業を支援するツールを開発しました。

## なぜ V2 を作るのか？ — Why V2?

V1 は、実際の業務上の課題を解決するためのプロトタイプとして始まりました。Python の計算ロジックから Streamlit による画面、FastAPI とバニラ JavaScript の Web アプリへと段階的に拡張し、必要な機能と業務の流れを確認できました。

その過程で、複数の実装や重複したロジックが同じリポジトリに残り、機能追加や画面の変更を進めるための構成を整理する必要が出てきました。

V2 は、V1 で得た知見をもとに、React + TypeScript と FastAPI を中心とした構成で作り直すプロジェクトです。主な目的は次のとおりです。

- **画面の操作性を改善する：** スマートフォンでも金額入力、照合結果の確認、修正候補の検索を行いやすくする。
- **フロントエンドを整理する：** React のコンポーネントで画面を分け、TypeScript でデータ構造を明示する。
- **役割を分離する：** API、業務ロジック、データベース処理、画面表示の責務を整理する。
- **商品管理を改善する：** 商品登録画面と商品 API を用意し、修正候補に使う商品データを更新しやすくする。
- **今後の機能追加に備える：** テスト、認証、照合履歴、OCR 入力などを追加するための土台を作る。

V1 を通じて業務の流れを検証し、V2 ではその経験を保守しやすい構成と使いやすい画面に反映しています。商品 API は V1 にも存在しますが、V2 ではフロントエンドの商品登録機能までつなげています。

## 実装済みの機能

- POS の決済分類別金額の入力
- CAT のサービス別売上金額・取消金額の入力
- CAT 明細を POS の分類に合わせて集計
- POS と CAT の金額照合と差額表示
- 差額のある決済方法を選択して修正候補を検索
- 有効な商品データから、目標金額に一致する商品組み合わせを最大 3 件提示
- 商品の登録・一覧取得・更新・無効化 API
- フロントエンドでの商品登録
- スマートフォンに対応したレイアウト
- ダークモードとブラウザへの設定保存

本アプリは金額確認と候補検索を支援します。POS や CAT 端末の取引を自動で変更する機能はありません。商品組み合わせは金額が一致する候補であり、元の取引内容を特定するものではありません。

## 技術構成

| 分野 | 使用技術 |
| --- | --- |
| フロントエンド | React、TypeScript、Vite、Tailwind CSS |
| バックエンド | Python、FastAPI |
| データベース | PostgreSQL / Neon |
| データアクセス | SQLModel、SQLAlchemy |
| 入出力の検証 | Pydantic |
| フロントエンドの静的解析 | Oxlint |

## 使い方

1. POS に表示された決済分類別の金額を入力します。
2. CAT 端末の各決済サービスの売上と、取消がある場合は取消金額を入力します。
3. 「照合」を押して、一致・差額・どちらの金額が多いかを確認します。
4. 差額がある決済方法を選択します。
5. 必要に応じて、POS で取り消す予定の取引金額を入力します。
6. 「候補検索」を押して、修正後の金額に一致する商品組み合わせを確認します。

CAT の集計には `売上 − 取消` を使用します。修正後の目標金額は、POS が多い場合は `取消予定の取引金額 − 差額`、CAT が多い場合は `取消予定の取引金額 + 差額` です。

CAT が多い場合は、取消予定の金額を 0 のまま検索することで、差額そのものに一致する候補を検索できます。組み合わせ検索は少ない商品点数から順に行い、同じ商品の複数個使用を許可します。現在の上限は 8 点・3 候補です。

## プロジェクト構成

```text
Bakery-POS-Reconciler-V2/
├── backend/
│   ├── app/
│   │   ├── constants/   # 決済分類の定義
│   │   ├── enums/       # 決済・商品分類の列挙型
│   │   ├── routers/     # API エンドポイント
│   │   ├── schemas/     # リクエスト・レスポンスの定義
│   │   ├── services/    # 照合ロジック・商品データ操作
│   │   ├── config.py    # 環境変数による設定
│   │   ├── database.py  # DB 接続・セッション
│   │   ├── main.py      # FastAPI エントリポイント
│   │   └── models.py    # DB モデル
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # API 呼び出し
│   │   ├── components/  # 照合・商品登録の画面
│   │   ├── constants/   # 画面で使用する定義
│   │   ├── types/       # TypeScript の型
│   │   └── App.tsx
│   └── package.json
├── .env.example
└── README.md
```

## ローカル開発

Python、Node.js / npm、PostgreSQL の接続先を用意してください。以下は Linux / WSL での手順です。依存パッケージのインストールと実行は同じ環境で行ってください。

### 1. バックエンドの設定

プロジェクトのルートで `.env.example` を `.env` にコピーし、接続先を設定します。既存の `.env` がある場合はコピーせず、その設定を確認してください。

```bash
cp .env.example .env
```

```env
APP_NAME="Bakery POS API"
DEBUG=true
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

`.env` は接続情報を含むため Git にコミットしません。

### 2. バックエンドの起動

プロジェクトのルートで実行します。設定ファイルは実行時の作業ディレクトリにある `.env` から読み込まれます。

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
uvicorn --app-dir backend app.main:app --reload
```

- API: <http://127.0.0.1:8000>
- API ドキュメント: <http://127.0.0.1:8000/docs>

起動時に、接続先データベースに不足しているテーブルを作成します。既存テーブルの構造変更を管理するマイグレーション機能はまだありません。

### 3. フロントエンドの起動

`frontend/.env.local` を作成して API の URL を設定します。

```env
VITE_API_URL=http://127.0.0.1:8000
```

別のターミナルで実行します。

```bash
cd frontend
npm install
npm run dev
```

Vite が表示する URL を開きます。通常は <http://localhost:5173> です。バックエンドの CORS 設定はローカル開発のポート `5173` を許可しているため、別のポートを使用する場合は許可オリジンも調整してください。

### フロントエンドの確認コマンド

```bash
cd frontend
npm run lint
npm run build
```

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/products/` | 全商品の取得 |
| GET | `/products/active/` | 有効商品の取得 |
| GET | `/products/category/{category}` | 分類別商品の取得 |
| GET | `/products/{id}` | 商品の取得 |
| POST | `/products/` | 商品の登録 |
| PATCH | `/products/{id}` | 商品の更新 |
| DELETE | `/products/{id}` | 商品の無効化（論理削除） |
| POST | `/reconciliation/` | POS / CAT 金額の照合 |
| POST | `/reconciliation/corrections` | 修正用の商品組み合わせ検索 |

リクエストとレスポンスの詳細は、起動中の API の `/docs` で確認できます。

## 今後の改善候補

V2 は開発中です。現在のコードには主要な照合・修正候補検索・商品登録の流れが実装されています。今後は以下の改善を検討しています。

- バックエンドとフロントエンドの自動テスト
- 商品管理の認証・権限制御
- 商品編集・無効化を行う画面
- 照合履歴と操作履歴の保存
- 入力検証とエラー表示の改善
- データベースのマイグレーション管理
- デプロイ手順と CI の整備
- OCR による POS / CAT 金額の読み取り

V1 は初期の実装と業務ロジックの参考として残し、V2 では React / FastAPI の構成を中心に機能を拡張していきます。
