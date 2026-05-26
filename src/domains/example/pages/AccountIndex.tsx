import React, { useEffect } from 'react';

interface IAccountIndexProps {
	test?: string;
}

export default function AccountIndex({}: IAccountIndexProps): React.ReactNode {
	// useEffect hooks
	useEffect(() => {
		// ...
	}, []);

	return (
		<>
			<div>계좌 메인 Page!!</div>
		</>
	);
}
