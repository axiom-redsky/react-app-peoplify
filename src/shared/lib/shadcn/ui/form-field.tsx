import type { ReactNode } from 'react';

type FormFieldProps = {
  name?: string;
  label: string;
  required?: boolean;
  requiredText?: string;
  error?: string;
  children: ReactNode;
};
/** 필수체크 할경우 해당 부분에 추가 
		const result = validateRequired(values, [
			{ key: 'FormField 내부에 name 값', message: '하단 표기될 문구' },
			예시
			{ key: 'email', message: '이메일을 입력해주세요.' },
			{ key: 'phone', message: '연락처를 입력해주세요.' },
		]);
*/
export function FormField({
  name,
  label,
  required = false, /** 필수 * 표기 할 경우 required 추가 */
  requiredText = '*',
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground mb-1"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-400">
            {requiredText}
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}