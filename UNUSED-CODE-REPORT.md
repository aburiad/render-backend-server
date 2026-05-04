# Unused Code Report — Proshno Shala

Generated: 2026-04-09

---

## সম্পূর্ণ Unused ফাইল (কোথাও import/reference নেই)

### 1. `src/store/examStore.js`
- **অবস্থা:** পুরো store কোথাও import হয় না
- **কারণ:** ExamPortal.jsx নিজে local useState দিয়ে exam state manage করে। examStore কোনোদিন connect করা হয়নি
- **Contains:** setExam(), setAnswer(), setTimeRemaining(), markSubmitted(), resetExam()
- **সুপারিশ:** মুছে ফেলুন, অথবা ExamPortal-এ integrate করুন যদি multi-tab/answer persistence দরকার হয়

### 2. `src/utils/formatting.js`
- **অবস্থা:** দুটো export — `autoFormatChemistry()` ও `stripHtml()` — কোথাও import নেই
- **কারণ:** তৈরি করা হয়েছিল কিন্তু কোনো component-এ ব্যবহার করা হয়নি
- **সুপারিশ:** মুছে ফেলুন

### 3. `src/App.css`
- **অবস্থা:** ০ বাইট খালি ফাইল, কোথাও import নেই
- **কারণ:** Vite starter template থেকে এসেছে, পরে সব style index.css ও Tailwind-এ চলে গেছে
- **সুপারিশ:** মুছে ফেলুন

### 4. `src/assets/react.svg`
- **অবস্থা:** কোনো ফাইলে import/reference নেই
- **কারণ:** Vite starter template-এর ডিফল্ট ফাইল
- **সুপারিশ:** মুছে ফেলুন

### 5. `src/assets/vite.svg`
- **অবস্থা:** কোনো ফাইলে import/reference নেই
- **কারণ:** Vite starter template-এর ডিফল্ট ফাইল
- **সুপারিশ:** মুছে ফেলুন

### 6. `src/assets/hero.png`
- **অবস্থা:** কোনো ফাইলে import/reference নেই
- **কারণ:** আগে কোথাও ব্যবহৃত ছিল, পরে সরিয়ে দেওয়া হয়েছে কিন্তু ফাইলটা রয়ে গেছে
- **সুপারিশ:** মুছে ফেলুন

---

## Placeholder/অসম্পূর্ণ পেজ

### 7. `src/pages/ScanUpload.jsx`
- **অবস্থা:** শুধু "Phase 4 এ তৈরি হবে" লেখা — ৮ লাইনের placeholder component
- **Route:** `/scan` — App.jsx-এ route আছে, AppShell-এর ভেতরে
- **সুপারিশ:** Implement করুন অথবা route লুকিয়ে রাখুন যতক্ষণ ready না হয়

---

## Dead Code (ফাইলের ভেতরে)

### 8. `src/pages/PaperEditor.jsx` — Line 110
```js
const autoSaveTimer = useRef(null)
```
- **অবস্থা:** Declare করা হয়েছে কিন্তু কোথাও ব্যবহৃত না
- **কারণ:** Auto-save feature commented out (line 196-202), কিন্তু ref রয়ে গেছে
- **সুপারিশ:** মুছে ফেলুন

### 9. `src/pages/PaperEditor.jsx` — Lines 196-202
```js
// Auto-save disabled - uncomment to enable
// useEffect(() => {
//   if (isDirty) {
//     const timer = setTimeout(saveToBackend, 5000)
//     return () => clearTimeout(timer)
//   }
// }, [isDirty, saveToBackend])
```
- **অবস্থা:** ৭ লাইন commented-out code
- **সুপারিশ:** Implement করুন অথবা মুছে ফেলুন — commented code রাখা ভালো practice না

---

## সারাংশ

| ক্যাটাগরি | সংখ্যা | কি করবেন |
|---|---|---|
| Unused ফাইল (পুরোটাই অপ্রয়োজনীয়) | 6 | মুছে ফেলুন |
| Placeholder পেজ | 1 | সিদ্ধান্ত নিন — implement/hide |
| Dead code (ফাইলের ভেতরে) | 2 | মুছে ফেলুন |

### মুছলে কত জায়গা বাঁচবে:
- `examStore.js` — 24 lines
- `formatting.js` — 27 lines
- `App.css` — 0 bytes (খালি)
- `react.svg` + `vite.svg` — 2 SVG files
- `hero.png` — 1 image file
- `PaperEditor.jsx` dead code — 8 lines

**মোট: 3টি JS ফাইল + 1টি CSS + 3টি asset ফাইল মুছতে পারেন, এবং PaperEditor থেকে 8 লাইন সরাতে পারেন।**
