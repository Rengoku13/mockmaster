'use client';

import { useState, useEffect } from 'react';
import { generateData, SchemaField, FieldType } from '@/components/GeneratorEngine';
import { JsonViewer } from '@/components/JsonViewer';
import { supabase } from '@/lib/supabaseClient';
import AuthModal from '@/components/AuthModal';
import { User } from '@supabase/supabase-js';
import {
  Plus, Trash2, Download, Play, Copy, RefreshCw, Settings, ChevronDown, ChevronUp,
  Type, Mail, Phone, MapPin, Building2, Calendar, Fingerprint, ToggleLeft, DollarSign, Image, AlignLeft, List,
  Zap, Database, FileSpreadsheet, Code, Sparkles, ArrowRight, Lock
} from 'lucide-react';

const TYPE_ICONS: Record<FieldType, any> = {
  name: Type,
  email: Mail,
  phone: Phone,
  address: MapPin,
  company: Building2,
  date: Calendar,
  uuid: Fingerprint,
  boolean: ToggleLeft,
  amount: DollarSign,
  avatar: Image,
  sentence: AlignLeft,
  enum: List,
};

export default function Home() {
  const [schema, setSchema] = useState<SchemaField[]>([
    { key: 'id', type: 'uuid' },
    { key: 'full_name', type: 'name' },
    { key: 'email_address', type: 'email' },
    { key: 'role', type: 'company' },
    { key: 'is_active', type: 'boolean' },
  ]);
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(5);
  const [isCopied, setIsCopied] = useState(false);
  const [activeOptionsRow, setActiveOptionsRow] = useState<number | null>(null);
  const [generationTime, setGenerationTime] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = () => {
    const start = performance.now();
    const newData = generateData(schema, count);
    const end = performance.now();
    setGenerationTime(Math.round(end - start));
    setData(newData);
  };

  useEffect(() => {
    handleGenerate();
  }, [schema, count]);

  const addField = () => {
    setSchema([...schema, { key: `field_${schema.length + 1}`, type: 'sentence' }]);
  };

  const updateField = (index: number, field: Partial<SchemaField>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...field };
    setSchema(newSchema);
  };

  const removeField = (index: number) => {
    const newSchema = schema.filter((_, i) => i !== index);
    setSchema(newSchema);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (data.length === 0) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => {
        return headers.map(header => {
          const val = row[header];
          // Handle special chars or strings
          const escaped = ('' + (val ?? '')).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">M</div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MockMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/code" target="_blank" className="text-sm text-slate-400 hover:text-white transition">GitHub</a>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-white rounded-full text-sm font-medium transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-medium transition shadow-lg shadow-indigo-500/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3 h-3" />
            <span>The Fastest Mock Data Generator</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Generate Production-Ready<br />Mock Data in Seconds
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Design your schema, customize fields with realistic data types, and export to JSON or CSV instantly.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <button onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 bg-white text-slate-950 rounded-lg font-bold hover:bg-slate-200 transition flex items-center gap-2">
              Start Generating <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition flex items-center gap-2 border border-slate-700">
              <Database className="w-4 h-4 text-slate-400" />
              View Examples
            </button>
          </div>
        </div>
      </div>

      <div id="generator" className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-20">

        {/* Left Panel: Schema Builder */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-400" />
                Schema Definition
              </h2>
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                <span className="text-xs text-slate-400 px-2">Count:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-12 bg-transparent text-white text-sm focus:outline-none text-right pr-2 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              {schema.map((field, index) => {
                const Icon = TYPE_ICONS[field.type];
                return (
                  <div key={index} className="group flex flex-wrap items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition">
                    <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => updateField(index, { key: e.target.value })}
                      className="bg-transparent border-none text-sm font-mono text-indigo-300 w-1/3 focus:ring-0 focus:outline-none placeholder-slate-600"
                      placeholder="field_name"
                    />
                    <div className="h-4 w-px bg-slate-700"></div>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                      className="bg-transparent border-none text-sm text-slate-300 w-1/3 focus:ring-0 focus:outline-none cursor-pointer"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="address">Address</option>
                      <option value="company">Company</option>
                      <option value="date">Date</option>
                      <option value="uuid">UUID</option>
                      <option value="boolean">Boolean</option>
                      <option value="amount">Amount ($)</option>
                      <option value="avatar">Avatar URL</option>
                      <option value="sentence">Sentence</option>
                      <option value="enum">Custom Enum (List)</option>
                    </select>
                    <button
                      onClick={() => setActiveOptionsRow(activeOptionsRow === index ? null : index)}
                      className={`p-2 rounded-lg transition ${activeOptionsRow === index ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-600 hover:text-indigo-400 hover:bg-slate-700'}`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeField(index)}
                      className="ml-auto p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {activeOptionsRow === index && (
                      <div className="basis-full w-full pt-3 pl-2 border-t border-slate-700/50 mt-2 animate-in fade-in slide-in-from-top-1 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          {field.type === 'amount' && (
                            <>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 block">Min Value</label>
                                <input
                                  type="number"
                                  value={field.options?.min ?? ''}
                                  onChange={(e) => updateField(index, { options: { ...field.options, min: Number(e.target.value) } })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 block">Max Value</label>
                                <input
                                  type="number"
                                  value={field.options?.max ?? ''}
                                  onChange={(e) => updateField(index, { options: { ...field.options, max: Number(e.target.value) } })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            </>
                          )}
                          {field.type === 'date' && (
                            <>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 block">Start Date</label>
                                <input
                                  type="date"
                                  value={field.options?.minDate ? field.options.minDate.split('T')[0] : ''}
                                  onChange={(e) => updateField(index, { options: { ...field.options, minDate: new Date(e.target.value).toISOString() } })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 block">End Date</label>
                                <input
                                  type="date"
                                  value={field.options?.maxDate ? field.options.maxDate.split('T')[0] : ''}
                                  onChange={(e) => updateField(index, { options: { ...field.options, maxDate: new Date(e.target.value).toISOString() } })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            </>
                          )}
                          {field.type === 'enum' && (
                            <div className="col-span-2 space-y-1">
                              <label className="text-xs text-slate-500 block">Values (comma separated)</label>
                              <input
                                type="text"
                                placeholder="Apple, Banana, Orange"
                                value={field.options?.values?.join(', ') ?? ''}
                                onChange={(e) => updateField(index, { options: { ...field.options, values: e.target.value.split(',').map(s => s.trim()) } })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                          )}
                          {!['amount', 'date', 'enum'].includes(field.type) && (
                            <div className="col-span-2 text-xs text-slate-500 italic">
                              No configuration available for this field type.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={addField}
              className="mt-6 w-full py-3 border-2 border-dashed border-slate-700 text-slate-500 rounded-xl hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-slate-800/50 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl flex flex-col h-[600px] relative overflow-hidden ring-1 ring-white/5">

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition relative"
                  title="Copy JSON"
                >
                  {isCopied ? <span className="text-green-400 text-xs font-bold absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 py-1 px-2 rounded">Copied!</span> : null}
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-lg shadow-indigo-500/20"
                >
                  <Code className="w-3 h-3" />
                  JSON
                </button>
                <button
                  onClick={downloadCsv}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-lg shadow-emerald-500/20"
                >
                  {user ? <FileSpreadsheet className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  CSV
                </button>
              </div>
            </div>

            {/* Editor Code View */}
            <div className="flex-1 overflow-auto p-6">
              <JsonViewer data={data} />
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 bg-slate-950 border-t border-white/5 text-xs text-slate-500 flex justify-between items-center">
              <span>JSON • {new TextEncoder().encode(JSON.stringify(data)).length} bytes</span>
              <span>Generated in {generationTime}ms</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
