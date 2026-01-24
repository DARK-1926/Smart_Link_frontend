'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Trash2, Settings, Loader2, Copy, Check, Link2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/toast';

interface Hub {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  theme: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'create' | 'edit' | null>(null);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const fetchHubs = useCallback(async () => {
    try {
      const response = await api.getHubs();
      if (response.success && response.data?.hubs) {
        setHubs(response.data.hubs as Hub[]);
      }
    } catch {
      showError('Failed to load hubs');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchHubs();
  }, [fetchHubs]);

  function openCreate() {
    setForm({ title: '', slug: '', description: '' });
    setEditingHub(null);
    setShowModal('create');
  }

  function openEdit(hub: Hub) {
    setForm({ title: hub.title, slug: hub.slug, description: hub.description || '' });
    setEditingHub(hub);
    setShowModal('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        title: form.title,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: form.description || undefined,
      };

      let response;
      if (showModal === 'edit' && editingHub) {
        response = await api.updateHub(editingHub.id, data);
        if (response.success) {
          success('Hub updated');
        }
      } else {
        response = await api.createHub(data);
        if (response.success) {
          success('Hub created');
        }
      }

      if (response.success) {
        setShowModal(null);
        fetchHubs();
      } else {
        showError(response.error || 'Something went wrong');
      }
    } catch {
      showError('Failed to save hub');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(hub: Hub) {
    if (!confirm(`Delete "${hub.title}"? This cannot be undone.`)) return;

    try {
      const response = await api.deleteHub(hub.id);
      if (response.success) {
        success('Hub deleted');
        fetchHubs();
      } else {
        showError('Failed to delete hub');
      }
    } catch {
      showError('Failed to delete hub');
    }
  }

  async function copyUrl(hub: Hub) {
    const url = `${window.location.origin}/u/${hub.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(hub.id);
    success('URL copied');
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary-300">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Your hubs</h1>
          <p className="mt-2 text-sm text-white/60">Create and manage smart link hubs in one place.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
          <Plus className="w-4 h-4" />
          New hub
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      )}

      {!loading && hubs.length === 0 && (
        <div className="card-glow text-center py-20">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-500/25 bg-primary-500/10">
            <Link2 className="h-7 w-7 text-primary-300" />
          </div>
          <h3 className="text-xl font-semibold text-white">No hubs yet</h3>
          <p className="mt-2 text-sm text-white/60">Create your first hub to start organizing smart links.</p>
          <button onClick={openCreate} className="btn-primary mt-6 text-sm px-6 py-3">
            Create your first hub
          </button>
        </div>
      )}

      {!loading && hubs.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {hubs.map((hub, index) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: shouldReduceMotion ? 0 : index * 0.04 }}
            >
              <div className="card group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/40 via-primary-400/30 to-primary-600/40" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-xl bg-primary-500/20 blur-lg" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-base font-bold text-black shadow-lg shadow-primary-500/30">
                        {hub.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white truncate group-hover:text-primary-200 transition-colors">
                        {hub.title}
                      </h3>
                      <p className="text-xs text-white/40 font-mono truncate">/u/{hub.slug}</p>
                      <p className="mt-2 text-xs text-white/40">Created {formatDate(hub.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(hub)}
                      className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hub)}
                      className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {hub.description && (
                  <p className="mt-4 text-sm text-white/60 leading-relaxed line-clamp-2">{hub.description}</p>
                )}

                <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
                  <button
                    onClick={() => copyUrl(hub)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white/60 transition-colors hover:border-primary-500/30 hover:text-primary-200"
                  >
                    {copiedId === hub.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-primary-300" />
                        <span className="text-primary-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy URL
                      </>
                    )}
                  </button>
                  <a
                    href={`/u/${hub.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:border-primary-500/30 hover:text-primary-300"
                    title="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Link
                    href={`/dashboard/hubs/${hub.id}`}
                    className="btn-primary px-4 py-2 text-xs font-semibold"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="card-glow relative w-full max-w-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-primary-400/40 to-primary-600/60" />
            <h2 className="text-xl font-semibold text-white">
              {showModal === 'edit' ? 'Edit hub' : 'Create hub'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="My Link Hub"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">/u/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="input-field flex-1 font-mono"
                    placeholder="my-hub"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
                  Description <span className="text-white/20">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Brief description"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : showModal === 'edit' ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
