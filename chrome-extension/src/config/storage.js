// 拡張機能のストレージから設定された色を取得
let likeButtonColor = null;

async function fetchLikeButtonColor() {
  ({ likeButtonColor } = await chrome.storage.local.get({ likeButtonColor: "#FF8FA8" }));
  console.debug("likeButtonColor:", likeButtonColor);
}
