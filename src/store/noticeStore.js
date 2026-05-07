import { create } from 'zustand'

export const EMPTY_NOTICE = {
  header_top_line: '',
  header_logo_url: null,
  header_org_name: '',
  header_subtitle: '',
  header_address: '',
  header_extra: '',
  header_contact: '',
  header_alignment: 'center',
  header_band_color: '',
  reference_no: '',
  notice_date: '',
  date_label: 'তারিখ',
  title: 'জরুরী নোটিশ',
  show_title: true,
  subject: '',
  body_blocks: [
    { id: crypto.randomUUID(), type: 'paragraph', text: '' },
  ],
  signature_image_url: null,
  signature_name: '',
  signature_title: '',
  signature_org: '',
  signature_align: 'right',
  copy_to: [],
  footer_text: '',
  footer_color: '',
  style_preset: 'classic',
}

export const DEMO_NOTICE = {
  header_top_line: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
  header_logo_url: null,
  header_org_name: 'দিনাজপুর সরকারি বালিকা উচ্চ বিদ্যালয়, দিনাজপুর',
  header_subtitle: 'প্রধান শিক্ষকের কার্যালয়',
  header_address: 'www.dgghs.edu.bd, Board Code: 7514, Center Code: 728, EIIN: 120718',
  header_extra: '',
  header_contact: 'টেলিফোন: ০৫৩১-৬৫০২০, মোবাইল: ০১৩০৯-১২০৭১৮, E-mail: dinajpurgirlsschool@gmail.com',
  header_alignment: 'center',
  header_band_color: '',
  reference_no: '',
  notice_date: '২৭/০৫/২০২৫',
  date_label: 'তারিখ',
  title: 'জরুরী নোটিশ',
  show_title: true,
  subject: '',
  body_blocks: [
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      text: 'এতদ্বারা দিনাজপুর সরকারি বালিকা উচ্চ বিদ্যালয়ের সংশ্লিষ্ট সবাইকে জানানো যাচ্ছে যে, অর্ধবার্ষিক পরীক্ষা আগামী ২৪ জুন থেকে অনুষ্ঠিত হবে। তাই শিক্ষার্থীদেরকে নিম্নহারে পরীক্ষার ফি যথাসময়ে মোবাইল ব্যাংকিং এর মাধ্যমে পরিশোধ করতে হবে।',
    },
    {
      id: crypto.randomUUID(),
      type: 'list',
      style: 'bullet',
      items: [
        '৩য়, ৪র্থ ও ৫ম শ্রেণি = ৩০০ টাকা।',
        '৬ষ্ঠ, ৭ম ও ৮ম শ্রেণি = ৪০০ টাকা।',
        '৯ম ও ১০ম শ্রেণি = ৫০০ টাকা।',
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      text: 'পরীক্ষার ফি: ২৮/০৫/২০২৫ থেকে ০৪/০৬/২০২৫ তারিখের মধ্যে বকেয়াসহ নগদ, রকেট মোবাইল ব্যাংকিং এর মাধ্যমে যাবতীয় পাওনাদি পরিশোধ করতে হবে।',
    },
  ],
  signature_image_url: null,
  signature_name: 'নাজমা ইয়াসমীন',
  signature_title: 'প্রধান শিক্ষক (ভারপ্রাপ্ত)',
  signature_org: 'দিনাজপুর সরকারি বালিকা উচ্চ বিদ্যালয়, দিনাজপুর',
  signature_align: 'right',
  copy_to: [],
  footer_text: '',
  footer_color: '',
  style_preset: 'classic',
}

const useNoticeStore = create((set) => ({
  currentNotice: null,
  isDirty: false,

  setNotice: (notice) =>
    set({ currentNotice: notice, isDirty: false }),

  updateNotice: (fields) =>
    set((state) => ({
      currentNotice: { ...state.currentNotice, ...fields },
      isDirty: true,
    })),

  addBlock: (block) =>
    set((state) => ({
      currentNotice: {
        ...state.currentNotice,
        body_blocks: [
          ...(state.currentNotice?.body_blocks || []),
          { id: crypto.randomUUID(), ...block },
        ],
      },
      isDirty: true,
    })),

  updateBlock: (id, fields) =>
    set((state) => ({
      currentNotice: {
        ...state.currentNotice,
        body_blocks: (state.currentNotice?.body_blocks || []).map((b) =>
          b.id === id ? { ...b, ...fields } : b
        ),
      },
      isDirty: true,
    })),

  removeBlock: (id) =>
    set((state) => ({
      currentNotice: {
        ...state.currentNotice,
        body_blocks: (state.currentNotice?.body_blocks || []).filter((b) => b.id !== id),
      },
      isDirty: true,
    })),

  reorderBlocks: (blocks) =>
    set((state) => ({
      currentNotice: { ...state.currentNotice, body_blocks: blocks },
      isDirty: true,
    })),

  clearNotice: () => set({ currentNotice: null, isDirty: false }),

  markClean: () => set({ isDirty: false }),
}))

export default useNoticeStore
