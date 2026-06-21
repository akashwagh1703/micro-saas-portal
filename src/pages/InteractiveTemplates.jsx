import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import InteractiveTemplatesList from '../components/workflows/InteractiveTemplatesList';

export default function InteractiveTemplates() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interactive Message Templates</h1>
          <p className="text-sm text-slate-600">Create and manage templates for buttons, lists, and interactive messages</p>
        </div>
        <Link to="/workflows">
          <Button variant="secondary">← Back to Workflows</Button>
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <InteractiveTemplatesList />
      </div>
    </div>
  );
}
