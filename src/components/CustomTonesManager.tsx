"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Edit2, X, Check } from "lucide-react";

interface CustomTone {
  id: string;
  name: string;
  description: string;
  sample_text: string;
  created_at: string;
}

interface CustomTonesManagerProps {
  onSelectTone?: (toneId: string, toneName: string) => void;
  selectedToneId?: string;
}

export default function CustomTonesManager({ onSelectTone, selectedToneId }: CustomTonesManagerProps) {
  const [tones, setTones] = useState<CustomTone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sampleText, setSampleText] = useState("");

  useEffect(() => {
    fetchTones();
  }, []);

  const fetchTones = async () => {
    try {
      const response = await fetch('/api/custom-tones');
      if (response.ok) {
        const data = await response.json();
        setTones(data.tones);
      }
    } catch (error) {
      console.error('Error fetching tones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sampleText) return;

    try {
      const response = await fetch('/api/custom-tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, sampleText })
      });

      if (response.ok) {
        await fetchTones();
        setShowCreate(false);
        setName("");
        setDescription("");
        setSampleText("");
      }
    } catch (error) {
      console.error('Error creating tone:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch('/api/custom-tones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, sampleText })
      });

      if (response.ok) {
        await fetchTones();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating tone:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tone?')) return;

    try {
      const response = await fetch(`/api/custom-tones?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTones();
      }
    } catch (error) {
      console.error('Error deleting tone:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <p className="text-slate-400">Loading custom tones...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Custom Tones
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 text-sm bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? 'Cancel' : 'Create Tone'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-slate-700/50 rounded-xl">
          <h4 className="font-medium mb-3">Create New Tone</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tone Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My Professional Voice"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this tone"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sample Writing</label>
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Paste a sample of your writing in the tone you want to capture..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm h-24 resize-none"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Our AI will analyze this sample to learn your unique tone and style.
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Tone
            </button>
          </div>
        </form>
      )}

      {tones.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">No custom tones yet</p>
          <p className="text-sm text-slate-500">
            Create a custom tone to match your unique writing style
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tones.map((tone) => (
            <div
              key={tone.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedToneId === tone.id
                  ? 'bg-indigo-500/20 border-indigo-500'
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
              }`}
            >
              {editingId === tone.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    defaultValue={tone.name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    defaultValue={tone.description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm h-16 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(tone.id)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{tone.name}</h4>
                      {tone.description && (
                        <p className="text-sm text-slate-400">{tone.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {onSelectTone && (
                        <button
                          onClick={() => onSelectTone(tone.id, tone.name)}
                          className={`p-1.5 rounded-lg text-sm ${
                            selectedToneId === tone.id
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-600 hover:bg-slate-500'
                          }`}
                        >
                          {selectedToneId === tone.id ? 'Selected' : 'Use'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingId(tone.id);
                          setName(tone.name);
                          setDescription(tone.description);
                          setSampleText(tone.sample_text);
                        }}
                        className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tone.id)}
                        className="p-1.5 bg-slate-600 hover:bg-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Created {new Date(tone.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
