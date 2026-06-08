import type { INumberUtil } from '@/types/common';

export const numberUtil: INumberUtil = {
	comma(value: number | string): string {
		const num = typeof value === 'string' ? Number(value) : value;
		if (!Number.isFinite(num)) return '';
		// 정수부에만 천 단위 콤마를 적용하고 소수부는 그대로 유지합니다.
		const [intPart, decimalPart] = String(num).split('.');
		const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return decimalPart ? `${withComma}.${decimalPart}` : withComma;
	},

	round(value: number, digits: number = 0): number {
		const factor = 10 ** digits;
		return Math.round(value * factor) / factor;
	},

	clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	},

	toNumber(value: unknown, fallback: number = 0): number {
		if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
		if (typeof value === 'string') {
			// 숫자, 부호, 소수점만 남기고 제거합니다. (콤마/통화기호 등 제거)
			const cleaned = value.replace(/[^0-9.-]/g, '');
			const num = Number(cleaned);
			return Number.isFinite(num) && cleaned !== '' ? num : fallback;
		}
		return fallback;
	},

	percent(value: number, digits: number = 1): string {
		if (!Number.isFinite(value)) return '';
		return `${(value * 100).toFixed(digits)}%`;
	},
};
