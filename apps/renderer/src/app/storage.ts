export async function readStored(key: string): Promise<string | null> {
  if (window.easyaiDesktop) return window.easyaiDesktop.storageGet(key);
  return window.localStorage.getItem(key);
}

export async function writeStored(key: string, value: string): Promise<void> {
  if (window.easyaiDesktop) return window.easyaiDesktop.storageSet(key, value);
  window.localStorage.setItem(key, value);
}
