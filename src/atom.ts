import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';
import type { Status } from './lib/shared';

const unassigned = '/asset/icon/unassigned.svg';

const commentlist = atom<CommentBoxProp[]>([]);

const selectedStatusAtom = atom<Status>({
  value: 'unassigned',
  label: 'unassigned',
  icon: unassigned,
});

export { commentlist };
export { selectedStatusAtom };
