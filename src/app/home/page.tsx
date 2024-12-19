import Search from '@/components/elements/search';
import SortButton from '@/components/elements/sort-button';
import Createproject from '@/components/elements/createproject';
import { Filter } from '@/components/elements/filter';
export default function Home() {
  return (
    <div className="flex w-full justify-between flex-wrap gap-2">
      <Filter />
      <Search />
      <SortButton />
      <Createproject />
    </div>
  );
}
