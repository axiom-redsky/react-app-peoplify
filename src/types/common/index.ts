/**
 * 전역 $util 타입 정의
 *
 * window.$util 로 제공되는 기본 유틸리티 함수들의 타입입니다.
 * $router(@/types/router)와 동일하게, 구현은 src/core/utils/util 에 위치합니다.
 */

/** 날짜 유틸 - $util.date */
export interface IDateUtil {
	/** 날짜를 지정한 포맷 문자열로 변환합니다. (기본: YYYY-MM-DD) */
	format(date?: DateInput, template?: string): string;
	/** 현재 시각을 지정한 포맷으로 반환합니다. (기본: YYYY-MM-DD HH:mm:ss) */
	now(template?: string): string;
	/** 문자열/숫자/Date를 Date 객체로 파싱합니다. 유효하지 않으면 null을 반환합니다. */
	parse(value: DateInput, template?: string): Date | null;
	/** 날짜에 일(day)을 더합니다. (음수 가능) */
	addDays(date: DateInput, amount: number): Date;
	/** 날짜에 월(month)을 더합니다. (음수 가능) */
	addMonths(date: DateInput, amount: number): Date;
	/** 두 날짜 간의 일(day) 차이를 반환합니다. (a - b) */
	diffDays(a: DateInput, b: DateInput): number;
	/** 유효한 날짜 값인지 확인합니다. */
	isValid(value: DateInput): boolean;
}

/** 숫자 유틸 - $util.number */
export interface INumberUtil {
	/** 천 단위 콤마를 추가한 문자열로 변환합니다. (예: 1234567 -> "1,234,567") */
	comma(value: number | string): string;
	/** 지정한 소수 자릿수로 반올림합니다. (기본: 0) */
	round(value: number, digits?: number): number;
	/** 값을 [min, max] 범위로 제한합니다. */
	clamp(value: number, min: number, max: number): number;
	/** 문자열에서 숫자만 추출하여 number로 변환합니다. 실패 시 fallback을 반환합니다. */
	toNumber(value: unknown, fallback?: number): number;
	/** 0~1 비율을 백분율 문자열로 변환합니다. (예: 0.123 -> "12.3%") */
	percent(value: number, digits?: number): string;
}

/** 문자열 유틸 - $util.string */
export interface IStringUtil {
	/** null/undefined/공백 문자열 여부를 확인합니다. */
	isEmpty(value: unknown): boolean;
	/** 첫 글자를 대문자로 변환합니다. */
	capitalize(value: string): string;
	/** 지정 길이를 초과하면 잘라내고 말줄임표(suffix)를 붙입니다. */
	truncate(value: string, length: number, suffix?: string): string;
	/** 지정 길이만큼 문자(기본 '0')로 앞을 채웁니다. */
	padStart(value: string | number, length: number, fill?: string): string;
	/** 모든 공백을 제거합니다. */
	removeWhitespace(value: string): string;
	/** 일부 문자를 마스킹 문자로 가립니다. (start~end 인덱스 구간) */
	mask(value: string, start: number, end: number, maskChar?: string): string;
}

/** 전역 $util 루트 타입 */
export interface IUtils {
	date: IDateUtil;
	number: INumberUtil;
	string: IStringUtil;
}

/** date 유틸이 허용하는 입력 타입 */
export type DateInput = Date | string | number;
