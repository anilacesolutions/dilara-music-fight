import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, name, error, hint, ...input }: FormFieldProps) {
  const id = `field-${name}`;
  const noteId = `${id}-note`;
  const note = error ?? hint;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-200">
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        {...input}
      />
      {note && (
        <p id={noteId} className={`mt-1.5 text-xs ${error ? "text-blaze" : "text-muted"}`}>
          {note}
        </p>
      )}
    </div>
  );
}
