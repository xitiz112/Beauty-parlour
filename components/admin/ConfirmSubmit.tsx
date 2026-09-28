"use client";

export function ConfirmSubmit({
  label,
  message,
  className = "btn btn-line",
}: {
  label: string;
  message: string;
  className?: string;
}) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
