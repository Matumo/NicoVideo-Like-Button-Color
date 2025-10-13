// 拡張機能のストレージから設定された色を取得
const { likeButtonColor } = await chrome.storage.local.get({ likeButtonColor: "#FF8FA8" });
console.debug("likeButtonColor:", likeButtonColor);
