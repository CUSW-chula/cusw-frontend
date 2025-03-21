import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';
import type { Status } from './lib/shared';
import type { ProjectTagProp } from './lib/shared';
import type { TaskProps } from './app/types/types';
const Unassigned = '/asset/icon/unassigned.svg';

const commentlist = atom<CommentBoxProp[]>([]);

const selectedStatusAtom = atom<Status>({
  status: 'Unassigned',
  displayName: 'Unassigned',
  icon: Unassigned,
});

const taskAtom = atom<TaskProps[]>([]);

const tagsListAtom = atom<ProjectTagProp[]>([]);
const moneyAtom = atom<number[]>([0, 0, 0]);

export { moneyAtom };
export { commentlist };
export { selectedStatusAtom };
export { tagsListAtom };
export { taskAtom };
