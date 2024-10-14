import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';

const commentlist = atom<CommentBoxProp[]>([
  { id: '123', content: 'I here to', taskId: '432', authorId: '865', createdAt: new Date() },
]);

export { commentlist };
