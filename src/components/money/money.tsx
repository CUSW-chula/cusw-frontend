import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const Money = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="h-10 px-4 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2.5 inline-flex">
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-gray-500 text-base font-normal font-['Bai Jamjuree'] leading-normal">
              Add Money
            </div>
            <div>
              
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[360px] h-72 p-3 bg-white rounded-md border border-[#6b5c56] flex-col justify-start items-start gap-4 inline-flex">
        <div className="self-stretch h-[200px] flex-col justify-start items-start flex">
          <div className="self-stretch w-12 h-12 ">
            <div className=" self-stretch grow shrink basis-0 px-3 py-2.5 justify-center items-center gap-2 inline-flex">
              <Button className="text-center text-[#6b5c56] text-sm font-normal font-['Bai Jamjuree'] leading-normal">
                Save
              </Button>
            </div>
          </div>

          <div className="self-stretch h-[152px] px-1.5 flex-col justify-start items-start gap-4 flex">
            <div className="self-stretch justify-start items-center gap-4 inline-flex">
              <div className="text-black text-sm font-normal font-['Inter'] leading-normal">
                งบประมาณ:
              </div>
              <div className="grow shrink basis-0 h-10 px-4 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="self-stretch justify-start items-center gap-2 inline-flex">
                  <div className="w-6 h-6 justify-center items-center flex">
                    <div className="w-6 h-6 text-center text-[#6b5c56] text-2xl font-semibold font-['Bai Jamjuree'] leading-normal">
                      ฿
                    </div>
                  </div>
                  <div className="grow shrink basis-0 h-5 border-b border-[#6b5c56] justify-start items-center gap-2.5 flex">
                    <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
                      Add Budget...
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch justify-start items-center gap-[43px] inline-flex">
              <div className="text-black text-sm font-normal font-['Inter'] leading-normal">
                ขอเบิก:
              </div>
              <div className="grow shrink basis-0 h-10 px-4 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="self-stretch justify-start items-center gap-2 inline-flex">
                  <div className="w-6 h-6 justify-center items-center flex">
                    <div className="w-6 h-6 text-center text-[#69bca0] text-2xl font-semibold font-['Bai Jamjuree'] leading-normal">
                      ฿
                    </div>
                  </div>
                  <div className="grow shrink basis-0 h-5 border-b border-[#69bca0] justify-start items-center gap-2.5 flex">
                    <div className="text-[#69bca0] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
                      Add Budget...
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch justify-start items-center gap-9 inline-flex">
              <div className="text-black text-sm font-normal font-['Inter'] leading-normal">
                เบิกจริง:
              </div>
              <div className="grow shrink basis-0 h-10 px-4 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2.5 inline-flex">
                <div className="self-stretch justify-start items-center gap-2 inline-flex">
                  <div className="w-6 h-6 justify-center items-center flex">
                    <div className="w-6 h-6 text-center text-red-500 text-2xl font-semibold font-['Bai Jamjuree'] leading-normal">
                      ฿
                    </div>
                  </div>
                  <div className="grow shrink basis-0 h-5 border-b border-red-500 justify-start items-center gap-2.5 flex">
                    <div className="text-red-500 text-xs font-medium font-['Bai Jamjuree'] leading-tight">
                      Add Budget...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch px-3 pt-2 border-t border-[#cac4d0] justify-between items-start inline-flex">
          <div className="h-10 rounded-[100px] flex-col justify-center items-center gap-2 inline-flex">
            <div className="self-stretch grow shrink basis-0 px-3 py-2.5 justify-center items-center gap-2 inline-flex">
              <Button className="text-center text-[#6b5c56] text-sm font-normal font-['Bai Jamjuree'] leading-normal bg-transparent hover:bg-transparent">
                Clear
              </Button>
            </div>
          </div>
          <div className="grow shrink basis-0 h-10 justify-end items-start gap-2 flex">
            <div className="h-10 rounded-[100px] flex-col justify-center items-center gap-2 inline-flex">
              <div className="self-stretch grow shrink basis-0 px-3 py-2.5 justify-center items-center gap-2 inline-flex">
                <Button className="text-center text-[#6b5c56] text-sm font-normal font-['Bai Jamjuree'] leading-normal bg-transparent hover:bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="h-10 rounded-[100px] flex-col justify-center items-center gap-2 inline-flex">
              <div className="self-stretch grow shrink basis-0 px-3 py-2.5 justify-center items-center gap-2 inline-flex">
                <Button className="text-center text-[#6b5c56] text-sm font-normal font-['Bai Jamjuree'] leading-normal bg-transparent hover:bg-transparent">
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Money;
