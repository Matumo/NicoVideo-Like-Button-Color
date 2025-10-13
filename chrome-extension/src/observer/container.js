'use strict';

// いいね！ボタンがDOMに追加されるのを監視

let init = null;

{
  // いいね！ボタンを探すObserver
  let currentFindButtonObserver = null;

  // いいね！ボタンのコンテナを探すObserver
  let currentFindButtonContainerObserver = null;

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

  // いいね！ボタンのコンテナを探すObserverの処理
  // 追加を検知したら自身は破棄して次のObserverを開始
  function getButtonContainerAndStartObserver(mutationsList, observer) {
    // コンテナ要素を取得
    const container = document.querySelector(button_container_selector);
    if (!container) return;
    // コンテナが見つかったら自身のObserverは停止する
    console.debug("Button container found:", container);
    observer.disconnect();
    // いいね！ボタンを探すObserverの開始
    startFindButtonObserver(container);
  }

  // エントリーポイント
  init = function() {
    // URLが動画再生ページかどうかを確認
    if (!nicoVideoPageUrlPatternRegExp.test(window.location.href)) {
      console.debug("Not a nico video page, exiting init.");
      return;
    }

    // 既にいいね！ボタンのコンテナを探すObserverを登録していたら停止
    if (currentFindButtonContainerObserver) {
      currentFindButtonContainerObserver.disconnect();
      currentFindButtonContainerObserver = null;
      console.debug("Previous find button container observer disconnected");
    }

    // いいね！ボタンのコンテナを取得
    const container = document.querySelector(button_container_selector);
    if (container) {
      // コンテナが見つかったらいいね！ボタンを探すObserverの開始
      console.debug("Button container found:", container);
      startFindButtonObserver(container);
    } else {
      // いいね！ボタンのコンテナを探すObserverの開始
      const observer = new MutationObserver(getButtonContainerAndStartObserver);
      const config = { childList: true, subtree: true };
      observer.observe(document.body, config);
      currentFindButtonContainerObserver = observer;
      console.debug("Main observer started for body mutations.");
      // 初回実行
      getButtonContainerAndStartObserver(null, observer);
    }
  }
}
