
const prefixId = 'com-matumo-dev-niconico-like';

// サイトURLの変更イベント名
const nicoVideoPageUrlChangedEventName = `${prefixId}-nicoVideoPageUrlChanged`;
// 動画再生ページのURLパターン（正規表現）
const nicoVideoPageUrlPatternRegExp = new RegExp('^https://www\\.nicovideo\\.jp/watch/.+$');

// ログ設定
const logPrefix = '[niconico-like]';
const logLevel = debugMode ? 'debug' : 'log'; // ログレベル: 'error', 'warn', 'info', 'log', 'debug'
const logSufixType = debugMode ? 'long' : 'none'; // ログのサフィックスタイプ: 'none', 'short', 'long'

// いいね！ボタンのセレクタ
const button_selector = '[data-element-name="like"]';
// いいね！ボタンが含まれるコンテナ要素のセレクタ
const button_container_selector = 'div.grid-area_\\[player\\] > div > div > div[data-styling-id]';
