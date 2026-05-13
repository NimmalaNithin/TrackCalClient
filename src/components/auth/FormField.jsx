import { Controller } from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

export default function FormField({
  control,
  name,
  label,
  type = "text",
  placeholder = "",
  description = "",
  disabled = false,
  required = false,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={fieldState.invalid}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          <FieldDescription>{description}</FieldDescription>
        </Field>
      )}
    />
  );
}
