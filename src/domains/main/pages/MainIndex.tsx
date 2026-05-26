import { Button } from '@/shared/ui';

export default function MainIndex(): React.ReactNode {
	return (
		<div>
			<h1>Main Index</h1>
			<Button onClick={() => alert('Button clicked')}>Click me</Button>
		</div>
	);
}
