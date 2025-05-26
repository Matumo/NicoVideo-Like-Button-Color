(async function() {
  'use strict';

  // いいね！ボタンのセレクタ
  const button_selector = '[data-element-name="like"]';

  console.debug("Content script loaded");

  // 拡張機能のストレージから設定された色を取得
  const { likeButtonColor } = await chrome.storage.local.get({ likeButtonColor: "#FF8FA8" });
  console.debug("likeButtonColor:", likeButtonColor);

  // ボタンを監視して色を変更するObserver
  let currentButtonCheckObserver = null;
  function addButtonCheckObserver(_button) {
    const button = _button;

    // svg要素とデフォルトの色を取得
    let svgPath = button.querySelector('svg path');
    const defaultColor = svgPath ? svgPath.getAttribute('fill') : null;

    // 前回の状態を保存しておき、変更があった場合のみ色を更新
    let lastSvgPath = null;
    let lastCurrentStatus = null;

    // svgのfillカラーを更新
    function updateSvgColor() {
      const params = JSON.parse(button.getAttribute('data-element-params'));
      const currentStatus = params.current; // いいね！しているかどうか

      // svg要素は置き換わるため、再度取得
      svgPath = button.querySelector('svg path');
      if (!svgPath) return;

      // いいね！している場合は指定色、していない場合はデフォルト色または未指定にする
      if (currentStatus) {
        svgPath.setAttribute('fill', likeButtonColor);
      } else if (defaultColor) {
        svgPath.setAttribute('fill', defaultColor);
      } else {
        svgPath.removeAttribute('fill');
      }

      // 前回の状態として保存
      lastSvgPath = svgPath;
      lastCurrentStatus = currentStatus;

      console.debug(`updateSvgColor | current: ${currentStatus},
                     fill: ${svgPath.getAttribute('fill')},
                     svg length: ${button.querySelector('svg').innerHTML.length}`);
    }

    // いいね！ボタンの変更を監視
    const config = { attributes: true, childList: true, subtree: true };
    const attributeObserver = new MutationObserver((mutations) => {
      let shouldUpdate1 = false;
      let shouldUpdate2 = false;

      // このスクリプトによる変更以外の変更があるかどうかを判定
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.target === svgPath &&
          mutation.attributeName === 'fill'
        ) {
          continue;
        }
        shouldUpdate1 = true;
      }

      // 現在の状態と前回の状態を比較して変化があるかどうかを判定
      const params = JSON.parse(button.getAttribute('data-element-params'));
      const currentStatus = params.current;
      svgPath = button.querySelector('svg path');
      if (svgPath !== lastSvgPath || currentStatus !== lastCurrentStatus) {
        shouldUpdate2 = true;
      }

      // どちらかの条件が満たされている場合のみ色を更新
      if (shouldUpdate1 && shouldUpdate2) {
        updateSvgColor();
        console.debug("Relevant change detected, updateSvgColor called");
      }
    });
    // 既にボタンを監視していたら停止
    if (currentButtonCheckObserver) {
      currentButtonCheckObserver.disconnect();
      console.debug("Previous button observer disconnected");
    }
    // いいね！ボタンの変更の監視を開始
    attributeObserver.observe(button, config);
    currentButtonCheckObserver = attributeObserver;
    console.debug("Button check observer added");

    // 初期状態で色を更新
    updateSvgColor();
    console.debug("Button and SVG path loaded");
  }

  // いいねボタンがDOMに追加されるのを監視
  const observer = new MutationObserver((mutations, observerInstance) => {
    const button = document.querySelector(button_selector);
    if (!button) return;
    // ボタンが見つかったら監視を停止
    observerInstance.disconnect();
    console.debug("Button found:", button);
    // ボタンが見つかったらボタンを監視して色を変更するObserverの追加
    addButtonCheckObserver(button);
  });

  function init() {
    // ボタンが追加されていればボタンの監視を開始
    const button = document.querySelector(button_selector);
    if (button) {
      console.debug("Button already exists");
      // ボタンを監視して色を変更するObserverの追加
      addButtonCheckObserver(button);
    } else {
      // ボタンが見つからない場合はDOMの変更を監視
      console.debug("Button not found, starting observer");
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // 処理開始
  init();

  // 全画面表示のイベントリスナーでイベント発生時にボタン追加検出の監視を開始
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      // 全画面表示中の処理
      console.debug("Fullscreen mode activated");
      // 再処理
      init();
    } else {
      // 全画面表示解除時の処理
      console.debug("Fullscreen mode deactivated");
      // 再処理
      init();
    }
  });

  // サイトURLの変更イベント発火
  let lastUrl = window.location.href;
  function checkUrlChange() {
    try {
      const currentUrl = window.location.href;
      console.debug("Checking URL change.", "Current URL:", currentUrl, "Last URL:", lastUrl);
      // URLが変わったかどうかを確認
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.debug("Detected URL change.");
        init(); // URLが変わったら再度ボタンの監視を開始
      } else {
        console.debug("No URL change detected.");
      }
    } catch (error) {
      console.debug("Error checking URL change:", error);
    }
  };

  // URLの監視を開始
  {
    console.debug("Initializing URL change observer.");
    // 初回イベント実行
    checkUrlChange();
    // popstateイベントを監視
    window.addEventListener('popstate', function () {
      console.debug("popstate event detected.");
      checkUrlChange();
    });
    // DOM変更を監視
    const urlChangeObserver = new MutationObserver(() => {
      console.debug("DOM mutation detected for URL change.");
      checkUrlChange();
    });
    urlChangeObserver.observe(document.head, {
      childList: true,
      attributes: true,
    });
    console.debug("URL change observer initialized.");
  }
})();
