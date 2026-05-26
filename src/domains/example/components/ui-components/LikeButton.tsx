import { useState } from 'react';
import { Button, CodeBlock } from '@axiom/components/ui';
import { Heart } from 'lucide-react';

export default function LikeButton(): React.ReactNode {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(42);

	const handleLike = () => {
		setLiked((v) => !v);
		setLikeCount((n) => (liked ? n - 1 : n + 1));
	};

	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
			<div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
				<span className="text-xs font-medium text-gray-600 dark:text-gray-400">좋아요 토글</span>
			</div>
			<div className="p-5 flex flex-wrap items-center gap-4">
				<Button
					variant={liked ? 'default' : 'outline'}
					onClick={handleLike}
					className={
						liked ? 'bg-rose-500 hover:bg-rose-600 border-rose-500' : 'hover:border-rose-400 hover:text-rose-500'
					}
				>
					<Heart className={liked ? 'fill-white' : ''} />
					{liked ? '좋아요 취소' : '좋아요'}
				</Button>
				<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
					{likeCount.toLocaleString()}명이 좋아합니다
				</span>
			</div>
			<div className="border-t border-gray-100 dark:border-gray-800">
				<CodeBlock
					code={`const [liked, setLiked] = useState(false);

<Button
  variant={liked ? "default" : "outline"}
  onClick={() => setLiked(v => !v)}
  className={liked ? "bg-rose-500 hover:bg-rose-600" : ""}
>
  <Heart className={liked ? "fill-white" : ""} />
  {liked ? "좋아요 취소" : "좋아요"}
</Button>`}
				/>
			</div>
		</div>
	);
}
