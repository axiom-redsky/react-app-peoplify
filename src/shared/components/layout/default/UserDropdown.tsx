import { useNavigate } from 'react-router';
import { LogOut, User } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/lib/shadcn/ui/dropdown-menu';

const UserDropdown: React.FC = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('access_token');
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
				className="w-44"
			>
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
