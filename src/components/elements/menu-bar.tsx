import { Money } from './money';
import { CrownIcon, Users, Tag, Calendar, Trash2, DollarSign } from 'lucide-react';

const MenuBar = () => {
  return (
    <div className="h-[400px] w-[395px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-4 inline-flex">
      <div aria-label="status" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 h-6 border-black border-2 rounded-full" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Status :{' '}
          </div>
        </div>
        {/* Content */}
        <Money />
      </div>
      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <CrownIcon className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Owner :{' '}
          </div>
        </div>
        <Money />
      </div>
      <div aria-label="member" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Users className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Member :{' '}
          </div>
        </div>
        <Money />
      </div>
      <div aria-label="tag" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Tag className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Tag :{' '}
          </div>
        </div>
        <Money />
      </div>
      <div aria-label="money" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <DollarSign className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Money :{' '}
          </div>
        </div>
        <Money />
      </div>
      <div aria-label="date" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Calendar className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Date :{' '}
          </div>
        </div>
        <Money />
      </div>
      <Trash2 className="h-6 w-6" />
    </div>
  );
};

export { MenuBar };