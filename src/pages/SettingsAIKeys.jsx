import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'

/* ─── Status pill ─────────────────────────────────────────── */
function StatusBadge({ provider }) {
  const { userKey, systemConfigured } = provider
  if (userKey?.isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        সংযুক্ত
      </span>
    )
  }
  if (userKey) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        সেভ করা (verify হয়নি)
      </span>
    )
  }
  if (systemConfigured) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        সিস্টেম কী
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
      কনফিগার নেই
    </span>
  )
}

/* ─── One provider card ───────────────────────────────────── */
function ProviderCard({ provider, onSaved, onRemoved }) {
  const [keyInput, setKeyInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [removing, setRemoving] = useState(false)

  const hasUserKey = !!provider.userKey

  async function handleSaveAndTest() {
    const key = keyInput.trim()
    if (key.length < 8) {
      toast.error('API key অনেক ছোট')
      return
    }
    setSaving(true)
    try {
      // 1) Test BEFORE saving — don't pollute DB with a junk key.
      const test = await api.post(`/user/ai-keys/${provider.name}/test`, { apiKey: key })
      if (!test.data?.valid) {
        toast.error(test.data?.message || 'Key কাজ করছে না')
        setSaving(false)
        return
      }
      // 2) Save (encrypted server-side).
      await api.put(`/user/ai-keys/${provider.name}`, { apiKey: key })
      // 3) Verify the saved key (sets is_verified: true).
      await api.post(`/user/ai-keys/${provider.name}/test`, {})
      toast.success(`${provider.label} সংযুক্ত হয়েছে ✓`)
      setKeyInput('')
      setShowInput(false)
      onSaved?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'সেভ করা যায়নি')
    } finally {
      setSaving(false)
    }
  }

  async function handleTestStored() {
    setTesting(true)
    try {
      const { data } = await api.post(`/user/ai-keys/${provider.name}/test`, {})
      if (data?.valid) {
        toast.success('Key কাজ করছে ✓')
      } else {
        toast.error(data?.message || 'Key কাজ করছে না')
      }
      onSaved?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Test ব্যর্থ')
    } finally {
      setTesting(false)
    }
  }

  async function handleRemove() {
    if (!confirm(`${provider.label} এর key মুছে ফেলবেন?`)) return
    setRemoving(true)
    try {
      await api.delete(`/user/ai-keys/${provider.name}`)
      toast.success(`${provider.label} সরানো হয়েছে`)
      onRemoved?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'মুছতে ব্যর্থ')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {provider.label}
            </h3>
            {provider.recommended && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600">
                Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{provider.description}</p>
        </div>
        <StatusBadge provider={provider} />
      </div>

      {/* Body — different for "has key" vs "no key" states */}
      {hasUserKey ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-mono text-xs text-gray-700 flex-1 truncate">
              {provider.userKey.preview}
            </span>
            <button
              onClick={handleTestStored}
              disabled={testing}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 btn-press"
            >
              {testing ? 'টেস্ট হচ্ছে...' : 'টেস্ট'}
            </button>
            <button
              onClick={() => setShowInput(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 btn-press"
            >
              বদলান
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 btn-press"
            >
              {removing ? '...' : 'মুছুন'}
            </button>
          </div>
          {showInput && (
            <KeyInputRow
              keyInput={keyInput}
              setKeyInput={setKeyInput}
              saving={saving}
              onSave={handleSaveAndTest}
              onCancel={() => { setShowInput(false); setKeyInput('') }}
              keyPrefix={provider.keyPrefix}
            />
          )}
        </div>
      ) : (
        <div className="mt-3">
          {showInput ? (
            <KeyInputRow
              keyInput={keyInput}
              setKeyInput={setKeyInput}
              saving={saving}
              onSave={handleSaveAndTest}
              onCancel={() => { setShowInput(false); setKeyInput('') }}
              keyPrefix={provider.keyPrefix}
            />
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="w-full text-sm font-semibold px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition-colors btn-press"
            >
              + আপনার {provider.label} API key যোগ করুন
            </button>
          )}
        </div>
      )}

      {/* Footer — link to provider signup */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <a
          href={provider.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
        >
          ফ্রি API key পেতে এখানে যান
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
        {provider.userKey?.lastUsedAt && (
          <span className="text-gray-400">
            শেষ ব্যবহার: {new Date(provider.userKey.lastUsedAt).toLocaleDateString('bn-BD')}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Reusable input row (paste + save/cancel) ────────────── */
function KeyInputRow({ keyInput, setKeyInput, saving, onSave, onCancel, keyPrefix }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder={keyPrefix ? `${keyPrefix}...` : 'API key paste করুন'}
          autoFocus
          className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={saving || !keyInput.trim()}
          className="flex-1 text-sm font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 btn-press shadow-sm"
        >
          {saving ? 'যাচাই হচ্ছে...' : 'যাচাই করে সেভ করুন'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 btn-press"
        >
          বাতিল
        </button>
      </div>
      <p className="text-[11px] text-gray-400">
        🔒 আপনার key encrypted (AES-256) স্টোর হবে। সার্ভার ছাড়া কেউ পড়তে পারবে না।
      </p>
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────── */
export default function SettingsAIKeys() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProviders() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/user/ai-keys')
      setProviders(data?.providers || [])
    } catch (err) {
      const msg = err?.response?.data?.message || 'লোড করা যায়নি'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProviders() }, [])

  // Sort: user-keyed first, then recommended, then alphabetical
  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
      if (!!a.userKey !== !!b.userKey) return a.userKey ? -1 : 1
      if (a.recommended !== b.recommended) return a.recommended ? -1 : 1
      return a.label.localeCompare(b.label)
    })
  }, [providers])

  const userKeyCount = providers.filter((p) => !!p.userKey).length
  const totalCount = providers.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">AI Providers</h1>
        <p className="text-sm text-gray-500 mt-1">
          নিজের API key যোগ করলে AI ফিচারগুলো (স্ক্যান, বই থেকে প্রশ্ন তৈরি) আনলিমিটেড পাবেন। যেগুলো যোগ করবেন না, সেগুলোতে আমাদের ফ্রি কোটা থেকে চলবে।
        </p>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div className="flex-1 text-sm">
            <p className="font-bold text-gray-900">
              {userKeyCount > 0
                ? `${userKeyCount} / ${totalCount} provider আপনার নিজের key দিয়ে চলছে`
                : 'এখনো কোনো নিজের key যোগ করেননি'}
            </p>
            <p className="text-[12px] text-gray-500">
              {userKeyCount > 0
                ? 'বাকি provider-গুলো সিস্টেম কী দিয়ে চালু আছে।'
                : 'নিচের যেকোনো provider-এ নিজের key যোগ করতে পারেন।'}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-100">
          {error}
          <button
            onClick={fetchProviders}
            className="block mx-auto mt-3 text-blue-600 font-semibold hover:underline"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedProviders.map((p) => (
            <ProviderCard
              key={p.name}
              provider={p}
              onSaved={fetchProviders}
              onRemoved={fetchProviders}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
