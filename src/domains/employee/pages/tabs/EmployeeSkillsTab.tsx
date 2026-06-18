type Props = {
	skills: string[];
};

const commonSkills = ['Java', 'Spring Boot', 'React', 'Vue', 'Python', 'Oracle', 'MySQL', 'AWS', 'Docker', 'Git'];

export default function EmployeeSkillsTab({ skills }: Props) {
	return (
		<div className="bg-card rounded-xl border p-5">
			<div className="flex items-center gap-2 mb-5">
				<h3 className="font-semibold text-foreground text-base">기술스택</h3>
			</div>

			<div className="border border-dashed rounded-lg p-4 mb-3 min-h-[56px] flex flex-wrap gap-2">
				{skills.length > 0 ? (
					skills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center px-3 py-1.5 rounded-full border border-brand-500/40 bg-brand-900/30 text-brand-300 text-sm font-medium"
						>
							{skill}
						</span>
					))
				) : (
					<span className="text-sm text-muted-foreground">등록된 기술스택이 없습니다.</span>
				)}
			</div>
		</div>
	);
}
