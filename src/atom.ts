import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';
import type { Status } from './lib/shared';
import type { ProjectTagProp } from './lib/shared';
const Unassigned = '/asset/icon/unassigned.svg';

const commentlist = atom<CommentBoxProp[]>([]);

const selectedStatusAtom = atom<Status>({
  value: 'Unassigned',
  label: 'unassigned',
  icon: Unassigned,
});

const tagsListAtom = atom<ProjectTagProp[]>([]);
const moneyAtom = atom<number[]>([0, 0, 0]);

export { moneyAtom };
export { commentlist };
export { selectedStatusAtom };
export { tagsListAtom };
