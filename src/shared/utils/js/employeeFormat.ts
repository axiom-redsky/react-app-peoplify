export const formatDate = (dateString: string | null): string => {
	if (!dateString) return '-';

	return new Date(dateString).toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

export const formatRate = (ratePct: number): string => {
	return `${ratePct}%`;
};

export const formatAmount = (amount?: number | null) => {
	if (amount === undefined || amount === null) return '-';

	return `${amount.toLocaleString()}원`;
};

export const formatDateValue = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};