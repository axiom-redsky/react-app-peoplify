import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { IDateUtil, DateInput } from '@/types/common';

// 포맷 문자열을 이용한 엄격한 파싱을 지원하기 위해 플러그인을 등록합니다.
dayjs.extend(customParseFormat);

const DEFAULT_FORMAT = 'YYYY-MM-DD';
const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const dateUtil: IDateUtil = {
	format(date: DateInput = new Date(), template: string = DEFAULT_FORMAT): string {
		const d = dayjs(date);
		return d.isValid() ? d.format(template) : '';
	},

	now(template: string = DEFAULT_DATETIME_FORMAT): string {
		return dayjs().format(template);
	},

	parse(value: DateInput, template?: string): Date | null {
		const d = template ? dayjs(value as string, template, true) : dayjs(value);
		return d.isValid() ? d.toDate() : null;
	},

	addDays(date: DateInput, amount: number): Date {
		return dayjs(date).add(amount, 'day').toDate();
	},

	addMonths(date: DateInput, amount: number): Date {
		return dayjs(date).add(amount, 'month').toDate();
	},

	diffDays(a: DateInput, b: DateInput): number {
		return dayjs(a).startOf('day').diff(dayjs(b).startOf('day'), 'day');
	},

	isValid(value: DateInput): boolean {
		return dayjs(value).isValid();
	},
};
