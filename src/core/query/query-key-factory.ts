import type { QueryParams } from '../types/api-types';

export const createQueryKey = (endpoint: string, params?: QueryParams): readonly unknown[] => {
	const pathSegments = endpoint.split('/').filter(Boolean);

	if (!params || Object.keys(params).length === 0) {
		return pathSegments;
	}

	const cleanParams = Object.entries(params).reduce<QueryParams>((acc, [key, value]) => {
		if (value !== undefined && value !== null) {
			acc[key] = value;
		}
		return acc;
	}, {});

	if (Object.keys(cleanParams).length === 0) {
		return pathSegments;
	}

	return [...pathSegments, cleanParams] as const;
};
