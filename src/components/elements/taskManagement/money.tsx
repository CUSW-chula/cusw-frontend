import type { TaskProps } from '@/app/types/types';

export const Money = ({
  item,
}: {
  item: TaskProps;
}) => {
  //display Money
  const displayValue = (type: string, value: number) => {
    if (value <= 0) return null;
    const color =
      type === 'budget'
        ? 'text-black'
        : type === 'advance'
          ? 'text-green'
          : type === 'expense'
            ? 'text-red'
            : null;
    const textBaseClass = `font-BaiJamjuree leading-normal ${color}`;
    return (
      <div className="h-10 px-3 py-2 bg-white rounded-md border border-brown justify-start items-center gap-2 inline-flex">
        <div className={`text-2xl font-semibold ${textBaseClass}`}>฿</div>
        <div className={`text-base font-medium ${textBaseClass}`}>{value.toLocaleString()}</div>
      </div>
    );
  };
  return (
    <>
      {(item.budget > 0 || item.advance > 0 || item.expense > 0) && (
        <div>
          {item.budget > 0 && displayValue('budget', item.budget)}
          {item.advance > 0 && displayValue('advance', item.advance)}
          {item.expense > 0 && displayValue('expense', item.expense)}
        </div>
      )}
    </>
  );
};
