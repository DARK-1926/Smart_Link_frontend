import { Sparkles, Loader2 } from 'lucide-react';

interface MagicRuleModalProps {
  show: boolean;
  prompt: string;
  loading: boolean;
  onClose: () => void;
  onPromptChange: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MagicRuleModal({
  show,
  prompt,
  loading,
  onClose,
  onPromptChange,
  onSubmit
}: MagicRuleModalProps) {
  if (!show) return null;

  const examples = [
    'Show my resume on mobile',
    'Boost my portfolio on weekends',
    'Pin my contact link for people from India',
    'Hide my old blog from everyone',
    'Auto-promote my top 3 most clicked links',
    'Optimize my links automatically',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="card-glow relative w-full max-w-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-purple-500/60 to-primary-600/60" />
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-300" />
          </div>
          <h2 className="text-xl font-semibold text-white">Magic Rule</h2>
        </div>
        <p className="text-sm text-white/50 mb-6">Describe what you want in plain English, and we'll create the rule for you.</p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">What should this rule do?</label>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="input-field min-h-[100px] text-sm"
              placeholder="E.g., Show my portfolio link on mobile devices"
              required
              autoFocus
            />
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Examples:</p>
            <div className="space-y-1.5">
              {examples.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPromptChange(example)}
                  className="block w-full text-left px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-4 h-4 relative" />
                  <span className="relative">Generate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
