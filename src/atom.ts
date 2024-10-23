import { atom } from 'jotai';
import type { CommentBoxProp } from './lib/shared';

const commentlist = atom<CommentBoxProp[]>([]);

export { commentlist };
