"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  example: string;
  tone: string;
}

interface TemplatesProps {
  tool: string;
  onSelectTemplate: (example: string, tone: string) => void;
}

export default function Templates({ tool, onSelectTemplate }: TemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [tool]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/templates?tool=${tool}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (templates.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <FileText className="h-4 w-4" />
        {isOpen ? 'Hide templates' : 'Use a template'}
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelectTemplate(template.example, template.tone);
                setIsOpen(false);
              }}
              className="text-left p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm group-hover:text-indigo-300">{template.title}</h4>
                <span className="text-xs px-2 py-1 bg-slate-600 rounded-full text-slate-300 capitalize">
                  {template.tone}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{template.description}</p>
              <div className="flex items-center gap-1 text-xs text-indigo-400">
                <Sparkles className="h-3 w-3" />
                <span>Click to use</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
