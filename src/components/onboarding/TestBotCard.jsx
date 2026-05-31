import { MessageCircle, AtSign, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import { getTriggerKeywords } from '../../utils/workflowKeywords';

export default function TestBotCard({
  whatsappDisplay,
  instagramUsername,
  workflows = [],
}) {
  const live = workflows.filter((w) => w.status === 'published');
  const sample = live[0];
  const keywords = sample ? getTriggerKeywords(sample.definition) : ['hello', 'book', 'help'];
  const testWord = keywords[0] || 'hello';
  const igHandle = instagramUsername
    ? `@${instagramUsername.replace(/^@/, '')}`
    : null;

  const copyHint = (channel) => {
    navigator.clipboard.writeText(testWord);
    const where = channel === 'instagram' ? 'Instagram' : 'WhatsApp';
    toast.success(`Copied "${testWord}" — paste it in ${where}`);
  };

  if (!whatsappDisplay && !igHandle && live.length === 0) return null;

  return (
    <Card className="!p-0 overflow-hidden border-emerald-100">
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="font-semibold text-slate-900">Test your auto-reply</h3>
          <p className="mt-1 text-sm text-slate-600">
            Send a test message on a connected channel to see your bot in action.
          </p>
        </div>

        <div className="space-y-3">
          {whatsappDisplay && (
            <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">WhatsApp</p>
                <p className="text-sm text-slate-600">
                  Message <span className="font-medium">{whatsappDisplay}</span> from your phone.
                </p>
              </div>
              {live.length > 0 && (
                <button
                  type="button"
                  onClick={() => copyHint('whatsapp')}
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                >
                  <Copy size={14} />
                  {testWord}
                </button>
              )}
            </div>
          )}

          {igHandle && (
            <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                <AtSign size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">Instagram</p>
                <p className="text-sm text-slate-600">
                  Send a DM to <span className="font-medium">{igHandle}</span> from another account.
                </p>
              </div>
              {live.length > 0 && (
                <button
                  type="button"
                  onClick={() => copyHint('instagram')}
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                >
                  <Copy size={14} />
                  {testWord}
                </button>
              )}
            </div>
          )}

          {!whatsappDisplay && !igHandle && (
            <p className="text-sm text-slate-500">
              Connect WhatsApp or Instagram in Settings, then send a test message.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
