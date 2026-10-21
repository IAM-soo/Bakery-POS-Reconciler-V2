# AI Development Workflow

目的：由清楚嘅任務，做到可驗證、可審閱、可向面試官解釋嘅修改。

## 一次任務點做

1. **確認位置**：核實 remote 為 `IAM-soo/Bakery-POS-Reconciler-V2`、目前分支及未提交修改。換 Repository 先問；同一個已確認任務唔使重問。
2. **理解需求**：讀 AGENTS.md、README 同相關程式。將「現時行為 → 想要行為」及驗收條件填入 [任務模板](templates/task.md)。有合理預設就先做；會改產品意義嘅不確定點先釐清。
3. **實作**：用獨立任務分支，保持修改集中。前後端 API 變動一齊更新型別／schema；金額邏輯保留可手算例子。
4. **驗證**：按下表執行。記錄實際結果，未能跑就寫明原因，唔標成通過。
5. **自查**：檢查 diff、錯誤處理、敏感資料、手機輸入體驗及不相關修改。按 PR 模板交付 draft PR，讓使用者審閱。
6. **交接**：用香港繁中簡述改咗乜、點驗證、尚欠乜。功能有實際改動時更新 README。最後可附一個日文作品面試例子，必須分清已完成同改善候選。

## 驗證表

| 變更 | 要做 |
| --- | --- |
| 純文件／模板 | 核對引用路徑、實際指令、範圍及冇敏感內容 |
| Frontend | 喺 frontend 執行 `npm run lint`、`npm run build`；UI 改動檢查手機寬度及錯誤／空白狀態 |
| Backend 計算 | 針對改動做可重現測試；包含相等、POS 較大、CAT 較大、取消金額及邊界值 |
| API／DB | 隔離測試環境；驗證 request／response 同 frontend 型別一致，唔用正式 DB |

目前 baseline 未有設定自動測試 suite。以下係往後改計算邏輯時嘅驗證例子，唔代表已建立測試：POS=10000、CAT=9790、取消=1400，目標=1190；POS=9790、CAT=10000、取消=1400，目標=1610；後者取消=0，目標=210。

## 可以直接用嘅任務口令

**實作**：「喺 IAM-soo/Bakery-POS-Reconciler-V2 依 AGENTS.md 實作〔需求〕。先讀現況、寫驗收條件，再完成改動及相關驗證，交付可審閱 diff／draft PR。」

**修 Bug**：「重現〔步驟／錯誤〕，找出原因並做最小修正。先講預期與實際差異，驗證原本失敗情境同相關邊界。」

**Review**：「只審查〔PR／diff〕，優先報實際 bug、資料錯誤同測試缺口。每項提供位置、觸發條件、影響及建議；冇問題就明講冇發現。」

**學習交接**：「根據呢次修改，用繁中解釋資料由 UI → API → service → DB 點樣流，再列我需要識答嘅三條面試問題。」

## 複用到其他 Repository

先確認目標，再讀該 Repo 嘅結構、指令同現有規則，合併適用段落。唔好整份覆蓋既有 AGENTS.md，亦唔好將 V2 嘅 FastAPI／React 指令當成其他專案通用設定。

AGENTS.md 由 Codex 讀作專案指引；此流程及模板係本專案約定。參考：[OpenAI 官方 AGENTS.md 文件](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。
