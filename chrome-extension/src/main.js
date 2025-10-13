(async function() {
  'use strict';

  // storage.jsの初期化
  await fetchLikeButtonColor();

  // URLが変更されたときのイベントリスナーを登録
  window.addEventListener(nicoVideoPageUrlChangedEventName, (event) => {
    console.log("Change nico video page URL event.");
    // 初期化処理を実行
    init();
  });

  // 全画面表示のイベントリスナーでイベント発生時にボタン追加検出の監視を開始
  document.addEventListener('fullscreenchange', () => {
    console.debug("Fullscreen change detected.");
    // 初期化処理を実行
    init();
  });

  // 初期化処理を実行
  init();
})();
