export type ChatProvider = "openai" | "grok" | "claude";

export type ProviderSettings = {
  apiKey: string;
  chatModel: string;
};

export type AiSettings = {
  activeProvider: ChatProvider;
  providers: Record<ChatProvider, ProviderSettings>;
};

export const OPENAI_KEY_STORAGE = "company-knowledge-openai-key";
export const AI_SETTINGS_STORAGE = "company-knowledge-ai-settings-v1";
export const AI_SETTINGS_CHANGED_EVENT = "ai-settings-changed";

export const CHAT_PROVIDER_OPTIONS: Array<{
  id: ChatProvider;
  label: string;
  keyLabel: string;
  keyPlaceholder: string;
  models: Array<{ id: string; label: string }>;
}> = [
  {
    id: "openai",
    label: "OpenAI",
    keyLabel: "OpenAI API key",
    keyPlaceholder: "sk-...",
    models: [
      { id: "gpt-5.2", label: "GPT-5.2" },
      { id: "gpt-5.2-chat-latest", label: "GPT-5.2 Chat" },
      { id: "gpt-5-mini", label: "GPT-5 mini" },
      { id: "gpt-5-nano", label: "GPT-5 nano" },
      { id: "gpt-4.1", label: "GPT-4.1" },
    ],
  },
  {
    id: "grok",
    label: "Grok",
    keyLabel: "xAI API key",
    keyPlaceholder: "xai-...",
    models: [
      { id: "grok-4.20-reasoning", label: "Grok 4.20 reasoning" },
      { id: "grok-4", label: "Grok 4" },
      { id: "grok-4-fast-reasoning", label: "Grok 4 fast reasoning" },
      { id: "grok-4-fast-non-reasoning", label: "Grok 4 fast" },
      { id: "grok-3-mini", label: "Grok 3 mini" },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    keyLabel: "Anthropic API key",
    keyPlaceholder: "sk-ant-...",
    models: [
      { id: "claude-opus-4-1-20250805", label: "Claude Opus 4.1" },
      { id: "claude-opus-4-20250514", label: "Claude Opus 4" },
      { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
      { id: "claude-3-7-sonnet-20250219", label: "Claude Sonnet 3.7" },
      { id: "claude-3-5-haiku-20241022", label: "Claude Haiku 3.5" },
    ],
  },
];

export const DEFAULT_AI_SETTINGS: AiSettings = {
  activeProvider: "openai",
  providers: {
    openai: { apiKey: "", chatModel: "gpt-5.2" },
    grok: { apiKey: "", chatModel: "grok-4.20-reasoning" },
    claude: { apiKey: "", chatModel: "claude-sonnet-4-20250514" },
  },
};

function dispatchSettingsChanged() {
  window.dispatchEvent(new CustomEvent(AI_SETTINGS_CHANGED_EVENT));
  window.dispatchEvent(new CustomEvent("openai-key-changed"));
}

function normalizeProvider(value: unknown): ChatProvider {
  if (value === "grok" || value === "claude" || value === "openai") {
    return value;
  }
  return DEFAULT_AI_SETTINGS.activeProvider;
}

function normalizeSettings(value: Partial<AiSettings> | null, legacyOpenAiKey = ""): AiSettings {
  return {
    activeProvider: normalizeProvider(value?.activeProvider),
    providers: {
      openai: {
        apiKey: value?.providers?.openai?.apiKey || legacyOpenAiKey,
        chatModel: value?.providers?.openai?.chatModel || DEFAULT_AI_SETTINGS.providers.openai.chatModel,
      },
      grok: {
        apiKey: value?.providers?.grok?.apiKey || "",
        chatModel: value?.providers?.grok?.chatModel || DEFAULT_AI_SETTINGS.providers.grok.chatModel,
      },
      claude: {
        apiKey: value?.providers?.claude?.apiKey || "",
        chatModel: value?.providers?.claude?.chatModel || DEFAULT_AI_SETTINGS.providers.claude.chatModel,
      },
    },
  };
}

export function getStoredAiSettings(): AiSettings {
  if (typeof window === "undefined") {
    return DEFAULT_AI_SETTINGS;
  }

  const legacyOpenAiKey = window.localStorage.getItem(OPENAI_KEY_STORAGE) || "";
  const rawSettings = window.localStorage.getItem(AI_SETTINGS_STORAGE);
  if (!rawSettings) {
    return normalizeSettings(null, legacyOpenAiKey);
  }

  try {
    return normalizeSettings(JSON.parse(rawSettings), legacyOpenAiKey);
  } catch {
    return normalizeSettings(null, legacyOpenAiKey);
  }
}

export function setStoredAiSettings(value: AiSettings) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmedSettings = normalizeSettings({
    activeProvider: value.activeProvider,
    providers: {
      openai: {
        apiKey: value.providers.openai.apiKey.trim(),
        chatModel: value.providers.openai.chatModel.trim(),
      },
      grok: {
        apiKey: value.providers.grok.apiKey.trim(),
        chatModel: value.providers.grok.chatModel.trim(),
      },
      claude: {
        apiKey: value.providers.claude.apiKey.trim(),
        chatModel: value.providers.claude.chatModel.trim(),
      },
    },
  });

  window.localStorage.setItem(AI_SETTINGS_STORAGE, JSON.stringify(trimmedSettings));
  if (trimmedSettings.providers.openai.apiKey) {
    window.localStorage.setItem(OPENAI_KEY_STORAGE, trimmedSettings.providers.openai.apiKey);
  } else {
    window.localStorage.removeItem(OPENAI_KEY_STORAGE);
  }
  dispatchSettingsChanged();
}

export function getStoredOpenAiKey() {
  return getStoredAiSettings().providers.openai.apiKey;
}

export function setStoredOpenAiKey(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  const settings = getStoredAiSettings();
  setStoredAiSettings({
    ...settings,
    providers: {
      ...settings.providers,
      openai: {
        ...settings.providers.openai,
        apiKey: value,
      },
    },
  });
}
