"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import { getProviderModels } from "@/lib/api";
import {
  CHAT_PROVIDER_OPTIONS,
  type ChatProvider,
  type ProviderSettings,
  getStoredAiSettings,
  setStoredAiSettings,
} from "@/lib/openai-key";

type Props = { onClose: () => void };

type ModelEntry = { id: string; label: string };
type DynamicState = {
  models: ModelEntry[] | null;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
};

const initialDynamicState: DynamicState = {
  models: null,
  fetchedAt: null,
  loading: false,
  error: null,
};

export default function ApiKeyManager({ onClose }: Props) {
  const [settings, setSettings] = useState(() => getStoredAiSettings());
  const [saved, setSaved] = useState(false);
  const [dynamicByProvider, setDynamicByProvider] = useState<Record<ChatProvider, DynamicState>>({
    openai: { ...initialDynamicState },
    grok: { ...initialDynamicState },
    claude: { ...initialDynamicState },
  });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const activeProvider = CHAT_PROVIDER_OPTIONS.find((provider) => provider.id === settings.activeProvider) || CHAT_PROVIDER_OPTIONS[0];
  const activeSettings = settings.providers[settings.activeProvider];
  const activeDynamic = dynamicByProvider[settings.activeProvider];

  const loadModels = useCallback(async (provider: ChatProvider, refresh = false) => {
    setDynamicByProvider((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], loading: true, error: null },
    }));
    try {
      const data = await getProviderModels(provider, { refresh });
      const models: ModelEntry[] = Array.isArray(data?.models) ? data.models : [];
      setDynamicByProvider((prev) => ({
        ...prev,
        [provider]: {
          models: models.length > 0 ? models : prev[provider].models,
          fetchedAt: typeof data?.fetched_at === "number" ? data.fetched_at * 1000 : Date.now(),
          loading: false,
          error: models.length === 0 ? "Provider returned no chat models." : null,
        },
      }));
    } catch (err) {
      setDynamicByProvider((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          loading: false,
          error: (err as Error).message || "Failed to load models.",
        },
      }));
    }
  }, []);

  useEffect(() => {
    const provider = settings.activeProvider;
    const state = dynamicByProvider[provider];
    if (state.models || state.loading) return;
    loadModels(provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.activeProvider]);

  const visibleModels: ModelEntry[] = useMemo(() => {
    if (activeDynamic.models && activeDynamic.models.length > 0) return activeDynamic.models;
    return activeProvider.models;
  }, [activeDynamic.models, activeProvider.models]);

  const fetchedLabel = activeDynamic.fetchedAt
    ? new Date(activeDynamic.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  function setActiveProvider(provider: ChatProvider) {
    setSaved(false);
    setSettings((current) => ({ ...current, activeProvider: provider }));
  }

  function updateActiveProviderSettings(value: Partial<ProviderSettings>) {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [current.activeProvider]: {
          ...current.providers[current.activeProvider],
          ...value,
        },
      },
    }));
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-title"
        tabIndex={-1}
      >
        <header className="modal-header">
          <div>
            <div className="page-eyebrow">AI Provider</div>
            <h2 id="api-key-title" className="section-title">Choose your chat model</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close AI provider panel">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="modal-body">
          <p className="section-copy">
            Keys stay in this browser. OpenAI is still used for document embeddings; the selected provider powers chat answers.
          </p>

          <div className="provider-tabs" role="tablist" aria-label="AI provider">
            {CHAT_PROVIDER_OPTIONS.map((provider) => (
              <button
                key={provider.id}
                type="button"
                role="tab"
                aria-selected={settings.activeProvider === provider.id}
                className={`provider-tab${settings.activeProvider === provider.id ? " active" : ""}`}
                onClick={() => setActiveProvider(provider.id)}
              >
                {provider.label}
              </button>
            ))}
          </div>

          <label className="field">
            <span className="field-label">{activeProvider.keyLabel}</span>
            <input
              className="ui-input"
              type="password"
              value={activeSettings.apiKey}
              onChange={(event) => updateActiveProviderSettings({ apiKey: event.target.value })}
              placeholder={activeProvider.keyPlaceholder}
              autoComplete="off"
            />
          </label>

          <div className="field">
            <div className="field-label-row">
              <span className="field-label">Chat model</span>
              <div className="model-source">
                {activeDynamic.loading ? (
                  <span className="model-source-meta">Loading…</span>
                ) : activeDynamic.error ? (
                  <span className="model-source-meta model-source-error">{activeDynamic.error}</span>
                ) : fetchedLabel ? (
                  <span className="model-source-meta">Live · updated {fetchedLabel}</span>
                ) : (
                  <span className="model-source-meta">Curated list</span>
                )}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => loadModels(settings.activeProvider, true)}
                  disabled={activeDynamic.loading}
                  aria-label="Refresh model list"
                >
                  ↻ Refresh
                </button>
              </div>
            </div>
            <div className="model-choice-grid">
              {visibleModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`model-choice${activeSettings.chatModel === model.id ? " active" : ""}`}
                  onClick={() => updateActiveProviderSettings({ chatModel: model.id })}
                >
                  <span>{model.label}</span>
                  <small>{model.id}</small>
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">Custom model ID</span>
            <input
              className="ui-input"
              value={activeSettings.chatModel}
              onChange={(event) => updateActiveProviderSettings({ chatModel: event.target.value })}
              placeholder="provider-model-id"
              autoComplete="off"
            />
          </label>

          {saved ? (
            <div className="field-hint">
              Saved in this browser. Future chat requests will use {activeProvider.label} with {activeSettings.chatModel}.
            </div>
          ) : null}
        </div>

        <footer className="modal-footer">
          <Button
            onClick={() => {
              const clearedSettings = {
                ...settings,
                providers: {
                  ...settings.providers,
                  [settings.activeProvider]: {
                    ...activeSettings,
                    apiKey: "",
                  },
                },
              };
              setSettings(clearedSettings);
              setStoredAiSettings(clearedSettings);
              setSaved(true);
            }}
          >
            Clear key
          </Button>
          <div className="modal-footer-primary">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setStoredAiSettings(settings);
                setSaved(true);
              }}
            >
              Save settings
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
