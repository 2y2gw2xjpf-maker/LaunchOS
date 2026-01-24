import * as React from 'react';
import { useState, useMemo } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PromptVariable {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
}

interface PromptEditorProps {
  template: string;
  variables: PromptVariable[];
  onCopy?: (filledPrompt: string) => void;
}

export function PromptEditor({ template, variables, onCopy }: PromptEditorProps) {
  // Initialize values with defaults using initializer function
  const getDefaultValues = (vars: PromptVariable[]): Record<string, string> => {
    const defaults: Record<string, string> = {};
    vars.forEach((v) => {
      if (v.defaultValue) {
        defaults[v.name] = v.defaultValue;
      }
    });
    return defaults;
  };

  const [values, setValues] = useState<Record<string, string>>(() => getDefaultValues(variables));
  const [copied, setCopied] = useState(false);

  // Re-initialize when variables change
  const variablesKey = JSON.stringify(variables.map(v => ({ name: v.name, defaultValue: v.defaultValue })));
  React.useEffect(() => {
    setValues(getDefaultValues(variables));
  }, [variablesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const filledPrompt = useMemo(() => {
    let result = template;
    variables.forEach((variable) => {
      const value = values[variable.name] || `[${variable.label}]`;
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }, [template, variables, values]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(filledPrompt);
    setCopied(true);
    onCopy?.(filledPrompt);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const defaults: Record<string, string> = {};
    variables.forEach((v) => {
      if (v.defaultValue) {
        defaults[v.name] = v.defaultValue;
      }
    });
    setValues(defaults);
  };

  const hasAllValues = variables.every((v) => values[v.name]?.trim());

  return (
    <div className="space-y-6">
      {/* Variables Form */}
      {variables.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-purple-900">Variablen anpassen</h4>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
            >
              <RefreshCw className="w-3 h-3" />
              Zurücksetzen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variables.map((variable) => (
              <div key={variable.name}>
                <label className="block text-sm font-medium text-purple-800 mb-1">{variable.label}</label>
                {variable.type === 'textarea' ? (
                  <textarea
                    value={values[variable.name] || ''}
                    onChange={(e) => setValues({ ...values, [variable.name]: e.target.value })}
                    placeholder={variable.placeholder}
                    className="w-full p-2 border border-purple-200 rounded-lg text-sm resize-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                    rows={3}
                  />
                ) : variable.type === 'select' && variable.options ? (
                  <select
                    value={values[variable.name] || ''}
                    onChange={(e) => setValues({ ...values, [variable.name]: e.target.value })}
                    className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                  >
                    <option value="">Auswählen...</option>
                    {variable.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={values[variable.name] || ''}
                    onChange={(e) => setValues({ ...values, [variable.name]: e.target.value })}
                    placeholder={variable.placeholder}
                    className="w-full p-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Preview</h4>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
              copied
                ? 'bg-green-100 text-green-700'
                : hasAllValues
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-400'
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Kopiert!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopieren
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <pre className="text-gray-100 text-sm whitespace-pre-wrap font-mono">{filledPrompt}</pre>
        </div>

        {!hasAllValues && variables.length > 0 && (
          <p className="text-sm text-amber-600 mt-2">Fülle alle Variablen aus für den besten Prompt</p>
        )}
      </div>
    </div>
  );
}
