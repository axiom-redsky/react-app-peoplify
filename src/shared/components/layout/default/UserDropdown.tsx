import { useNavigate } from 'react-router';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@axiom/hooks';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/lib/shadcn/ui/dropdown-menu';

const UserDropdown: React.FC = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/auth/login');
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500 text-white text-sm font-semibold shrink-0 hover:bg-brand-600 transition-colors"
					aria-label="사용자 메뉴"
				>
					<User className="w-5 h-5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-48"
			>
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="text-sm font-semibold text-foreground">{user?.name ?? '게스트'}</span>
					{user?.email && <span className="text-xs font-normal text-muted-foreground">{user.email}</span>}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer text-red-500 focus:text-red-500"
				>
					<LogOut className="w-4 h-4 mr-2" />
					로그아웃
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserDropdown;
