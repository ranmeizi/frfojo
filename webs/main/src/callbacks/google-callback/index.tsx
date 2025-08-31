export async function checkIfGoogleCallback(next: AsyncProcessFn) {
  if (location.pathname.endsWith("google-callback")) {
    window.ffj_loaded();
    handleGoogleCallback();
  } else {
    await next();
  }
}

// 回调消息
function handleGoogleCallback() {
  // 获取 回掉页面 # 后的参数
  const params = getSearchParams();

  window.opener?.postMessage({
    type: "google-callback",
    payload: params,
  });
  window.close();
}

// 获取 search 中的 params
function getSearchParams() {
  const params = new URLSearchParams(window.location.search.slice(1));
  return Object.fromEntries(params);
}

// 获取 hash 中的 params
function getHashParams() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return Object.fromEntries(params);
}
