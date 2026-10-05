"use client";

export function ConfirmSubmit({
  label,
  message,
  className = "btn btn-line",
  form,
}: {
  label: string;
  message: string;
  className?: string;
  /** Submit a different form by id (lets a delete button sit inside a save form's action row). */
  form?: string;
}) {
  return (
    <button
      className={className}
      type="submit"
      form={form}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
