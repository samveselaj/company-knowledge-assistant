"use client";

import { useState } from "react";
import Button from "./Button";
import { getStoredOpenAiKey, setStoredOpenAiKey } from "@/lib/openai-key";

type Props = { onClose: () => void };

export default function ApiKeyManager({ onClose }: Props) {
  const [value, setValue] = useState(() => getStoredOpenAiKey());
  const [saved, setSaved] = useState(false);

  return (
    <div className="api-key-panel">
      <div className="api-key-panel-header">
        <div>
          <div className="page-eyebrow">OpenAI Key</div>
          <h2 className="section-title">Use your own API key</h2>
        </div>
        <Button onClick={onClose} size="sm">
          Close
        </Button>
      </div>
      <p className="section-copy">
        Your key is stored in this browser only and is sent with requests to power chat and indexing.
      </p>
      <label className="field">
        <span className="field-label">API key</span>
        <input
          className="ui-input"
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="sk-..."
          autoComplete="off"
        />
      </label>
      <div className="api-key-actions">
        <Button
          variant="primary"
          onClick={() => {
            setStoredOpenAiKey(value);
            setSaved(true);
          }}
        >
          Save key
        </Button>
        <Button
          onClick={() => {
            setValue("");
            setStoredOpenAiKey("");
            setSaved(true);
          }}
        >
          Clear key
        </Button>
      </div>
      {saved ? <div className="field-hint">Saved in this browser. Future chat and indexing requests will use this key.</div> : null}
    </div>
  );
}
