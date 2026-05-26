import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/core/providers/AppProviders.tsx';
import App from './App.tsx';
import './assets/styles/app.css';
import { initApiConfig } from '@/core/api/api-config';

// 앱에서 REST API 호출용 API 설정(전역에 저장된 : window.__MF_APP_CONFIG__) =============================
const apiConfig = {
	baseURL: import.meta.env.VITE_EXTERNAL_API_BASE_URL2,
};
initApiConfig(apiConfig);

createRoot(document.getElementById('root')!).render(
	<AppProviders>
		<App />
	</AppProviders>,
);
