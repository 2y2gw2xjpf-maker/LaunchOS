import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ToolkitTool } from '@/hooks/useToolkit';

interface ToolCompareTableProps {
  tools: ToolkitTool[];
}

const COMPARISON_FEATURES = [
  { key: 'ui', label: 'UI/Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'database', label: 'Datenbank' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'learningCurve', label: 'Lernkurve' },
];

function RatingCell({ value, maxValue = 5 }: { value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  let colorClass = 'text-gray-400';
  let bgClass = 'bg-gray-200';

  if (value >= 4) {
    colorClass = 'text-green-600';
    bgClass = 'bg-green-500';
  } else if (value >= 3) {
    colorClass = 'text-yellow-600';
    bgClass = 'bg-yellow-500';
  } else if (value >= 2) {
    colorClass = 'text-orange-600';
    bgClass = 'bg-orange-500';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', bgClass)} style={{ width: `${percentage}%` }} />
      </div>
      <span className={cn('text-sm font-medium', colorClass)}>{value}</span>
    </div>
  );
}

export function ToolCompareTable({ tools }: ToolCompareTableProps) {
  if (tools.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        Wähle mindestens 2 Tools zum Vergleichen aus
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-medium text-gray-500">Feature</th>
            {tools.map((tool) => (
              <th key={tool.id} className="text-center py-4 px-4 min-w-[160px]">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: tool.color || '#9333ea' }}
                  >
                    {tool.logoUrl ? (
                      <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6" />
                    ) : (
                      tool.name.charAt(0)
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">{tool.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_FEATURES.map((feature) => (
            <tr key={feature.key} className="border-b border-gray-100">
              <td className="py-4 px-4 font-medium text-gray-700">{feature.label}</td>
              {tools.map((tool) => (
                <td key={tool.id} className="py-4 px-4">
                  <RatingCell value={tool.ratings[feature.key as keyof typeof tool.ratings] || 0} />
                </td>
              ))}
            </tr>
          ))}

          {/* Pricing row */}
          <tr className="border-b border-gray-100">
            <td className="py-4 px-4 font-medium text-gray-700">Preis</td>
            {tools.map((tool) => (
              <td key={tool.id} className="py-4 px-4 text-center">
                <span className="text-sm text-gray-700">{tool.pricingDetails || tool.pricingModel || '-'}</span>
              </td>
            ))}
          </tr>

          {/* Best for row */}
          <tr className="border-b border-gray-100">
            <td className="py-4 px-4 font-medium text-gray-700">Ideal für</td>
            {tools.map((tool) => (
              <td key={tool.id} className="py-4 px-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {tool.bestFor?.slice(0, 2).map((useCase) => (
                    <span key={useCase} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                      {useCase}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Strengths */}
          <tr className="border-b border-gray-100">
            <td className="py-4 px-4 font-medium text-gray-700 align-top">Stärken</td>
            {tools.map((tool) => (
              <td key={tool.id} className="py-4 px-4 align-top">
                <ul className="space-y-1">
                  {tool.strengths?.slice(0, 3).map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>

          {/* Weaknesses */}
          <tr>
            <td className="py-4 px-4 font-medium text-gray-700 align-top">Schwächen</td>
            {tools.map((tool) => (
              <td key={tool.id} className="py-4 px-4 align-top">
                <ul className="space-y-1">
                  {tool.weaknesses?.slice(0, 3).map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
