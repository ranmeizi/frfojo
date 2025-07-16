export function getPath(port: string) {
  return import.meta.env.DEV
    ? `${location.protocol}//${location.hostname}:${port}`
    : `https://boboan.net:${port}`;
}
