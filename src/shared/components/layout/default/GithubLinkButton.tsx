import { ExternalLinkIcon } from 'lucide-react';

interface GithubLinkButtonProps {
	onClick?: () => void;
}

export default function GithubLinkButton({ onClick }: GithubLinkButtonProps): React.ReactNode {
	return (
		<button
			onClick={onClick}
			className="relative flex items-center justify-center gap-1.5 px-3 text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
		>
			<span>GitHub</span>
			<ExternalLinkIcon className="hidden dark:block" />
			<ExternalLinkIcon className="dark:hidden" />
		</button>
	);
}
