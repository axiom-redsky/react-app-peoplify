import { ExternalLinkIcon } from 'lucide-react';

interface GithubLinkButtonProps {
	onClick?: () => void;
}

export default function GithubLinkButton({ onClick }: GithubLinkButtonProps): React.ReactNode {
	return (
		<button
			onClick={onClick}
			className="relative flex items-center justify-center gap-1.5 px-3 h-11 rounded-full bg-card text-gray-500 shadow-[0_2px_4px_rgba(169,184,200,0.25)] transition-colors hover:bg-accent hover:text-gray-700 dark:text-white dark:shadow-[0_2px_3px_#1a1a2f] dark:hover:bg-white/10"
		>
			<span>GitHub</span>
			<ExternalLinkIcon className="hidden dark:block" />
			<ExternalLinkIcon className="dark:hidden" />
		</button>
	);
}
