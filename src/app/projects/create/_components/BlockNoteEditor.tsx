'use client';
import { BlockNoteView } from '@blocknote/shadcn';
import { GridSuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import * as Card from '@/components/ui/card';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tabs from '@/components/ui/tabs';
import * as Toggle from '@/components/ui/toggle';
import * as Tooltip from '@/components/ui/tooltip';

interface BlockNoteEditorProps {
  onChange: (html: string) => void;
}

const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({ onChange }) => {
  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });

  const editor = useCreateBlockNote({
    schema,
  });

  const handleDescriptionChange = async () => {
    const blocks = editor.document;
    const html = await editor.blocksToHTMLLossy(blocks);
    onChange(html);
  };

  return (
    <BlockNoteView
      editor={editor}
      theme={'light'}
      onChange={handleDescriptionChange}
      emojiPicker={false}
      shadCNComponents={{
        Card,
        DropdownMenu,
        Label,
        Popover,
        Tabs,
        Toggle,
        Tooltip,
      }}>
      <GridSuggestionMenuController triggerCharacter={':'} columns={5} minQueryLength={2} />
    </BlockNoteView>
  );
};

export default BlockNoteEditor;
