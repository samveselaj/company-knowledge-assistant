import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  hint?: string;
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

export default function Field(props: InputProps | TextareaProps) {
  const { label, hint, multiline, className = "", ...rest } = props;

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea className={["ui-textarea", className].filter(Boolean).join(" ")} {...(rest as TextareaProps)} />
      ) : (
        <input className={["ui-input", className].filter(Boolean).join(" ")} {...(rest as InputProps)} />
      )}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
