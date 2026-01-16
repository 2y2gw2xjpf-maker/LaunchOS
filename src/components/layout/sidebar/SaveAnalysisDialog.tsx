import * as React from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface SaveAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onDiscard: () => void;
  defaultName?: string;
}

export const SaveAnalysisDialog = ({
  open,
  onClose,
  onSave,
  onDiscard,
  defaultName = '',
}: SaveAnalysisDialogProps) => {
  const [name, setName] = React.useState(defaultName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setName(
        defaultName ||
          `Analyse ${new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}`
      );
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogClose onClose={onClose} />
      <DialogHeader>
        <DialogTitle>Analyse speichern?</DialogTitle>
        <DialogDescription>
          Du hast ungespeicherte Änderungen. Möchtest du diese Analyse speichern, bevor du eine
          neue startest?
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Name der Analyse</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="z.B. Mein SaaS Startup"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 border-purple-100',
                'focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none',
                'transition-all'
              )}
            />
          </div>
        </div>
      </DialogContent>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="ghost" onClick={onDiscard} className="text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Verwerfen
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
          <Save className="w-4 h-4 mr-2" />
          Speichern
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
