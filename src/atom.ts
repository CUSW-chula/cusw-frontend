import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';
import type { ProjectTagProp } from './lib/shared';

const commentlist = atom<CommentBoxProp[]>([]);

const tagsListAtom = atom<ProjectTagProp[]>([]);
const moneyAtom = atom<number[]>([0, 0, 0]);

export { moneyAtom };
export { commentlist };
export { tagsListAtom };
