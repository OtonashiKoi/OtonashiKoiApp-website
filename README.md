# 音無樂園官方網站

本 repository 是 GitHub Pages 官網，不是遊戲 API 或玩家端 SPA。

- 官網：https://otonashikoi.github.io/OtonashiKoiApp-website/
- 遊戲：https://otonashikoi.org/
- Pages 來源：`main` 分支根目錄 `/`。

## 維護與發布

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 5272
```

內容與互動：`src/views/LandingView.vue`；版面：`src/style.css`；搜尋及分享資訊：`site-entry.html`。

`npm run build` 使用 `site-entry.html` 建置到 `docs/`，再將首頁、資源與 SEO 檔案同步到 repository 根目錄。根目錄與 `docs/` 兩份輸出均保留；舊資源不會被清空。正式更新需一併提交來源與本次建置所引用的成品，再推送至 `main`，確認 Pages 部署成功與公開畫面。

來源開發可使用 `npm run dev` 並開啟 `/site-entry.html`；根目錄 `index.html` 是發布成品，不是開發入口。

## 本季內容核對

2026-10-05 更新為「楓紅漸漸」，內容對照目前遊戲程式及正式資料庫的公開定義。涵蓋一般區共鬥、1–50 等養成、一轉職業、30／50 樓組隊塔、商店與拍賣、30 級通行證、公開十種合成配方及七款賽季稱號。

- 季節時間依正式維護設定：2026-10-04 21:00 起，11-01 當天仍可遊玩（台灣時間）。既有完整封面上的原規劃日期未作為現行開放時間。
- 一般區經驗是多人獎勵池分配；道具每人獨立骰，不把整體經驗池倍率寫成每人倍率。
- 副本參考 `partyTowerRules`、`partyTowerRoomsV2` 與公開配方；不宣稱每十樓補血、站位自動取得治療、或尚未開放的活動王。
- 實際介面圖由目前玩家端元件在隔離展示資料下拍攝，保留上下導覽列；人物、背包與隊伍為示範資料，沒有使用真實玩家資料。截圖不是通關率或平衡驗證。
- 圖片採用既有本季主視覺與稱號原始素材；WebP 僅用於網站傳輸。SEO 分享圖使用無日期的本季重點圖。

後續更新以正式程式與即時開關為準。官網提供玩法指南，不取代遊戲內物品說明或最新公告。

## 官網閱讀分區

- 預設首頁及 `#home`：遊戲介紹、三個實際介面玩法介紹、`#creator` VTuber 音無恋個人介紹與官方頻道連結。
- `#guide`：常態基礎教學，12 個章節；登入綁定、第一場戰鬥、裝備配點、強化鑲嵌、一般共鬥、地圖、世界王、職業轉職、組隊、合成、日常與 FAQ。
- `#updates`：本季更新、改版六大內容、實際介面範例與限定稱號。
- 頁首三個分頁在桌面與手機均可切換；章節網址會自動選擇對應閱讀區，支援直接連結及瀏覽器上一頁。

2026-10-05 教學核對來源：玩家端 settings／inventory／EnhanceModal／worldboss；後端 enhanceConfig、enhanceService、jobBadgeService、jobBadgeLevel、weeklyQuestService 與目前公開任務及世界王定義。YouTube 一般綁定使用直播聊天室限時綁定碼；一般強化失敗不會銷毀裝備，賭鬼模式另有破壞風險。一轉條件使用基礎屬性及指定武器，二轉採角色 Lv.35 加一轉徽章 Lv.20 的現行操作。

## 圖像教學（2026-10-05）

基礎教學以 `PictureGuide.vue` 呈現 12 個圖文章節：大幅實際遊戲圖片搭配 3～4 個短步驟，同時顯示，圖片可點擊放大。桌面採兩欄、手機單欄；章節文字連結可直接跳到對應內容。完整規則保留在「查看完整說明」中。本季更新維持圖與短摘要的既有排版。

新增截圖由玩家端實際 routes／EnhanceModal／PartyBattleScene 在隔離展示資料下拍攝，使用正式顯示條件（不顯示 DEV 登入），不登入或讀取真實玩家帳號。圖中帳號、裝備、綁定碼、隊伍、等級、金幣及報酬為示範；圖片供操作教學，不是數值或掉率證據。原始圖與驗證存於 `game-backups/official-website-visual-guide-20261005`；未改動遊戲功能或資料。

## 首頁與創作者（2026-10-05）

獨立首頁以音無恋手持楓葉的秋季插畫、遊戲實際介面及短文介紹音無樂園；插畫保留完整比例，配合桌面與手機排版。個人介紹使用玩家端 `public/brand/otonashi-main.png` 的原始立繪，未修改服裝與裝飾。基礎教學、本季更新保留原內容。身分依玩家端 `OnboardingGuide.tsx`（台灣 VTuber／遊戲設計師）及本人公開頻道，直播主題依現有公開影片與直播標題；不補寫未確認的生日、身高、出道日期或固定開播時間。YouTube 頻道網址透過官方 oEmbed 回傳的 `author_url` 核對：https://www.youtube.com/@%E9%9F%B3%E7%84%A1%E6%81%8B；Twitch：https://www.twitch.tv/otonashikoi 。
