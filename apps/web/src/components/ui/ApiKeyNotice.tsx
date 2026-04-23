"use client";

import { useEffect, useState } from "react";
import { getHealthConfig } from "@/lib/api";
import { getStoredOpenAiKey } from "@/lib/openai-key";

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
        if (active) {
          setShowNotice(!config.server_openai_key_configured && !getStoredOpenAiKey());
        }
      } catch {
        if (active) {
          setShowNotice(false);
        }
      }
    }

    load();
    window.addEventListener("storage", load);
    window.addEventListener("openai-key-changed", load as EventListener);
    return () => {
      active = false;
      window.removeEventListener("storage", load);
      window.removeEventListener("openai-key-changed", load as EventListener);
    };
  }, []);

  if (!showNotice) {
    return null;
  }

  return (
    <div className="api-key-notice">
      <div>
        <strong>OpenAI key required.</strong> Add your own key to chat and index documents in this hosted app.
      </div>
      <button type="button" className="notice-link" onClick={onManageKey}>
        Add key
      </button>
    </div>
  );
}
