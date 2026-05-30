import { MessageCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import { getTriggerKeywords } from '../../utils/workflowKeywords';

export default function TestBotCard({ whatsappDisplay, workflows = [] }) {
  const live = workflows.filter((w) => w.status === 'published');
  const sample = live[0];
  const keywords = sample ? getTriggerKeywords(sample.definition) : ['hello', 'book', 'help'];
  const testWord = keywords[0] || 'hello';

  const copyHint = () => {
    navigator.clipboard.writeText(testWord);
    toast.success(`Copied "${testWord}" — paste it in WhatsApp`);
  };

  if (!whatsappDisplay && live.length === 0) return null;

  return (
    <Card className="!p-0 overflow-hidden border-emerald-100">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Test your auto-reply</h3>
            <p className="mt-1 text-sm text-slate-600">
              {whatsappDisplay ? (
                <>
                  From your phone, send a WhatsApp message to{' '}
                  <span className="font-medium text-slate-800">{whatsappDisplay}</span>
                </>
              ) : (
                'Connect WhatsApp first, then send a test message.'
              )}
            </p>
            {live.length > 0 && (
              <p className="mt-2 text-xs text-emerald-700">
                Try typing: <button type="button" onClick={copyHint} className="font-semibold underline decoration-dotted">{testWord}</button>
                {' '}(tap to copy)
              </p>
            )}
          </div>
        </div>
        {live.length > 0 && (
          <button
            type="button"
            onClick={copyHint}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Copy size={16} />
            Copy test word
          </button>
        )}
      </div>
    </Card>
  );
}
