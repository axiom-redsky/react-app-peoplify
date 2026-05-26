export interface ISectionHeaderProps {
	title: string;
	description?: string;
}

export default function SectionHeader({ title, description }: ISectionHeaderProps): React.ReactNode {
	return (
		<div className="space-y-1 pb-1">
			<h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
			{description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
		</div>
	);
}