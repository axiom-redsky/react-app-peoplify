export const getFieldClassName = (
  error?: string,
  className = ''
) => {
  return [
    'h-9 bg-muted/60 shadow-sm',
    error
      ? '!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/20'
      : 'border-slate-300 dark:border-slate-600',
    className,
  ]
    .filter(Boolean)
    .join(' ');
};