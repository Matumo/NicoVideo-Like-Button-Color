(async function() {
  'use strict';

  // ボタンを監視して色を変更するObserver
  let currentButtonCheckObserver = null;
  function addButtonCheckObserver(_button) {
    const button = _button;

    // svg要素を取得
    let svgPath = button.querySelector('svg path');

    // 前回の状態を保存しておき、変更があった場合のみ色を更新
    let lastSvgPath = null;
    let lastCurrentStatus = null;

    // svgのfillカラーを更新
    function updateSvgColor() {
      const params = JSON.parse(button.getAttribute('data-element-params'));
      const currentStatus = params.current; // いいね！しているかどうか
      console.debug("updateSvgColor called with currentStatus:", currentStatus === true);

      // svg要素は置き換わるため、再度取得
      svgPath = button.querySelector('svg path');
      if (!svgPath) {
        console.debug("SVG path not found, cannot update color.");
        return;
      }

      // いいね！している場合は指定色、していない場合はデフォルト色または未指定にする
      if (currentStatus) {
        svgPath.setAttribute('fill', likeButtonColor);
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

      console.debug("MutationObserver triggered for button:", button);

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
  let prevButtonElement = null;
  function getButtonAndStartCheck() {
    // ボタン要素を取得
    const button = document.querySelector(button_selector);
    if (!button) return;
    // 前回と同じ要素なら何もしない
    if (button === prevButtonElement) return;
    prevButtonElement = button;
    // ボタンが見つかったらボタンを監視して色を変更するObserverの追加
    console.debug("Button found:", button);
    addButtonCheckObserver(button);
  }

  // いいねボタンのコンテナがDOMに追加されるのを監視
  let currentFindButtonContainerObserver = null;
  function getButtonContainerAndStartObserver(mutationsList, observer) {
    // コンテナ要素を取得
    const container = document.querySelector(button_container_selector);
    if (!container) return;
    // コンテナが見つかったらコンテナ自体の監視は停止する
    console.debug("Button container found:", container);
    observer.disconnect();
    // 既にいいね！ボタンのコンテナの変更を監視していたら停止
    if (currentFindButtonContainerObserver) {
      currentFindButtonContainerObserver.disconnect();
      currentFindButtonContainerObserver = null;
      console.debug("Previous find button container observer disconnected");
    }
    // いいね！ボタンのコンテナの変更を監視
    const buttonObserver = new MutationObserver(getButtonAndStartCheck);
    const config = { childList: true, subtree: false };
    buttonObserver.observe(container, config);
    currentFindButtonContainerObserver = buttonObserver;
    console.debug("Find button container observer started");
    // 初回実行
    getButtonAndStartCheck();
  }

  function init() {
    // URLが動画再生ページかどうかを確認
    if (!nicoVideoPageUrlPatternRegExp.test(window.location.href)) {
      console.debug("Not a nico video page, exiting init.");
      return;
    }
    // DOMの変更を監視
    const observer = new MutationObserver(getButtonContainerAndStartObserver);
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
    console.debug("Main observer started for body mutations.");
    // 初回実行
    getButtonContainerAndStartObserver();
  }

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
