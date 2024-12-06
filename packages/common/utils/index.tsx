export function loadScript(url: string) {
  const memo: Record<string, any> = {};
  if (url in memo) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      resolve("");
      memo[url] = true;
    };
    script.onerror = reject;

    document.head.appendChild(script);
  });
}
