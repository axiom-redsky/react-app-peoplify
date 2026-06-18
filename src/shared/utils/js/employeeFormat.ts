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