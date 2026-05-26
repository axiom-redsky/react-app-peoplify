import type { RouteObject, To, NavigateOptions } from 'react-router';
export type TAppRoute = RouteObject & {
	name?: string;
};

export interface IRouter {
	push(to: To, options?: NavigateOptions): void;
	replace(to: To, options?: NavigateOptions): void;
	back(): void;
}

export type TCustomRoute = RouteObject & {
	name?: string;
};
