import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { normalizePath } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = normalizePath(resolve(__dirname, '..'));

/**
 * Windows 경로 버그 수정:
 * Storybook builder-vite 내부의 pathe 라이브러리에서
 * cwd()가 소문자 드라이브 'c:'를 반환하고
 * normalizeWindowsPath가 대문자 'C:'를 반환해서
 * importers 키가 './C:/...' 형태(절대 경로)가 되는 버그를 수정합니다.
 * 키를 './src/__stories__/...' 형태(프로젝트 루트 기준 상대 경로)로 교체합니다.
 */
function fixWindowsStorybookPaths(): Plugin {
	return {
		name: 'fix-windows-storybook-paths',
		enforce: 'post',
		transform(code, id) {
			if (!id.includes('storybook-stories')) return;
			const rootWithSlash = root + '/';
			return code.replace(/"(\.\/[A-Za-z]:[^"]+)"/g, (match, absKey: string) => {
				const absPath = absKey.startsWith('./') ? absKey.slice(2) : absKey;
				const normalized = normalizePath(absPath);
				if (!normalized.includes(rootWithSlash)) return match;
				const relPath = './' + normalized.slice(rootWithSlash.length);
				return `"${relPath}"`;
			});
		},
	};
}

const config: StorybookConfig = {
	staticDirs: ['../src/__stories__/public'],
	stories: ['../src/__stories__/**/*.mdx', '../src/__stories__/**/*.stories.@(ts|tsx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-onboarding', '@chromatic-com/storybook'],
	framework: '@storybook/react-vite',
	async viteFinal(config) {
		return {
			...config,
			plugins: [...(config.plugins ?? []), fixWindowsStorybookPaths(), tailwindcss()],
			resolve: {
				...config.resolve,
				alias: {
					...config.resolve?.alias,
					'@': normalizePath(resolve(root, 'src')),
					'@axiom/components/ui': normalizePath(resolve(root, 'src/shared/ui')),
					'@axiom/hooks': normalizePath(resolve(root, 'src/core/hooks/index.ts')),
					'@app-types': normalizePath(resolve(root, 'src/types')),
				},
			},
		};
	},
};

export default config;
