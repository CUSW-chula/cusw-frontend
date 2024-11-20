import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';
import type { Status } from './lib/shared';

const Unassigned = '/asset/icon/unassigned.svg';

const commentlist = atom<CommentBoxProp[]>([]);

const selectedStatusAtom = atom<Status>({
  value: 'Unassigned',
  label: 'unassigned',
  icon: Unassigned,
});

export { commentlist };
export { selectedStatusAtom };
