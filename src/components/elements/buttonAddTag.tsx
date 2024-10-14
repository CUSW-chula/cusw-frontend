import { Mail } from 'lucide-react';
import { Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ButtonWithIcon() {
  return (
    <div className="flex flex-basis-* gap-5">
      <div className="flex flex-basis-* gap-2">
        <Tag />
        Tag :
      </div>

      <Button variant="outline">
        <Tag className="mr-2 h-4 w-4" /> Add Tag
      </Button>
    </div>
  );
}
