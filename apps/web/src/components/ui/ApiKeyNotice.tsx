"use client";

import { useEffect, useState } from "react";
import { getHealthConfig } from "@/lib/api";
import { AI_SETTINGS_CHANGED_EVENT, getStoredAiSettings } from "@/lib/openai-key";

type Props = {
  onManageKey: () => void;
};

export default function ApiKeyNotice({ onManageKey }: Props) {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const config = await getHealthConfig();
        const settings = getStoredAiSettings();
        const hasOpenAiKey = Boolean(settings.providers.openai.apiKey);
        const activeProviderSettings = settings.providers[settings.activeProvider];
        const hasActiveProviderKey = Boolean(activeProviderSettings.apiKey);
        const hasServerActiveProviderKey = Boolean(config.server_chat_keys_configured?.[settings.activeProvider]);

        if (active) {
          setShowNotice(
            (!config.server_openai_key_configured && !hasOpenAiKey) ||
              (!hasServerActiveProviderKey && !hasActiveProviderKey),
          );
        }
      } catch {
        if (active) {
          setShowNotice(false);
        }
      }
    }

    load();
    window.addEventListener("storage", load);
    window.addEventListener(AI_SETTINGS_CHANGED_EVENT, load as EventListener);
    return () => {
      active = false;
      window.removeEventListener("storage", load);
      window.removeEventListener(AI_SETTINGS_CHANGED_EVENT, load as EventListener);
    };
  }, []);

  if (!showNotice) {
    return null;
  }

  return (
    <div className="api-key-notice">
      <div>
        <strong>API key required.</strong> Add an OpenAI key for retrieval and a provider key for chat answers.
      </div>
      <button type="button" className="notice-link" onClick={onManageKey}>
        Add key
      </button>
    </div>
  );
}
