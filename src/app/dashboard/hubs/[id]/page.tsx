'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, ExternalLink, Loader2, BarChart3, Zap, Link2,
  Play, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Download, Edit2, Sparkles
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { useToast } from '@/components/toast';
import MagicRuleModal from '@/components/MagicRuleModal';

interface Hub { id: string; slug: string; title: string; description: string | null; theme: string; }
interface LinkItem { id: string; title: string; url: string; icon: string | null; baseOrder: number; isActive: boolean; }
interface Rule { id: string; name: string; isActive: boolean; priority: number; type: 'TIME' | 'DEVICE' | 'LOCATION' | 'PERFORMANCE'; conditionJson: Record<string, unknown>; actionJson: Record<string, unknown>; }
interface PreviewLink { id: string; title: string; url: string; icon: string | null; score: number; baseOrder: number; }
interface LinkExplanation { linkId: string; title: string; baseOrder: number; finalScore: number; visible: boolean; appliedRules: { ruleName: string; effect: string; deltaScore: number; }[]; }
interface LinkAnalytics { linkId: string; title: string; clicks: number; ctr: number; rank: number; trend: 'up' | 'down' | 'stable'; previousClicks: number; }

type Tab = 'links' | 'rules' | 'analytics';

// Rule templates
const RULE_TEMPLATES = [
  {
    name: 'Boost on mobile',
    type: 'DEVICE' as const,
    condition: { device: 'mobile' },
    action: { effect: 'boost', value: 30 },
    description: 'Boost selected links for mobile users',
  },
  {
    name: 'Work hours priority',
    type: 'TIME' as const,
    condition: { timezone: 'Asia/Kolkata', days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' },
    action: { effect: 'boost', value: 50 },
    description: 'Higher priority Mon-Fri 9AM-6PM',
  },
  {
    name: 'Auto-promote top links',
    type: 'PERFORMANCE' as const,
    condition: { windowDays: 7, topK: 2 },
    action: { effect: 'boost', value: 30 },
    description: 'Boost top 2 clicked links from last week',
  },
  {
    name: 'Pin app on mobile',
    type: 'DEVICE' as const,
    condition: { device: 'mobile' },
    action: { effect: 'pin' },
    description: 'Pin links to top for mobile visitors',
  },
];

export default function HubManagePage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.id as string;
  const { success, error: showError } = useToast();

  const [hub, setHub] = useState<Hub | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('links');
  
  // Link form
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [linkForm, setLinkForm] = useState({ title: '', url: '', icon: '' });
  const [savingLink, setSavingLink] = useState(false);

  // Rule form
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState({ name: '', type: 'DEVICE' as Rule['type'], priority: 0, conditionJson: '{}', actionJson: '{}' });
  const [savingRule, setSavingRule] = useState(false);

  // Preview
  const [previewContext, setPreviewContext] = useState({ hour: new Date().getHours(), dayOfWeek: new Date().getDay(), deviceType: 'desktop' as 'mobile' | 'desktop', country: '' });
  const [previewLinks, setPreviewLinks] = useState<PreviewLink[]>([]);
  const [previewExplanation, setPreviewExplanation] = useState<{ evaluatedRules: { ruleName: string; matched: boolean; reason: string }[]; linkExplanations: LinkExplanation[]; } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Analytics
  const [analyticsWindow, setAnalyticsWindow] = useState<'7d' | '30d'>('7d');
  const [timeseries, setTimeseries] = useState<{ date: string; visits: number; clicks: number }[]>([]);
  const [linkAnalytics, setLinkAnalytics] = useState<LinkAnalytics[]>([]);
  const [analyticsStats, setAnalyticsStats] = useState({ totalVisits: 0, totalClicks: 0, overallCtr: 0 });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Magic Rule state
  const [showMagicRuleModal, setShowMagicRuleModal] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [generatingRule, setGeneratingRule] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [hubRes, linksRes, rulesRes] = await Promise.all([api.getHub(hubId), api.getLinks(hubId), api.getRules(hubId)]);
      if (hubRes.success && hubRes.data?.hub) setHub(hubRes.data.hub as Hub);
      else { router.push('/dashboard'); return; }
      if (linksRes.success && linksRes.data?.links) setLinks(linksRes.data.links as LinkItem[]);
      if (rulesRes.success && rulesRes.data?.rules) setRules(rulesRes.data.rules as Rule[]);
    } catch { showError('Failed to load hub'); }
    finally { setLoading(false); }
  }, [hubId, router, showError]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [timeseriesRes, linksRes] = await Promise.all([api.getAnalyticsTimeseries(hubId, analyticsWindow), api.getLinkAnalytics(hubId, analyticsWindow)]);
      if (timeseriesRes.success && timeseriesRes.data?.timeseries) {
        setTimeseries(timeseriesRes.data.timeseries.data);
        setAnalyticsStats({ totalVisits: timeseriesRes.data.timeseries.totalVisits, totalClicks: timeseriesRes.data.timeseries.totalClicks, overallCtr: timeseriesRes.data.timeseries.overallCtr });
      }
      if (linksRes.success && linksRes.data?.linkAnalytics) setLinkAnalytics(linksRes.data.linkAnalytics.links);
    } catch { showError('Failed to load analytics'); }
    finally { setAnalyticsLoading(false); }
  }, [analyticsWindow, hubId, showError]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === 'analytics') fetchAnalytics(); }, [activeTab, fetchAnalytics]);

  async function runPreview() {
    setPreviewLoading(true);
    try {
      const res = await api.previewRules(hubId, { hour: previewContext.hour, dayOfWeek: previewContext.dayOfWeek, deviceType: previewContext.deviceType, country: previewContext.country || undefined });
      if (res.success && res.data) { setPreviewLinks(res.data.links); setPreviewExplanation(res.data.explanation as typeof previewExplanation); }
    } catch { showError('Preview failed'); }
    finally { setPreviewLoading(false); }
  }

  // Link handlers
  async function handleSaveLink(e: React.FormEvent) {
    e.preventDefault();
    setSavingLink(true);
    try {
      if (editingLink) { await api.updateLink(editingLink.id, { title: linkForm.title, url: linkForm.url, icon: linkForm.icon || null }); success('Link updated'); }
      else { await api.createLink(hubId, { title: linkForm.title, url: linkForm.url, icon: linkForm.icon || undefined }); success('Link added'); }
      setShowLinkModal(false); setEditingLink(null); setLinkForm({ title: '', url: '', icon: '' }); fetchData();
    } catch { showError('Failed to save link'); }
    finally { setSavingLink(false); }
  }

  async function handleDeleteLink(id: string) {
    if (!confirm('Delete this link?')) return;
    try { await api.deleteLink(id); success('Link deleted'); fetchData(); }
    catch { showError('Failed to delete'); }
  }

  function openEditLink(link: LinkItem) {
    setEditingLink(link); setLinkForm({ title: link.title, url: link.url, icon: link.icon || '' }); setShowLinkModal(true);
  }

  // Rule handlers
  function applyTemplate(template: typeof RULE_TEMPLATES[0]) {
    setRuleForm({
      name: template.name,
      type: template.type,
      priority: rules.length,
      conditionJson: JSON.stringify(template.condition, null, 2),
      actionJson: JSON.stringify(template.action, null, 2),
    });
  }

  async function handleSaveRule(e: React.FormEvent) {
    e.preventDefault();
    setSavingRule(true);
    try {
      const data = { name: ruleForm.name, type: ruleForm.type, priority: ruleForm.priority, conditionJson: JSON.parse(ruleForm.conditionJson), actionJson: JSON.parse(ruleForm.actionJson) };
      if (editingRule) { await api.updateRule(editingRule.id, data); success('Rule updated'); }
      else { await api.createRule(hubId, data); success('Rule created'); }
      setShowRuleModal(false); setEditingRule(null); setRuleForm({ name: '', type: 'DEVICE', priority: 0, conditionJson: '{}', actionJson: '{}' }); fetchData();
    } catch { showError('Invalid JSON format'); }
    finally { setSavingRule(false); }
  }

  async function handleDeleteRule(id: string) {
    if (!confirm('Delete this rule?')) return;
    try { await api.deleteRule(id); success('Rule deleted'); fetchData(); }
    catch { showError('Failed to delete'); }
  }

  async function handleToggleRule(rule: Rule) {
    try { await api.updateRule(rule.id, { isActive: !rule.isActive }); success(rule.isActive ? 'Rule disabled' : 'Rule enabled'); fetchData(); }
    catch { showError('Failed to update'); }
  }

  function openEditRule(rule: Rule) {
    setEditingRule(rule);
    const conditionJson = typeof rule.conditionJson === 'string' ? rule.conditionJson : JSON.stringify(rule.conditionJson, null, 2);
    const actionJson = typeof rule.actionJson === 'string' ? rule.actionJson : JSON.stringify(rule.actionJson, null, 2);
    setRuleForm({ name: rule.name, type: rule.type, priority: rule.priority, conditionJson, actionJson });
    setShowRuleModal(true);
  }

  // Magic Rule handler
  async function handleGenerateMagicRule(e: React.FormEvent) {
    e.preventDefault();
    setGeneratingRule(true);
    try {
      const res = await api.generateRuleFromPrompt(hubId, magicPrompt);
      if (res.success && res.data?.rule) {
        const rule = res.data.rule;
        setRuleForm({
          name: rule.name as string,
          type: rule.type as Rule['type'],
          priority: (rule.priority as number) || rules.length,
          conditionJson: JSON.stringify(rule.conditionJson, null, 2),
          actionJson: JSON.stringify(rule.actionJson, null, 2),
        });
        setShowMagicRuleModal(false);
        setMagicPrompt('');
        setEditingRule(null);
        setShowRuleModal(true);
        success(`Rule generated! (Confidence: ${Math.round((res.data.confidence || 0) * 100)}%)`);
      } else {
        showError(res.error || 'Failed to generate rule');
      }
    } catch {
      showError('Failed to generate rule');
    } finally {
      setGeneratingRule(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-5 h-5 text-white/20 animate-spin" /></div>;
  if (!hub) return null;

  return (
    <div className="px-6 py-10 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard" className="p-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-300">Hub</p>
            <h1 className="text-2xl font-semibold text-white truncate">{hub.title}</h1>
            <p className="text-xs text-white/40 font-mono">/u/{hub.slug}</p>
          </div>
        </div>
        <a href={`/u/${hub.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5">
          <ExternalLink className="w-4 h-4" />
          View public hub
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-full w-fit mb-8 border border-white/10">
        {(['links', 'rules', 'analytics'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30' 
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab === 'links' && <Link2 className="w-4 h-4" />}
            {tab === 'rules' && <Zap className="w-4 h-4" />}
            {tab === 'analytics' && <BarChart3 className="w-4 h-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Links Tab */}
      {activeTab === 'links' && (
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{links.length} links</p>
            <button onClick={() => { setEditingLink(null); setLinkForm({ title: '', url: '', icon: '' }); setShowLinkModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Add link
            </button>
          </div>
          {links.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center">
                <Link2 className="w-7 h-7 text-primary-300" />
              </div>
              <p className="text-white/60 text-sm mb-2">No links yet</p>
              <p className="text-xs text-white/35">Add your first link to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="card group py-4 px-5 flex items-center gap-4 hover:border-primary-500/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white truncate mb-1 group-hover:text-primary-200 transition-colors">{link.title}</p>
                    <p className="text-xs text-white/40 truncate font-mono">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditLink(link)} className="p-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteLink(link.id)} className="p-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <motion.div
          className="grid lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Rules List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">{rules.length} rules</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setMagicPrompt(''); setShowMagicRuleModal(true); }}
                  className="btn-secondary flex items-center gap-2 text-sm group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-4 h-4 text-primary-300" />
                  <span className="relative">Magic Rule</span>
                </button>
                <button onClick={() => { setEditingRule(null); setRuleForm({ name: '', type: 'DEVICE', priority: rules.length, conditionJson: '{"device": "mobile"}', actionJson: '{"effect": "boost", "value": 10}' }); setShowRuleModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" />
                  Add rule
                </button>
              </div>
            </div>

            {rules.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-primary-300" />
                </div>
                <p className="text-white/60 text-sm mb-2">No rules yet</p>
                <p className="text-xs text-white/35">Add rules to dynamically prioritize links</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className={`card group py-4 px-5 transition-all ${!rule.isActive ? 'opacity-60' : 'hover:border-primary-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-primary-500/10 text-primary-300 border-primary-500/25">
                        {rule.type}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-white truncate group-hover:text-primary-200 transition-colors">{rule.name}</span>
                      <button onClick={() => handleToggleRule(rule)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${rule.isActive ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                        {rule.isActive ? 'ON' : 'OFF'}
                      </button>
                      <button onClick={() => openEditRule(rule)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="card-glow sticky top-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-primary-400/40 to-primary-600/60" />
            <h3 className="text-base font-semibold text-white mb-5 mt-1 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-300" />
              </div>
              Preview
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Hour</label>
                <input type="number" min="0" max="23" value={previewContext.hour} onChange={(e) => setPreviewContext({ ...previewContext, hour: parseInt(e.target.value) || 0 })} className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Day</label>
                <select value={previewContext.dayOfWeek} onChange={(e) => setPreviewContext({ ...previewContext, dayOfWeek: parseInt(e.target.value) })} className="input-field text-sm py-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Device</label>
                <select value={previewContext.deviceType} onChange={(e) => setPreviewContext({ ...previewContext, deviceType: e.target.value as 'mobile' | 'desktop' })} className="input-field text-sm py-2">
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Country</label>
                <input type="text" placeholder="IN" maxLength={2} value={previewContext.country} onChange={(e) => setPreviewContext({ ...previewContext, country: e.target.value.toUpperCase() })} className="input-field text-sm py-2 font-mono" />
              </div>
            </div>

            <button onClick={runPreview} disabled={previewLoading} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3 mb-4 font-semibold">
              {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Play className="w-4 h-4" />
                  Run preview
                </>
              )}
            </button>

            {previewLinks.length > 0 && (
              <>
                <div className="space-y-2 mb-4">
                  {previewLinks.map((link, i) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary-500/30 hover:bg-white/10 transition-colors group">
                      <span className="text-primary-300 font-bold text-sm w-6 text-center">#{i + 1}</span>
                      <span className="flex-1 text-white font-semibold truncate group-hover:text-primary-200 transition-colors">{link.title}</span>
                      <span className="text-white/30 text-xs font-mono bg-white/5 px-2 py-1 rounded">{link.score}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowExplanation(!showExplanation)} className="text-xs text-white/50 hover:text-primary-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors font-semibold">
                  {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showExplanation ? 'Hide' : 'Show'} details
                </button>
                {showExplanation && previewExplanation && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2.5">
                    {previewExplanation.evaluatedRules.map((r, i) => (
                      <div key={i} className={`flex items-center gap-2 ${r.matched ? 'text-primary-300' : 'text-white/30'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          r.matched ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-white/20'
                        }`}>
                          {r.matched ? '\u2713' : '\u2717'}
                        </span>
                        <span className="font-medium">{r.ruleName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1 p-1 bg-white/5 rounded-full border border-white/10">
              {(['7d', '30d'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setAnalyticsWindow(w)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    analyticsWindow === w
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {w === '7d' ? '7 days' : '30 days'}
                </button>
              ))}
            </div>
            <a href={api.getExportUrl(hubId, analyticsWindow === '7d' ? 7 : 30)} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </a>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-white/20 animate-spin" /></div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="card py-5 px-4">
                  <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-[0.2em]">Visits</p>
                  <p className="stat-value text-2xl">{formatNumber(analyticsStats.totalVisits)}</p>
                </div>
                <div className="card py-5 px-4">
                  <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-[0.2em]">Clicks</p>
                  <p className="stat-value text-2xl text-primary-300">{formatNumber(analyticsStats.totalClicks)}</p>
                </div>
                <div className="card py-5 px-4">
                  <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-[0.2em]">CTR</p>
                  <p className="stat-value text-2xl">{analyticsStats.overallCtr}%</p>
                </div>
              </div>

              <div className="card mb-6">
                <p className="text-sm font-semibold text-white mb-5">Daily breakdown</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider border-b border-white/10">
                      <th className="pb-3">Date</th><th className="pb-3 text-right">Visits</th><th className="pb-3 text-right">Clicks</th><th className="pb-3 text-right">CTR</th>
                    </tr></thead>
                    <tbody>
                      {timeseries.slice(-7).map((d) => (
                        <tr key={d.date} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-white/70 font-mono text-xs">{d.date}</td>
                          <td className="py-3 text-right text-white/50 font-medium">{d.visits}</td>
                          <td className="py-3 text-right text-primary-400 font-semibold">{d.clicks}</td>
                          <td className="py-3 text-right text-white/40">{d.visits > 0 ? ((d.clicks / d.visits) * 100).toFixed(0) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <p className="text-sm font-semibold text-white mb-5">Link performance</p>
                {linkAnalytics.length === 0 ? (
                  <p className="text-white/30 text-sm py-8 text-center">No data available</p>
                ) : (
                  <table className="w-full">
                    <thead><tr className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider border-b border-white/10">
                      <th className="pb-3">#</th><th className="pb-3">Link</th><th className="pb-3 text-right">Clicks</th><th className="pb-3 text-right">CTR</th><th className="pb-3 text-right">Trend</th>
                    </tr></thead>
                    <tbody>
                      {linkAnalytics.map((l) => (
                        <tr key={l.linkId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-white/50 text-sm font-mono">{l.rank}</td>
                          <td className="py-3 text-white font-medium text-sm truncate max-w-[150px]">{l.title}</td>
                          <td className="py-3 text-right text-primary-400 font-semibold">{formatNumber(l.clicks)}</td>
                          <td className="py-3 text-right text-white/50">{l.ctr}%</td>
                          <td className="py-3 text-right">
                            {l.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400 inline" />}
                            {l.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400 inline" />}
                            {l.trend === 'stable' && <Minus className="w-4 h-4 text-white/30 inline" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLinkModal(false)} />
          <div className="card-glow relative w-full max-w-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-primary-400/40 to-primary-600/60" />
            <h2 className="text-xl font-semibold text-white">{editingLink ? 'Edit link' : 'Add link'}</h2>
            <form onSubmit={handleSaveLink} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Title</label>
                <input type="text" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">URL</label>
                <input type="url" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} className="input-field font-mono text-sm" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Icon <span className="text-white/20">(optional)</span></label>
                <input type="text" value={linkForm.icon} onChange={(e) => setLinkForm({ ...linkForm, icon: e.target.value })} className="input-field" placeholder="github, linkedin, globe..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLinkModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={savingLink} className="btn-primary flex-1">{savingLink ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRuleModal(false)} />
          <div className="card-glow relative w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-primary-400/40 to-primary-600/60" />
            <h2 className="text-xl font-semibold text-white">{editingRule ? 'Edit rule' : 'Add rule'}</h2>
            
            {!editingRule && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Quick templates</p>
                <div className="flex flex-wrap gap-1.5">
                  {RULE_TEMPLATES.map((t, i) => (
                    <button key={i} type="button" onClick={() => applyTemplate(t)} className="px-2 py-1 rounded text-xs bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveRule} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Name</label>
                <input type="text" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Type</label>
                  <select value={ruleForm.type} onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value as Rule['type'] })} className="input-field">
                    <option value="DEVICE">DEVICE</option>
                    <option value="TIME">TIME</option>
                    <option value="PERFORMANCE">PERFORMANCE</option>
                    <option value="LOCATION">LOCATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Priority</label>
                  <input type="number" value={ruleForm.priority} onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 0 })} className="input-field" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Condition (JSON)</label>
                <textarea value={ruleForm.conditionJson} onChange={(e) => setRuleForm({ ...ruleForm, conditionJson: e.target.value })} className="input-field font-mono text-xs" rows={3} required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Action (JSON)</label>
                <textarea value={ruleForm.actionJson} onChange={(e) => setRuleForm({ ...ruleForm, actionJson: e.target.value })} className="input-field font-mono text-xs" rows={3} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRuleModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={savingRule} className="btn-primary flex-1">{savingRule ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Magic Rule Modal */}
      <MagicRuleModal
        show={showMagicRuleModal}
        prompt={magicPrompt}
        loading={generatingRule}
        onClose={() => setShowMagicRuleModal(false)}
        onPromptChange={setMagicPrompt}
        onSubmit={handleGenerateMagicRule}
      />
    </div>
  );
}
