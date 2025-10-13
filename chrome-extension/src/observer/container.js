'use strict';

// いいね！ボタンがDOMに追加されるのを監視

let init = null;

{
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

  init = function() {
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
    getButtonContainerAndStartObserver(null, observer);
  }
}
