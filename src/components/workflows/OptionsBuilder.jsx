import { useState } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

/**
 * OptionsBuilder Component
 * Manages interactive message options with drag-and-drop support
 * Enhanced with animations and accessibility improvements
 */
export default function OptionsBuilder({
  options = [],
  messageType,
  maxOptions,
  onOptionsChange,
  onError,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);

  // Handle drag start
  const handleDragStart = (index, e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (index, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Handle drop
  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOptions = [...options];
    const [draggedOption] = newOptions.splice(draggedIndex, 1);
    newOptions.splice(dropIndex, 0, draggedOption);

    // Update display order
    const reorderedOptions = newOptions.map((opt, idx) => ({
      ...opt,
      displayOrder: idx,
    }));

    onOptionsChange(reorderedOptions);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle option field change
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value, displayOrder: index };
    onOptionsChange(newOptions);
  };

  // Handle add option
  const handleAddOption = () => {
    if (options.length >= maxOptions) {
      if (onError) {
        onError(`Maximum ${maxOptions} option${maxOptions !== 1 ? 's' : ''} allowed`);
      }
      return;
    }

    const newOption = {
      id: `opt-${Date.now()}`,
      optionText: '',
      description: '',
      nextNodeId: '',
      displayOrder: options.length,
      metadata: {},
    };

    onOptionsChange([...options, newOption]);
    setFocusedIndex(options.length);
  };

  // Handle remove option
  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    const reorderedOptions = newOptions.map((opt, idx) => ({
      ...opt,
      displayOrder: idx,
    }));
    onOptionsChange(reorderedOptions);
  };

  // Render option field based on message type
  const renderOptionFields = (option, index) => {
    return (
      <>
        {/* Option Text */}
        <Input
          value={option.optionText}
          onChange={(e) =>
            handleOptionChange(index, 'optionText', e.target.value)
          }
          placeholder={getPlaceholder(messageType, 'text')}
          maxLength={100}
          required
          aria-label={`Option ${index + 1} text`}
        />

        {/* Description (for QUICK_REPLY and LIST_MESSAGE) */}
        {(messageType === 'LIST_MESSAGE' || messageType === 'QUICK_REPLY') && (
          <Input
            value={option.description || ''}
            onChange={(e) =>
              handleOptionChange(index, 'description', e.target.value)
            }
            placeholder={getPlaceholder(messageType, 'description')}
            maxLength={500}
            aria-label={`Option ${index + 1} description`}
          />
        )}

        {/* URL (for FLOW_BUTTON) */}
        {messageType === 'FLOW_BUTTON' && (
          <Input
            value={option.metadata?.url || ''}
            onChange={(e) => {
              const newMetadata = { ...option.metadata, url: e.target.value };
              const newOptions = [...options];
              newOptions[index] = {
                ...newOptions[index],
                metadata: newMetadata,
              };
              onOptionsChange(newOptions);
            }}
            placeholder="https://example.com"
            type="url"
            aria-label={`Option ${index + 1} URL`}
          />
        )}

        {/* Next Node ID */}
        <Input
          value={option.nextNodeId || ''}
          onChange={(e) =>
            handleOptionChange(index, 'nextNodeId', e.target.value)
          }
          placeholder="Next node ID (optional)"
          aria-label={`Option ${index + 1} next node routing`}
        />
      </>
    );
  };

  function getPlaceholder(type, field) {
    if (type === 'QUICK_REPLY') {
      return field === 'text' ? 'Button text (e.g., Yes)' : 'Optional description';
    }
    if (type === 'LIST_MESSAGE') {
      return field === 'text'
        ? 'Option title'
        : 'Option description (visible in dropdown)';
    }
    if (type === 'FLOW_BUTTON') {
      return field === 'text' ? 'Button text (e.g., Click Me)' : '';
    }
    return 'Enter value';
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Options</h3>
          <p className="text-xs text-slate-600 mt-0.5 transition-all duration-200">
            {options.length} of {maxOptions} options added
          </p>
        </div>
        {options.length < maxOptions && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleAddOption}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus size={16} />
            Add Option
          </Button>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {options.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-slate-600 mb-3">
              No options yet. Add your first option to get started!
            </p>
            <Button size="sm" onClick={handleAddOption}>
              + Add First Option
            </Button>
          </div>
        ) : (
          options.map((option, index) => (
            <div
              key={option.id || index}
              draggable
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              role="region"
              aria-label={`Option ${index + 1} of ${options.length}`}
              className={`group rounded-lg border-2 transition-all duration-200 p-4 animate-in fade-in slide-in-from-bottom-2 ${
                dragOverIndex === index
                  ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200'
                  : focusedIndex === index
                  ? 'border-emerald-400 ring-2 ring-emerald-200 bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
              tabIndex="0"
            >
              {/* Drag Handle and Remove Button */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical
                    size={18}
                    className="text-slate-400 cursor-grab active:cursor-grabbing mt-1 transition-colors duration-200 hover:text-slate-600"
                    role="img"
                    aria-label="Drag handle"
                  />
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 min-w-7 text-center transition-all duration-200">
                    {index + 1}
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveOption(index)}
                  className="ml-auto text-slate-400 hover:text-red-600 transition-all duration-200 p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title={`Remove option ${index + 1}`}
                  aria-label={`Remove option ${index + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Option Fields */}
              <div className="space-y-3 ml-7">
                {renderOptionFields(option, index)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      {options.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Drag & Drop:</span> Reorder options by
            dragging the handle on the left. Order determines how options appear
            in the message. Use Tab to navigate between options.
          </p>
        </div>
      )}

      {/* Validation State */}
      {options.some((opt) => !opt.optionText.trim()) && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-red-700">
            <span className="font-semibold">Error:</span> All options must have
            text. Fill in empty option fields or remove them.
          </p>
        </div>
      )}
    </div>
  );
}
