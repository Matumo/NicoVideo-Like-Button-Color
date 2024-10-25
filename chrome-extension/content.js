(async function() {
  'use strict';

  console.debug("Content script loaded");

  // 拡張機能のストレージから設定された色を取得
  const { likeButtonColor } = await chrome.storage.local.get({ likeButtonColor: "#FF8FA8" });
  console.debug("likeButtonColor:", likeButtonColor);

  // いいねボタンがDOMに追加されるのを監視
  const observer = new MutationObserver((mutations, observerInstance) => {
    const button = document.getElementById('hover-card::rf::trigger');
    if (button) {
      // ボタンが見つかったら監視を停止
      observerInstance.disconnect();
      console.debug("Button found:", button);

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
      // いいね！ボタンの変更の監視を開始
      attributeObserver.observe(button, config);

      // 初期状態で色を更新
      updateSvgColor();
      console.debug("Button and SVG path loaded");
    }
  });

  // ボタン追加検出の監視を開始
  observer.observe(document.body, { childList: true, subtree: true });
})();
