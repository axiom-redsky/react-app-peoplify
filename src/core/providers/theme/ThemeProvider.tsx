import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from '@/core/context/theme/ThemeContext';

const STORAGE_KEY = 'peoplify-theme';

function getInitialTheme(): Theme {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'dark' || stored === 'light') return stored;
	return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
