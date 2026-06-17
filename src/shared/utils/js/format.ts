export const formatPhoneNumber = (value?: string | null): string => {
  const numbers = String(value ?? '').replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 3) return numbers;

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
};

