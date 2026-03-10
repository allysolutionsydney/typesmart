"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Copy, Star } from "lucide-react";
import { format } from "date-fns";

// Safe date formatter that works consistently between server and client
function formatDate(dateStr: string, formatStr: string): string {
  try {
    return format(new Date(dateStr), formatStr);
  } catch {
    return dateStr;
  }
}

interface Generation {
  id: string;
  tool: string;
  tone: string;
  input: string;
  output: string;
  created_at: string;
}

export default function HistorySidebar() {
  const [history, setHistory] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Generation | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toolLabels: Record<string, string> = {
    linkedin: 'LinkedIn',
    email: 'Email',
    dating: 'Dating',
    complaint: 'Complaint'
  };

  if (loading) {
    return (
      <div className="w-full lg:w-80 bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold">History</h3>
        </div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full lg:w-80 bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold">History</h3>
          <span className="ml-auto text-xs text-slate-400">{history.length} saved</span>
        </div>

        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">No generations yet. Start writing!</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-indigo-300">
                    {toolLabels[item.tool]} • {item.tone}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 truncate">{item.input}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {mounted ? formatDate(item.created_at, 'MMM d, h:mm a') : '...'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing full item */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{toolLabels[selectedItem.tool]}</h3>
                <p className="text-sm text-slate-400">{selectedItem.tone} tone • {mounted ? formatDate(selectedItem.created_at, 'PPP') : '...'}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-1">Your input:</p>
              <p className="bg-slate-700/50 p-3 rounded-lg text-sm">{selectedItem.input}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-1">AI output:</p>
              <p className="bg-slate-700/50 p-3 rounded-lg text-sm whitespace-pre-wrap">{selectedItem.output}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(selectedItem.output)}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
