export const OPENAI_KEY_STORAGE = "company-knowledge-openai-key";

export function getStoredOpenAiKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(OPENAI_KEY_STORAGE) || "";
}

export function setStoredOpenAiKey(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(OPENAI_KEY_STORAGE, trimmed);
    window.dispatchEvent(new CustomEvent("openai-key-changed"));
    return;
  }

  window.localStorage.removeItem(OPENAI_KEY_STORAGE);
  window.dispatchEvent(new CustomEvent("openai-key-changed"));
}
