import type { TAppRoute } from '@/types/router';
import loadable from '@loadable/component';

const LoginPage = loadable(() => import('@/domains/auth/pages/LoginPage'));

const routes: TAppRoute[] = [
  {
    path: 'login',
    element: <LoginPage />,
    name: '로그인',
  },
];

export default routes;