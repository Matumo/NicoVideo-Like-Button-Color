// 監視機能

{
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
        window.dispatchEvent(new CustomEvent(nicoVideoPageUrlChangedEventName, {}));
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
}
