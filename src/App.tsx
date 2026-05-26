import { RouterProvider } from 'react-router';
import router from '@/core/router';

function App() {
	return (
		<>
			{/* TODO: 추가 html 요소가 있으면 추가. */}
			<RouterProvider router={router} />
		</>
	);
}

export default App;
