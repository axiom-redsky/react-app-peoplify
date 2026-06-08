import type { IStringUtil } from '@/types/common';

export const stringUtil: IStringUtil = {
	isEmpty(value: unknown): boolean {
		if (value === null || value === undefined) return true;
		if (typeof value === 'string') return value.trim().length === 0;
		return false;
	},

	capitalize(value: string): string {
		if (!value) return value;
		return value.charAt(0).toUpperCase() + value.slice(1);
	},

	truncate(value: string, length: number, suffix: string = '...'): string {
		if (value.length <= length) return value;
		return value.slice(0, length) + suffix;
	},

	padStart(value: string | number, length: number, fill: string = '0'): string {
		return String(value).padStart(length, fill);
	},

	removeWhitespace(value: string): string {
		return value.replace(/\s+/g, '');
	},

	mask(value: string, start: number, end: number, maskChar: string = '*'): string {
		if (!value) return value;
		const from = Math.max(0, start);
		const to = Math.min(value.length, end);
		if (from >= to) return value;
		return value.slice(0, from) + maskChar.repeat(to - from) + value.slice(to);
	},
};
