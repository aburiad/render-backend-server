import React from 'react'

const toBengaliDigit = (num) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return num.toString().split('').map(digit => bengaliDigits[digit] || digit).join('')
}

export default function OmrTemplate({ paper, settings }) {
  const { schoolName, examType, year, totalQuestions } = settings
  
  // Calculate grid dimensions
  const questionsPerColumn = Math.ceil(totalQuestions / 3)
  const columns = []
  for (let i = 0; i < 3; i++) {
    const start = i * questionsPerColumn
    if (start < totalQuestions) {
      columns.push(Array.from({ length: Math.min(questionsPerColumn, totalQuestions - start) }, (_, idx) => start + idx + 1))
    }
  }

  const bubbleLabels = ['ক', 'খ', 'গ', 'ঘ']
  const rollDigits = 6
  const regDigits = 10
  const subDigits = 3
  const classes = ['৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম']
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="omr-container bg-white w-[210mm] min-h-[297mm] mx-auto p-0 text-black font-['Kalpurush','Hind_Siliguri',sans-serif] relative shadow-2xl print:shadow-none print:m-0 overflow-hidden text-[11px]">
      
      {/* Left Timing Marks - Positioned at absolute left: 0 */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-12 z-20 print:flex">
        {Array.from({ length: 45 }).map((_, i) => (
          <div key={i} className="w-3.5 h-1.5 bg-black" />
        ))}
      </div>

      <div className="ml-8 pr-8 pt-6 pb-10 flex flex-col items-stretch">
        {/* Header Section */}
        <div className="text-center mb-3">
          <h1 className="text-[24px] font-black mb-1 tracking-tight leading-tight uppercase">{schoolName}</h1>
          <div className="flex justify-center items-center gap-4 font-bold mb-2.5">
            {['অর্ধ-বার্ষিক', 'বার্ষিক', 'প্রাক-নির্বাচনী', 'নির্বাচনী পরীক্ষা'].map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full border border-black ${examType === type ? 'bg-black shadow-[inset_0_0_0_2px_white]' : ''}`} />
                <span className="text-[10px]">{type}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 ml-2 py-0.5 px-1.5 border border-black rounded bg-gray-50 scale-90">
              <span className="text-base">২</span>
              <span className="text-base">০</span>
              <span className="text-base font-black">{toBengaliDigit(year[2] || '২')}</span>
              <div className="w-5 h-6 border border-black flex items-center justify-center font-bold text-base bg-white">
                {toBengaliDigit(year[3] || '')}
              </div>
            </div>
          </div>

          <div className="bg-black text-white py-1 px-4 text-[9px] font-bold inline-block mx-auto rounded-sm mb-1 whitespace-nowrap">
            উত্তরপত্রের নির্ধারিত স্থান ব্যতীত কোন স্থানে অবাঞ্ছিত দাগ বা কোন কিছু লেখা যাবে না
          </div>
          <br/>
          <div className="border border-red-600 text-red-600 py-1 px-5 text-[9px] font-black inline-block mx-auto mb-1 uppercase rounded-sm bg-red-50/20">
            অবশ্যই কালো বল-পয়েন্ট কলম দিয়ে বৃত্ত ভরাট করতে হবে
          </div>
          <br/>
          <h2 className="text-[12px] font-black border-b-2 border-black inline-block px-10 pb-0.5 mt-1 uppercase text-gray-800">পরীক্ষার্থীর তথ্য</h2>
        </div>

        {/* Student Info Blocks */}
        <div className="flex gap-2 mb-2 h-auto justify-center">
          {/* Roll Number */}
          <div className="border border-pink-400 p-0.5 flex flex-col rounded bg-white w-[130px]">
            <div className="text-[8px] font-black text-center border-b border-pink-400 mb-0.5 bg-pink-50 py-0.5 uppercase leading-none">রোল নম্বর</div>
            <div className="grid grid-cols-6 gap-0.5 mb-0.5 h-3.5 px-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-pink-400 h-full rounded-sm" />
              ))}
            </div>
            <div className="grid grid-cols-6 gap-0 px-0.5 pb-0.5">
              {Array.from({ length: 6 }).map((_, col) => (
                <div key={col} className="flex flex-col gap-0 items-center">
                  {digits.map(d => (
                    <div key={d} className="w-[11.5px] h-[11.5px] rounded-full border border-pink-400 flex items-center justify-center text-[6.5px] leading-none font-bold text-pink-700 bg-white">
                      {toBengaliDigit(d)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Number */}
          <div className="border border-pink-400 p-0.5 flex flex-col rounded bg-white w-[210px]">
            <div className="text-[8px] font-black text-center border-b border-pink-400 mb-0.5 bg-pink-50 py-0.5 uppercase leading-none">রেজিস্ট্রেশন নম্বর</div>
            <div className="grid grid-cols-10 gap-0.5 mb-0.5 h-3.5 px-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border border-pink-400 h-full rounded-sm" />
              ))}
            </div>
            <div className="grid grid-cols-10 gap-0 px-0.5 pb-0.5">
              {Array.from({ length: 10 }).map((_, col) => (
                <div key={col} className="flex flex-col gap-0 items-center">
                  {digits.map(d => (
                    <div key={d} className="w-[11.5px] h-[11.5px] rounded-full border border-pink-400 flex items-center justify-center text-[6.5px] leading-none font-bold text-pink-700 bg-white">
                      {toBengaliDigit(d)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Subject & Class Block */}
          <div className="flex flex-col gap-1.5">
             <div className="border border-pink-400 p-0.5 flex flex-col rounded bg-white w-[80px]">
                <div className="text-[8px] font-black text-center border-b border-pink-400 mb-0.5 bg-pink-50 py-0.5 uppercase">বিষয় কোড</div>
                <div className="grid grid-cols-3 gap-0.5 mb-0.5 h-3.5 px-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-pink-400 h-full rounded-sm" />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-0 px-0.5 pb-0.5">
                  {Array.from({ length: 3 }).map((_, col) => (
                    <div key={col} className="flex flex-col gap-0 items-center">
                      {digits.map(d => (
                        <div key={d} className="w-[11.5px] h-[11.5px] rounded-full border border-pink-400 flex items-center justify-center text-[6.5px] leading-none font-bold text-pink-700 bg-white">
                          {toBengaliDigit(d)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="border border-pink-400 p-0.5 flex flex-col rounded bg-white w-[80px] flex-1">
                <div className="text-[8px] font-black text-center border-b border-pink-400 mb-1 bg-pink-50 py-0.5">শ্রেণী</div>
                <div className="flex flex-col justify-around flex-1 px-1 gap-0.5">
                  {classes.map(c => (
                    <div key={c} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-pink-400 bg-white" />
                      <span className="text-[8px] font-bold">{c}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Date & Signature Column */}
          <div className="flex flex-col gap-1.5 w-24">
            <div className="border border-black p-1 flex flex-col bg-gray-50 h-[45px] relative rounded">
               <span className="text-[8px] font-black text-gray-500 absolute -top-1.5 left-1.5 bg-white px-1">তারিখ:</span>
               <div className="mt-1 border-b border-black/10 w-full" />
            </div>
            <div className="border border-black p-1 flex flex-col bg-white flex-1 rounded relative">
               <div className="flex-1" />
               <div className="text-[7.5px] font-bold text-center leading-tight">কক্ষ পরিদর্শকের স্বাক্ষর</div>
            </div>
          </div>
        </div>

        {/* Answer Grid Separator Title */}
        <div className="text-center py-4">
          <h3 className="text-[12px] font-black border-b border-black inline-block px-12 pb-0.5 tracking-wide uppercase">নৈর্ব্যক্তিক অভীক্ষা উত্তরপত্র</h3>
        </div>

        {/* Main Answer Grid - Full Width Now */}
        <div className="border border-pink-400 p-3 rounded bg-white mb-4">
          <div className="grid grid-cols-3 gap-8">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="space-y-1">
                <div className="grid grid-cols-[20px_1fr] border-b border-pink-400 pb-0.5 mb-1 text-[8px] font-black text-pink-700 uppercase">
                  <div>SL</div>
                  <div className="flex justify-around">
                    {bubbleLabels.map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>
                {col.map((qNum) => (
                  <div key={qNum} className="grid grid-cols-[20px_1fr] items-center">
                    <div className="text-[10px] font-black text-pink-900">{toBengaliDigit(qNum)}</div>
                    <div className="flex justify-between px-0.5">
                      {bubbleLabels.map((label) => (
                        <div key={label} className="w-[16.5px] h-[16.5px] rounded-full border border-pink-500 flex items-center justify-center text-[8.5px] font-black text-pink-700 bg-white shadow-sm">
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Set Code and Rules - Positioned Below Answer Grid */}
        <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
           {/* Set Code */}
           <div className="border border-pink-400 p-2.5 rounded bg-white relative">
              <div className="text-[9px] font-black text-center border-b border-pink-400 mb-2 bg-pink-50 py-0.5">নৈর্ব্যক্তিক প্রশ্নের সেট</div>
              <div className="flex justify-around items-center px-1">
                {bubbleLabels.map(l => (
                  <div key={l} className="flex flex-col items-center gap-1.5">
                    <div className="w-[19px] h-[19px] rounded-full border border-pink-500 flex items-center justify-center text-[9.5px] font-black text-pink-700 bg-white">{l}</div>
                  </div>
                ))}
              </div>
              <div className="text-red-600 text-[8px] font-black italic mt-1.5 text-center leading-none">
                (বি.দ্র. কোন প্রকার সীল মোহর দেয়া নিষেধ)
              </div>
           </div>

           {/* Rules Section */}
           <div className="text-[10px] space-y-1.5 font-bold leading-tight py-2.5 px-4 border border-gray-200 rounded bg-gray-50/20">
             <div className="font-black border-b border-black inline-block mb-1 text-[11px] text-black pb-0.5">নিয়মাবলি</div>
             <p>১। বৃত্তাকার ঘরগুলো এমনভাবে ভরাট করতে হবে যাতে ভেতরের অক্ষরটি দেখা না যায়।</p>
             
             <div className="flex items-center gap-6 my-1">
               <div className="flex items-center gap-2">
                 <span className="text-green-600">সঠিক পদ্ধতি:</span>
                 <div className="w-3.5 h-3.5 rounded-full bg-black shadow-sm" />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-red-500">ভুল পদ্ধতি:</span>
                 <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8px] bg-white opacity-50">×</div>
                    <div className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[10px] bg-white opacity-50">·</div>
                    <div className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8px] bg-white opacity-50">✓</div>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <p>২। বৃত্তাকার ঘরগুলো অবশ্যই বল-পয়েন্ট কলম দিয়ে ভরাট করতে হবে।</p>
                <p>৩। উত্তরপত্রে কোন অবাঞ্ছিত দাগ দেওয়া যাবে না।</p>
                <p>৪। উত্তরপত্রটিকে কোন অবস্থাতে ভাঁজ করা যাবে না।</p>
                <p>৫। সেট কোড না লিখলে/ভুল ভরাট করলে উত্তরপত্র বাতিল হবে।</p>
                <p className="col-span-2">৬। পরিষ্কার পরিচ্ছন্ন ও ভাঁজহীন উত্তরপত্র মেশিনে মূল্যায়নের জন্য অপরিহার্য।</p>
             </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .omr-container {
            width: 210mm !important;
            height: 297mm !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always !important;
          }
        }
      `}} />
    </div>
  )
}
