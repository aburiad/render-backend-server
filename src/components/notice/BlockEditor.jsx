import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useNoticeStore from '@/store/noticeStore'

export default function BlockEditor() {
  const blocks = useNoticeStore((s) => s.currentNotice?.body_blocks || [])
  const addBlock = useNoticeStore((s) => s.addBlock)
  const reorderBlocks = useNoticeStore((s) => s.reorderBlocks)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = blocks.findIndex((b) => b.id === active.id)
    const newIdx = blocks.findIndex((b) => b.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    reorderBlocks(arrayMove(blocks, oldIdx, newIdx))
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => addBlock({ type: 'paragraph', text: '' })}
          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100"
        >
          + অনুচ্ছেদ
        </button>
        <button
          onClick={() => addBlock({ type: 'list', style: 'bullet', items: [''] })}
          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-100"
        >
          + বুলেট লিস্ট
        </button>
        <button
          onClick={() => addBlock({ type: 'list', style: 'numbered', items: [''] })}
          className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100"
        >
          + নম্বরড লিস্ট
        </button>
        <button
          onClick={() => addBlock({ type: 'spacer', height: 16 })}
          className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100"
        >
          + ফাঁকা স্থান
        </button>
      </div>
    </div>
  )
}

function SortableBlock({ block }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const updateBlock = useNoticeStore((s) => s.updateBlock)
  const removeBlock = useNoticeStore((s) => s.removeBlock)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white border border-gray-200 rounded-xl"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100 rounded-t-xl">
        <button
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab"
          title="টেনে সাজান"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          {block.type === 'paragraph' && 'অনুচ্ছেদ'}
          {block.type === 'list' && (block.style === 'numbered' ? 'নম্বরড লিস্ট' : 'বুলেট লিস্ট')}
          {block.type === 'spacer' && 'ফাঁকা স্থান'}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => removeBlock(block.id)}
          className="text-gray-400 hover:text-red-500"
          title="মুছুন"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3">
        {block.type === 'paragraph' && (
          <textarea
            value={block.text || ''}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="অনুচ্ছেদ লিখুন..."
            rows={3}
            className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {block.type === 'list' && (
          <ListItemsEditor block={block} onUpdate={(fields) => updateBlock(block.id, fields)} />
        )}

        {block.type === 'spacer' && (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-gray-500">উচ্চতা:</label>
            <input
              type="number"
              value={block.height || 16}
              onChange={(e) => updateBlock(block.id, { height: Number(e.target.value) })}
              min={4}
              max={120}
              className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">px</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ListItemsEditor({ block, onUpdate }) {
  const items = block.items || ['']

  const updateItem = (idx, value) => {
    const next = [...items]
    next[idx] = value
    onUpdate({ items: next })
  }

  const addItem = () => onUpdate({ items: [...items, ''] })

  const removeItem = (idx) => {
    if (items.length <= 1) return onUpdate({ items: [''] })
    onUpdate({ items: items.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-gray-500">স্টাইল:</span>
        <button
          onClick={() => onUpdate({ style: 'bullet' })}
          className={`text-[10px] px-2 py-0.5 rounded ${
            (block.style || 'bullet') === 'bullet'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          • বুলেট
        </button>
        <button
          onClick={() => onUpdate({ style: 'numbered' })}
          className={`text-[10px] px-2 py-0.5 rounded ${
            block.style === 'numbered'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          1. নম্বরড
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-xs font-semibold text-gray-400 mt-2 w-5 text-right flex-shrink-0">
            {block.style === 'numbered' ? `${i + 1}.` : '•'}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={`আইটেম ${i + 1}`}
            className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => removeItem(i)}
            disabled={items.length <= 1}
            className="text-gray-300 hover:text-red-500 p-1 disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-[11px] text-blue-600 font-medium hover:text-blue-700 mt-1"
      >
        + আইটেম যোগ করুন
      </button>
    </div>
  )
}
