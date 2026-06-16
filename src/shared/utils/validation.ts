export type RequiredRule<T> = {
  key: keyof T;
  message?: string;
};

export type ValidationResult<T> = {
  isValid: boolean;
  firstErrorKey: keyof T | null;
  errors: Partial<Record<keyof T, string>>;
};

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const validateRequired = <T extends Record<string, unknown>>(
  values: T,
  rules: RequiredRule<T>[],
): ValidationResult<T> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const rule of rules) {
    if (isEmpty(values[rule.key])) {
      errors[rule.key] = rule.message ?? '필수 입력 항목입니다.';
    }
  }

  const firstErrorKey = Object.keys(errors)[0] as keyof T | undefined;

  return {
    isValid: !firstErrorKey,
    firstErrorKey: firstErrorKey ?? null,
    errors,
  };
};