import { createHighlighter, type Highlighter } from 'shiki';
let highlighterPromise: Promise<Highlighter> | null = null;
export function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ['github-dark', 'github-light', 'one-dark-pro'],
			langs: ['tsx', 'ts', 'js', 'jsx', 'json', 'css', 'html', 'bash'],
		});
	}
	return highlighterPromise;
}
