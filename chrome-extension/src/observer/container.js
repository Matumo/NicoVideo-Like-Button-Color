'use strict';

// いいね！ボタンがDOMに追加されるのを監視

let init = null;

{
  // フルスクリーンの切り替えを監視するObserver
  let currentFullscreenChangeObserver = null;

  // フルスクリーンの切り替え検出時の処理
  function onFullscreenChange(mutationsList, observer) {
    console.debug("Fullscreen change detected.");
    // フルスクリーンの切り替えを検出したらボタンの状態をチェック
    getButtonAndStartCheck();
  }

  // フルスクリーンの切り替えを監視するObserverの追加
  function startFullscreenChangeObserver(fullscreenTarget) {
    // 既にフルスクリーンの切り替えを監視するObserverを登録していたら停止
    if (currentFullscreenChangeObserver) {
      currentFullscreenChangeObserver.disconnect();
      currentFullscreenChangeObserver = null;
      console.debug("Previous fullscreen change observer disconnected");
    }
    // フルスクリーンの切り替えを監視するObserverの開始
    const observer = new MutationObserver(onFullscreenChange);
    const config = { childList: true, subtree: false };
    observer.observe(fullscreenTarget, config);
    currentFullscreenChangeObserver = observer;
    console.debug("Fullscreen change observer started on:", fullscreenTarget);
  }



  // いいね！ボタンを探すObserver
  let currentFindButtonObserver = null;

  // いいね！ボタンがDOMに追加されるのを永続的に監視する
  let prevButtonElement = null;
  function getButtonAndStartCheck() {
    // ボタン要素を取得
    const button = document.querySelector(button_selector);
    if (!button) return;
    // 前回と同じ要素なら何もしない
    if (button === prevButtonElement) return;
    prevButtonElement = button;
    // ボタンが見つかったらボタンを監視して色を変更するObserverを開始
    console.debug("Button found:", button);
    startButtonCheckObserver(button);
  }

  // いいね！ボタンを探すObserverの追加
  function startFindButtonObserver(_container) {
    const container = _container;
    // 既にいいね！ボタンを探すObserverを登録していたら停止
    if (currentFindButtonObserver) {
      currentFindButtonObserver.disconnect();
      currentFindButtonObserver = null;
      console.debug("Previous find button observer disconnected");
    }
    // いいね！ボタンを探すObserverの開始
    const buttonObserver = new MutationObserver(getButtonAndStartCheck);
    const config = { childList: true, subtree: false };
    buttonObserver.observe(container, config);
    currentFindButtonObserver = buttonObserver;
    console.debug("Find button observer started");
    // 初回実行
    getButtonAndStartCheck();
  }



  // 必要な要素の準備を待つObserver
  let currentInitElementsObserver = null;

  // 必要な要素を取得する関数
  function getRequiredElements() {
    // いいね！ボタンのコンテナを取得
    const container = document.querySelector(button_container_selector);
    if (!container) {
      console.debug("Button container not found:", button_container_selector);
      return null;
    }
    // フルスクリーン切替えを監視する要素を取得
    const fullscreenTarget = document.querySelector(fullscreen_change_selector);
    if (!fullscreenTarget) {
      console.debug("Fullscreen change target not found:", fullscreen_change_selector);
      return null;
    }
    return { container, fullscreenTarget };
  }

  // 必要な要素が揃ったら実行する処理
  function startNextObservers(_elements) {
    const { container, fullscreenTarget } = _elements;
    // フルスクリーン切替えを監視するObserverの開始
    startFullscreenChangeObserver(fullscreenTarget);
    // いいね！ボタンを探すObserverの開始
    startFindButtonObserver(container);
  }

  // 必要な要素の準備を待つObserverの処理
  // 全ての要素を検知したら自身は破棄して次のObserverを開始
  function getButtonContainerAndStartObserver(mutationsList, observer) {
    // 必要な要素を取得
    const elements = getRequiredElements();
    if (!elements) return;
    const { container, fullscreenTarget } = elements;
    // すべての要素が見つかったら自身のObserverは停止する
    console.debug("Button container found:", container);
    observer.disconnect();
    currentInitElementsObserver = null;
    // 次のObserverを開始
    startNextObservers(elements);
  }

  // エントリーポイント
  init = function() {
    // URLが動画再生ページかどうかを確認
    if (!nicoVideoPageUrlPatternRegExp.test(window.location.href)) {
      console.debug("Not a nico video page, exiting init.");
      return;
    }

    // 必要な要素の準備を待つObserverを登録していたら停止
    if (currentInitElementsObserver) {
      currentInitElementsObserver.disconnect();
      currentInitElementsObserver = null;
      console.debug("Previous init elements observer disconnected");
    }
    // 必要な要素を取得
    const elements = getRequiredElements();
    if (elements) {
      // すべての要素が見つかったら次のObserverを開始
      startNextObservers(elements);
    } else {
      // 必要な要素の準備を待つObserverの開始
      const observer = new MutationObserver(getButtonContainerAndStartObserver);
      const config = { childList: true, subtree: true };
      observer.observe(document.body, config);
      currentInitElementsObserver = observer;
      console.debug("Main observer started for body mutations.");
      // 初回実行
      getButtonContainerAndStartObserver(null, observer);
    }
  }
}
