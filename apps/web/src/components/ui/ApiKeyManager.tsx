"use client";

import { useState } from "react";
import Button from "./Button";
import {
  CHAT_PROVIDER_OPTIONS,
  type ChatProvider,
  type ProviderSettings,
  getStoredAiSettings,
  setStoredAiSettings,
} from "@/lib/openai-key";

type Props = { onClose: () => void };

export default function ApiKeyManager({ onClose }: Props) {
  const [settings, setSettings] = useState(() => getStoredAiSettings());
  const [saved, setSaved] = useState(false);

  const activeProvider = CHAT_PROVIDER_OPTIONS.find((provider) => provider.id === settings.activeProvider) || CHAT_PROVIDER_OPTIONS[0];
  const activeSettings = settings.providers[settings.activeProvider];

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
    <div className="api-key-panel">
      <div className="api-key-panel-header">
        <div>
          <div className="page-eyebrow">AI Provider</div>
          <h2 className="section-title">Choose your chat model</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close AI provider panel">
          <span aria-hidden="true">×</span>
        </button>
      </div>
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
        <span className="field-label">Chat model</span>
        <div className="model-choice-grid">
          {activeProvider.models.map((model) => (
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

      <div className="api-key-actions">
        <Button
          variant="primary"
          onClick={() => {
            setStoredAiSettings(settings);
            setSaved(true);
          }}
        >
          Save settings
        </Button>
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
      </div>
      {saved ? <div className="field-hint">Saved in this browser. Future chat requests will use {activeProvider.label} with {activeSettings.chatModel}.</div> : null}
    </div>
  );
}
