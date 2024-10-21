import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';
import type { Status } from './lib/shared';

const unassigned = '/asset/icon/unassigned.svg';

const commentlist = atom<CommentBoxProp[]>([
  { id: '123', content: 'I here to', taskId: '432', authorId: '865', createdAt: new Date() },
]);

const selectedStatusAtom = atom<Status>({
  value: 'unassigned',
  label: 'unassigned',
  icon: unassigned,
});

export { commentlist };
export { selectedStatusAtom };
