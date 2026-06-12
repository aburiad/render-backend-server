import { useEffect, useState } from 'react'
import api from '@/services/api'

/**
 * Asset Picker (Emoji-based for consistency)
 * Searchable dropdown for selecting icons (fruits, shapes, animals, etc.)
 * Used in VisualGridEditor for primary education questions
 */
export default function SvgAssetPicker({ value, onChange, onClose }) {
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    if (selectedCategory || search) {
      fetchAssets()
    }
  }, [selectedCategory, search])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (search) params.append('search', search)

      const { data } = await api.get(`/primary/assets?${params.toString()}`)
      setAssets(data.assets || [])

      // Also get categories if not loaded
      if (categories.length === 0 && data.categories) {
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const grouped = assets.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = []
    acc[asset.category].push(asset)
    return acc
  }, {})

  const handleSelect = (asset) => {
    onChange(asset.asset_key)
    onClose?.()
  }

  const categoryLabels = {
    fruit: 'ফল (Fruit)',
    shape: 'আকার (Shape)',
    animal: 'পশু (Animal)',
    school: 'স্কুল (School)',
    nature: 'প্রকৃতি (Nature)',
  }

  // Emoji mapping (same as PaperTemplate)
  const assetEmojis = {
    apple: '🍎',
    banana: '🍌',
    orange: '🍊',
    mango: '🥭',
    star: '⭐',
    circle: '⚪',
    square: '⬜',
    triangle: '🔺',
    rectangle: '▬',
    cat: '🐱',
    dog: '🐕',
    bird: '🐦',
    book: '📖',
    pencil: '✏️',
    bag: '🎒',
    sun: '☀️',
    moon: '🌙',
    flower: '🌸',
    tree: '🌲',
  }

  const getEmoji = (key) => assetEmojis[key] || '❓'

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-96 overflow-hidden flex flex-col">
      {/* Search & Filter */}
      <div className="p-3 border-b border-slate-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="খুঁজুন... (apple, star, cat)"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              !selectedCategory
                ? 'bg-pink-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">কোন আইটেম পাওয়া যায়নি</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
                {categoryLabels[category] || category}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {items.map((item) => (
                  <button
                    key={item.asset_key}
                    onClick={() => handleSelect(item)}
                    className={`aspect-square flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                      value === item.asset_key
                        ? 'bg-pink-100 ring-2 ring-pink-500'
                        : 'bg-slate-50 hover:bg-pink-50'
                    }`}
                    title={item.asset_key}
                  >
                    {/* Emoji Preview */}
                    <span className="text-2xl">{getEmoji(item.asset_key)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">সিলেক্ট করতে ক্লিক করুন</p>
      </div>
    </div>
  )
}
