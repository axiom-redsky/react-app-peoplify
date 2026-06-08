import { dateUtil } from './date';
import { numberUtil } from './number';
import { stringUtil } from './string';
import type { IUtils } from '@/types/common';

export function createWindowUtil(): IUtils {
	return {
		date: dateUtil,
		number: numberUtil,
		string: stringUtil,
	};
}

// 전역 $util 등록
export function registerWindowUtil(): void {
	window.$util = createWindowUtil();
}

export { dateUtil, numberUtil, stringUtil };
