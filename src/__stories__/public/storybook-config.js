(function () {
	const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
	window.__SB_CONFIG__ = {
		parentOrigin: isDev ? 'http://localhost:3002' : 'http://redsky0212.dothome.co.kr',
		// 필요하면 여기 계속 추가
		// basePath: isDev ? '/' : '/2026/mfe-multirepo/storybook/',
	};
})();
