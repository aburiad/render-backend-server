import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import TemplatePaperPreview from '@/components/paper/TemplatePaperPreview'
import usePaperStore from '@/store/paperStore'

/**
 * Full Paper Templates Modal
 * Shows complete exam paper templates for Primary education
 * Each template includes multiple questions in proper exam format
 */

// Complete paper templates organized by class, subject, and exam type
// Based on real NCTB primary exam format
const FULL_PAPER_TEMPLATES = {
  'class-3': {
    name: 'Class 3',
    icon: '📚',
    subjects: {
      bangla: {
        name: 'Bangla',
        nameEn: 'Bengali (১ম পত্র)',
        icon: '📖',
        papers: [
          {
            id: 'class-3-bangla-1st-term-full',
            name: '১ম সাময়িক পরীক্ষা (১ম পত্র)',
            nameEn: '1st Term Exam (Full Paper)',
            total_marks: 100,
            time_minutes: 120,
            instructions: 'প্রতিটি প্রশ্নের উত্তর দাও। সৃজনশীল প্রশ্নের উত্তরের জন্য যথেষ্ট স্থান রাখো। সব লেখা বাংলায় হবে।',
            questions: [
              // প্রশ্ন-১: দেখা অনুচ্ছেদ (Seen Passage - ২৫ নম্বর)
              {
                id: 'seen-passage-full',
                type: 'parent_passage',
                instruction: '১. নিচের অনুচ্ছেদটি পড়ে প্রশ্নগুলোর উত্তর দাও:',
                passage: 'শিশু মনে স্বপ্ন ফুটে ওঠে। সে স্বপ্ন দেখে সে হবে একজন ডাক্তার, ইঞ্জিনিয়ার বা শিক্ষক। মা-বাবা তার স্বপ্ন পূরণে সাহায্য করেন। সে স্কুলে যায়, পড়াশোনা করে। তার আছে অনেক স্বপ্ন, অনেক ইচ্ছে। সে চায় না কোনো অসুবিধা, চায় শুধু শান্তি আর সুখ। তার স্বপ্নে সে দেখে সুন্দর একটি পৃথিবী, যেখানে থাকবে শুধুই আনন্দ।',
                sub_questions: [
                  { label: '(ক)', text: 'শব্দার্থ লেখো (৫ নম্বর): স্বপ্ন, ডাক্তার, ইঞ্জিনিয়ার, শিক্ষক, ইচ্ছে', marks: 5 },
                  { label: '(খ)', text: 'সঠিক উত্তরটি লেখো (৫ নম্বর): শিশুর স্বপ্ন কী?', marks: 5 },
                  { label: '(গ)', text: 'সঠিক উত্তরটি লেখো (৫ নম্বর): মা-বাবা কী করেন?', marks: 5 },
                  { label: '(ঘ)', text: 'সঠিক উত্তরটি লেখো (৫ নম্বর): শিশুটি স্কুলে কেন যায়?', marks: 5 },
                  { label: '(ঙ)', text: 'সঠিক উত্তরটি লেখো (৫ নম্বর): শিশুটি কী চায় না?', marks: 5 },
                ],
                marks: 25,
              },
              // প্রশ্ন-২: এক কথায় প্রকাশ (১০ নম্বর)
              {
                id: 'one-word-full',
                type: 'standard_text',
                instruction: '২. এক কথায় প্রকাশ করো (১০ নম্বর):',
                items: [
                  { prefix: 'যে নিজের পেটের দায় নিজে বহন করে', answer: 'আত্মনির্ভর', suffix: '' },
                  { prefix: 'যিনি রোগ নির্ণয় করেন', answer: 'চিকিৎসক', suffix: '' },
                  { prefix: 'ফলের বাগান', answer: 'বাগিচা', suffix: '' },
                  { prefix: 'যিনি গান করেন', answer: 'গায়ক', suffix: '' },
                  { prefix: 'প্রতিবেশী বা পাড়ার লোক', answer: 'প্রতিবেশী', suffix: '' },
                  { prefix: 'মিথ্যা কথা বলে যে', answer: 'মিথ্যাবাদী', suffix: '' },
                  { prefix: 'পড়াশোনার উপকরণ', answer: 'সরঞ্জাম', suffix: '' },
                  { prefix: 'অপমান্ন করা', answer: 'অপমান্ননা', suffix: '' },
                  { prefix: 'বিদ্যালয়ের প্রধান শিক্ষক', answer: 'প্রধান শিক্ষক', suffix: '' },
                  { prefix: 'যিনি ক্রীড়া করেন', answer: 'খেলোয়াড়', suffix: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-৩: বিরাম চিহ্ন (১০ নম্বর)
              {
                id: 'punctuation-full',
                type: 'short_question',
                question: '৩. বিরাম চিহ্ন বসিয়ে নিচের অনুচ্ছেদটি পুনরায় লেখো (১০ নম্বর):\n"বাবা বললেন আজ আমরা বাজারে যাব রহিম বলল আমিও যাব আমি ওদের সাথে যাব না মা বললেন ঠিক আছে তুমি বাসায় থাক"\n(উত্তরের জন্য নিচে সারিবদ্ধ স্থান রাখো)',
                marks: 10,
                answer_space_lines: 6,
              },
              // প্রশ্ন-৪: ফরম পূরণ (১০ নম্বর)
              {
                id: 'form-fill-full',
                type: 'standard_text',
                instruction: '৪. নিচের তথ্যটি পূরণ করো (১০ নম্বর):',
                items: [
                  { prefix: 'নাম:', answer: '', suffix: '_______________________________', clue: '' },
                  { prefix: 'পিতার নাম:', answer: '', suffix: '_______________________________', clue: '' },
                  { prefix: 'মাতার নাম:', answer: '', suffix: '_______________________________', clue: '' },
                  { prefix: 'জন্ম তারিখ:', answer: '', suffix: '_____ / _____ / _______', clue: '' },
                  { prefix: 'শ্রেণি:', answer: '', suffix: '_______________________________', clue: '' },
                  { prefix: 'রোল নম্বর:', answer: '', suffix: '_______________________________', clue: '' },
                  { prefix: 'ঠিকানা:', answer: '', suffix: '_______________________________', clue: '' },
                  { prefix: 'ফোন নম্বর:', answer: '', suffix: '_______________________________', clue: '' },
                ],
                marks: 8,
              },
              // প্রশ্ন-৫: শব্দার্থ ও বিপরীত শব্দ (১০ নম্বর)
              {
                id: 'word-meaning-full',
                type: 'standard_text',
                instruction: '৫. শব্দার্থ ও বিপরীত শব্দ লেখো (১০ নম্বর):',
                items: [
                  { prefix: 'স্বপ্ন - শব্দার্থ:', answer: 'ঘুমের ভেতর দেখা কাল্পনিক চিত্র', suffix: '' },
                  { prefix: 'স্বপ্ন - বিপরীত:', answer: 'জাগরণ', suffix: '' },
                  { prefix: 'শান্তি - শব্দার্থ:', answer: 'বিশৃঙ্খলাহীন অবস্থা', suffix: '' },
                  { prefix: 'শান্তি - বিপরীত:', answer: 'অশান্তি', suffix: '' },
                  { prefix: 'সুখ - শব্দার্থ:', answer: 'আনন্দ বা প্রফুল্লতা', suffix: '' },
                  { prefix: 'সুখ - বিপরীত:', answer: 'দুঃখ', suffix: '' },
                  { prefix: 'উন্নতি - শব্দার্থ:', answer: 'উন্নয়ন বা অগ্রগতি', suffix: '' },
                  { prefix: 'উন্নতি - বিপরীত:', answer: 'অবনতি', suffix: '' },
                ],
                marks: 8,
              },
              // প্রশ্ন-৬: যুক্তাক্ষর (৮ নম্বর)
              {
                id: 'juktakshar-full',
                type: 'standard_text',
                instruction: '৬. যুক্তাক্ষরের সঠিক রূপ লেখো (৮ নম্বর):',
                items: [
                  { prefix: 'ক + ষ =', answer: 'ক্ষ', suffix: '  (উদাহরণ: ক্ষতি)' },
                  { prefix: 'ত + র =', answer: 'ত্র', suffix: '  (উদাহরণ: ত্রিভুজ)' },
                  { prefix: 'জ + ঞ =', answer: 'জ্ঞ', suffix: '  (উদাহরণ: জ্ঞান)' },
                  { prefix: 'দ + ধ =', answer: 'দ্ধ', suffix: '  (উদাহরণ: বুদ্ধি)' },
                  { prefix: 'ন + ব =', answer: 'ন্ব', suffix: '  (উদাহরণ: অন্বেষণ)' },
                  { prefix: 'ল + ক =', answer: 'ল্ক', suffix: '  (উদাহরণ: উল্কা)' },
                  { prefix: 'স + থ =', answer: 'স্থ', suffix: '  (উদাহরণ: স্থান)' },
                  { prefix: 'শ + চ =', answer: 'শ্চ', suffix: '  (উদাহরণ: শ্চী)' },
                ],
                marks: 8,
              },
              // প্রশ্ন-৭: বাক্য সংযোজন (৭ নম্বর)
              {
                id: 'sentence-making-full',
                type: 'short_question',
                question: '৭. নিচের শব্দগুলো দিয়ে বাক্য তৈরি করো (৭ নম্বর):\nক) স্বপ্ন\nখ) শান্তি\nগ) স্কুল\n(প্রতিটি বাক্যের পাশে স্থান রাখো)',
                marks: 7,
                answer_space_lines: 6,
              },
              // প্রশ্ন-৮: সৃজনশীল প্রশ্ন (১৫ নম্বর)
              {
                id: 'creative-1-full',
                type: 'short_question',
                question: '৮. সৃজনশীল প্রশ্ন (১৫ নম্বর):\n"আমার স্বপ্ন" শিরোনামে ১০টি বাক্যের একটি অনুচ্ছেদ লেখো।\n(উত্তরের জন্য নিচে সারিবদ্ধ স্থান রাখো)',
                marks: 15,
                answer_space_lines: 14,
              },
              // প্রশ্ন-৯: চিঠি লেখা (৭ নম্বর)
              {
                id: 'letter-full',
                type: 'short_question',
                question: '৯. বন্ধুকে উপহার পাঠানোর জন্য একটি চিঠি লেখো (৭ নম্বর)।\n(উত্তরের জন্য নিচে সারিবদ্ধ স্থান রাখো)',
                marks: 7,
                answer_space_lines: 8,
              },
            ],
          },
          {
            id: 'class-3-bangla-2nd-term-full',
            name: '২য় সাময়িক পরীক্ষা (১ম পত্র)',
            nameEn: '2nd Term Exam (Full Paper)',
            total_marks: 100,
            time_minutes: 120,
            instructions: 'প্রতিটি প্রশ্নের উত্তর দাও। সৃজনশীল প্রশ্নের উত্তরের জন্য যথেষ্ট স্থান রাখো।',
            questions: [
              // প্রশ্ন-১: দেখা অনুচ্ছেদ
              {
                id: 'seen-passage-term2',
                type: 'parent_passage',
                instruction: '১. নিচের অনুচ্ছেদটি পড়ে প্রশ্নগুলোর উত্তর দাও:',
                passage: 'বাংলাদেশ আমার দেশ। এটি দক্ষিণ এশিয়ার একটি স্বাধীন রাষ্ট্র। আমাদের দেশে ছয়টি ঋতু। গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত ও বসন্ত। প্রতিটি ঋতুর নিজস্ব সৌন্দর্য আছে। বাংলাদেশের মানুষ শান্ত ও সরল। তারা একে অপরকে সম্মান করে। আমি আমার দেশকে ভালোবাসি।',
                sub_questions: [
                  { label: '(ক)', text: 'শব্দার্থ লেখো (৪ নম্বর): স্বাধীন, ঋতু, সৌন্দর্য, সম্মান', marks: 4 },
                  { label: '(খ)', text: 'বাংলাদেশে কতগুলো ঋতু আছে? (৩ নম্বর)', marks: 3 },
                  { label: '(গ)', text: 'বাংলাদেশের মানুষের প্রকৃতি কেমন? (৩ নম্বর)', marks: 3 },
                ],
                marks: 10,
              },
              // প্রশ্ন-২: এক কথায় প্রকাশ
              {
                id: 'one-word-term2',
                type: 'standard_text',
                instruction: '২. এক কথায় প্রকাশ করো (১০ নম্বর):',
                items: [
                  { prefix: 'স্বাধীন দেশ', answer: 'স্বাধীনতা', suffix: '' },
                  { prefix: 'শান্ত মানুষ', answer: 'শান্তিপ্রিয়', suffix: '' },
                  { prefix: 'পরস্পর মিলন', answer: 'পরিচয়', suffix: '' },
                  { prefix: 'মাতৃভাষা', answer: 'মাতৃভাষা', suffix: '' },
                  { prefix: 'মাতৃভূমি', answer: 'মাতৃভূমি', suffix: '' },
                  { prefix: 'প্রতিবেশী', answer: 'প্রতিবেশী', suffix: '' },
                  { prefix: 'বিদেশী ভাষা', answer: 'বিদেশী ভাষা', suffix: '' },
                  { prefix: 'বিদেশি বস্তু', answer: 'বিলাতি', suffix: '' },
                  { prefix: 'সহপাঠী', answer: 'সহপাঠী', suffix: '' },
                  { prefix: 'পিতৃ-পুরুষ', answer: 'পিতৃ-পুরুষ', suffix: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-৩: বিপরীত শব্দ
              {
                id: 'opposite-term2',
                type: 'standard_text',
                instruction: '৩. বিপরীত শব্দ লেখো (১০ নম্বর):',
                items: [
                  { prefix: 'স্বাধীন', answer: 'অস্বাধীন', suffix: '' },
                  { prefix: 'সুখ', answer: 'দুঃখ', suffix: '' },
                  { prefix: 'শান্ত', answer: 'অশান্ত', suffix: '' },
                  { prefix: 'ভালো', answer: 'খারাপ', suffix: '' },
                  { prefix: 'বড়', answer: 'ছোট', suffix: '' },
                  { prefix: 'গরিব', answer: 'ধনী', suffix: '' },
                  { prefix: 'আসা', answer: 'যাওয়া', suffix: '' },
                  { prefix: 'উপকার', answer: 'অপকার', suffix: '' },
                  { prefix: 'বন্ধু', answer: 'শত্রু', suffix: '' },
                  { prefix: 'প্রকৃত', answer: 'মিথ্যা', suffix: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-৪: বিরাম চিহ্ন
              {
                id: 'punctuation-term2',
                type: 'short_question',
                question: '৪. বিরাম চিহ্ন বসিয়ে নিচের অনুচ্ছেদটি পুনরায় লেখো (১০ নম্বর):\n"আমার স্কুলের নাম শিশু নিকেতন আমার প্রধান শিক্ষক রহিম সাহেব আমি স্কুলে যেতে ভালোবাসি"',
                marks: 10,
                answer_space_lines: 5,
              },
              // প্রশ্ন-৫: ফরম পূরণ
              {
                id: 'form-term2',
                type: 'standard_text',
                instruction: '৫. স্কুল ভর্তি ফরম পূরণ করো (১০ নম্বর):',
                items: [
                  { prefix: 'শিক্ষার্থীর নাম:', answer: '', suffix: '___________', clue: '' },
                  { prefix: 'পিতার নাম:', answer: '', suffix: '___________', clue: '' },
                  { prefix: 'মাতার নাম:', answer: '', suffix: '___________', clue: '' },
                  { prefix: 'জন্ম তারিখ:', answer: '', suffix: '___/___/______', clue: '' },
                  { prefix: 'শ্রেণি:', answer: '', suffix: '___________', clue: '' },
                  { prefix: 'শেষ শিক্ষাগত যোগ্যতা:', answer: '', suffix: '___________', clue: '' },
                  { prefix: 'ঠিকানা:', answer: '', suffix: '___________', clue: '' },
                  { prefix: 'পিতার পেশা:', answer: '', suffix: '___________', clue: '' },
                ],
                marks: 8,
              },
              // প্রশ্ন-৬: যুক্তাক্ষর
              {
                id: 'juktakshar-term2',
                type: 'standard_text',
                instruction: '৬. যুক্তাক্ষর গঠন করো (৮ নম্বর):',
                items: [
                  { prefix: 'ন + দ =', answer: 'ন্দ', suffix: '' },
                  { prefix: 'ল + খ =', answer: 'ল্খ', suffix: '' },
                  { prefix: 'শ + ন =', answer: 'শ্ন', suffix: '' },
                  { prefix: 'ক + ষ =', answer: 'ক্ষ', suffix: '' },
                  { prefix: 'স + ক =', answer: 'স্ক', suffix: '' },
                  { prefix: 'ত + ত =', answer: 'ত্ত', suffix: '' },
                  { prefix: 'র + প =', answer: 'র্প', suffix: '' },
                  { prefix: 'দ + ব =', answer: 'দ্ব', suffix: '' },
                ],
                marks: 8,
              },
              // প্রশ্ন-৭: সৃজনশীল
              {
                id: 'creative-term2',
                type: 'short_question',
                question: '৭. সৃজনশীল প্রশ্ন (১৫ নম্বর):\n"আমার প্রিয় ঋতু" শিরোনামে ১০-১২টি বাক্যের অনুচ্ছেদ লেখো।',
                marks: 15,
                answer_space_lines: 12,
              },
              // প্রশ্ন-৮: চিঠি লেখা
              {
                id: 'letter-term2',
                type: 'short_question',
                question: '৮. অসুস্থ মায়ের জন্য ছুটির আবেদন করে প্রধান শিক্ষক বরাবর একটি চিঠি লেখো (১০ নম্বর)।',
                marks: 10,
                answer_space_lines: 10,
              },
              // প্রশ্ন-৯: বাক্য সংযোজন
              {
                id: 'sentence-term2',
                type: 'short_question',
                question: '৯. নিচের শব্দ দিয়ে বাক্য তৈরি করো (৯ নম্বর):\nক) বাংলাদেশ\nখ) স্বাধীন\nগ) ঋতু',
                marks: 9,
                answer_space_lines: 6,
              },
            ],
          },
        ],
      },
      english: {
        name: 'English',
        nameEn: 'English (২য় পত্র)',
        icon: '🅰️',
        papers: [
          {
            id: 'class-3-english-full',
            name: 'Annual Exam (Full Paper)',
            nameEn: 'Annual Exam (Full Paper)',
            total_marks: 100,
            time_minutes: 90,
            instructions: 'Answer all questions. Write neatly.',
            questions: [
              {
                id: 'en-seen-full',
                type: 'parent_passage',
                instruction: '1. Read the passage and answer the questions:',
                passage: 'This is Bangladesh. It is a beautiful country. It has six seasons. The people of Bangladesh are friendly. They love their country. Bangladesh has many rivers. The Padma is the main river.',
                sub_questions: [
                  { label: '(a)', text: 'What is Bangladesh?', marks: 3 },
                  { label: '(b)', text: 'How many seasons does Bangladesh have?', marks: 3 },
                  { label: '(c)', text: 'What are the people like?', marks: 3 },
                  { label: '(d)', text: 'What is the main river?', marks: 3 },
                ],
                marks: 12,
              },
              {
                id: 'en-mcq-full',
                type: 'MCQ',
                question: '2. Fill in the blanks with the correct answer:',
                option_a: 'is',
                option_b: 'am',
                option_c: 'are',
                option_d: 'was',
                marks: 5,
              },
              {
                id: 'en-true-false',
                type: 'true_false',
                question: '3. Read the statements and write True or False:',
                marks: 8,
              },
              {
                id: 'en-match-full',
                type: 'column_matching',
                instruction: '4. Match the words with their meanings:',
                pairs: [
                  { column_a: 'Beautiful', column_b: 'Pretty' },
                  { column_a: 'Friendly', column_b: 'Kind' },
                  { column_a: 'Main', column_b: 'Chief' },
                  { column_a: 'Love', column_b: 'Like' },
                  { column_a: 'Country', column_b: 'Nation' },
                ],
                marks: 10,
              },
              {
                id: 'en-creative-1',
                type: 'short_question',
                question: '5. Write 5 sentences about "My Country".',
                marks: 15,
                answer_space_lines: 8,
              },
              {
                id: 'en-creative-2',
                type: 'short_question',
                question: '6. Write 5 sentences about "My Family".',
                marks: 15,
                answer_space_lines: 8,
              },
              {
                id: 'en-creative-3',
                type: 'short_question',
                question: '7. Write a letter to your friend about your school.',
                marks: 20,
                answer_space_lines: 15,
              },
              {
                id: 'en-word-meaning',
                type: 'standard_text',
                instruction: '8. Write the meaning of the following words:',
                items: [
                  { prefix: 'Beautiful:', answer: '', suffix: '_________' },
                  { prefix: 'Friendly:', answer: '', suffix: '_________' },
                  { prefix: 'Country:', answer: '', suffix: '_________' },
                  { prefix: 'Season:', answer: '', suffix: '_________' },
                  { prefix: 'River:', answer: '', suffix: '_________' },
                ],
                marks: 5,
              },
            ],
          },
        ],
      },
      math: {
        name: 'Math',
        nameEn: 'গণিত',
        icon: '🔢',
        papers: [
          {
            id: 'class-3-math-full',
            name: 'বার্ষিক পরীক্ষা (পূর্ণাঙ্ক)',
            nameEn: 'Annual Exam (Full Paper)',
            total_marks: 100,
            time_minutes: 120,
            instructions: 'সকল প্রশ্নের উত্তর দাও। অংকের সব হিসাব সাবধানে করো।',
            questions: [
              // যোগ করো
              {
                id: 'math-add-full',
                type: 'CQ',
                description: '১. যোগ করো:',
                sub_questions: [
                  { label: '(ক)', text: '৩৪৫ + ২৩৪ = _______', marks: 2 },
                  { label: '(খ)', text: '৪৫৬ + ৩৮৯ = _______', marks: 2 },
                  { label: '(গ)', text: '৬৭৮ + ৪৫৬ = _______', marks: 2 },
                  { label: '(ঘ)', text: '৮৯০ + ১২৩ = _______', marks: 2 },
                  { label: '(ঙ)', text: '৫৬৭ + ৪৩৩ = _______', marks: 2 },
                ],
                marks: 10,
              },
              // বিয়োগ করো
              {
                id: 'math-sub-full',
                type: 'CQ',
                description: '২. বিয়োগ করো:',
                sub_questions: [
                  { label: '(ক)', text: '৫০০ - ২৪৫ = _______', marks: 2 },
                  { label: '(খ)', text: '৭০০ - ৩৫৬ = _______', marks: 2 },
                  { label: '(গ)', text: '৯০০ - ৪৭৮ = _______', marks: 2 },
                  { label: '(ঘ)', text: '৬৫০ - ৩২৯ = _______', marks: 2 },
                  { label: '(ঙ)', text: '৮৮৮ - ৪৪৪ = _______', marks: 2 },
                ],
                marks: 10,
              },
              // গুণ করো
              {
                id: 'math-mult-full',
                type: 'CQ',
                description: '৩. গুণ করো:',
                sub_questions: [
                  { label: '(ক)', text: '১২ × ৫ = _______', marks: 2 },
                  { label: '(খ)', text: '২৫ × ৪ = _______', marks: 2 },
                  { label: '(গ)', text: '৩৪ × ৩ = _______', marks: 2 },
                  { label: '(ঘ)', text: '৪৮ × ২ = _______', marks: 2 },
                  { label: '(ঙ)', text: '৬৭ × ১ = _______', marks: 2 },
                ],
                marks: 10,
              },
              // ভাগ করো
              {
                id: 'math-div-full',
                type: 'CQ',
                description: '৪. ভাগ করো:',
                sub_questions: [
                  { label: '(ক)', text: '৪৮ ÷ ৪ = _______', marks: 2 },
                  { label: '(খ)', text: '৬০ ÷ ৫ = _______', marks: 2 },
                  { label: '(গ)', text: '৮৪ ÷ ৭ = _______', marks: 2 },
                  { label: '(ঘ)', text: '৯৬ ÷ ৬ = _______', marks: 2 },
                  { label: '(ঙ)', text: '১০৮ ÷ ৯ = _______', marks: 2 },
                ],
                marks: 10,
              },
              // শব্দ সমস্যা
              {
                id: 'math-word-full',
                type: 'CQ',
                description: '৫. শব্দের সমস্যাগুলো সমাধান করো:',
                sub_questions: [
                  { label: '(ক)', text: 'একটি বাক্সে ২৪টি আম আছে। ৫টি বাক্সে মোট কতটি আম থাকবে?', marks: 4 },
                  { label: '(খ)', text: 'রহিমের কাছে ৮০টি টাকা ছিল। সে ৪৫টি টাকা খরচ করল। এখন তার কাছে কত টাকা আছে?', marks: 4 },
                  { label: '(গ)', text: 'একটি ক্লাসে ৪৮ জন ছাত্র আছে। এমন ৩টি ক্লাসে মোট কতজন ছাত্র আছে?', marks: 4 },
                  { label: '(ঘ)', text: '৯৬টি কলম ৮ জন ছাত্রের মধ্যে সমানভাবে ভাগ করলে প্রত্যেকে কতটি পাবে?', marks: 4 },
                  { label: '(ঙ)', text: 'একটি দোকানে ১৫০টি খাতা ছিল। ৮৫টি বিক্রি হলো। এখন কতটি খাতা বাকি আছে?', marks: 4 },
                ],
                marks: 20,
              },
              // সংখ্যার ধাঁধা
              {
                id: 'math-puzzle-full',
                type: 'standard_text',
                instruction: '৬. সংখ্যার ধাঁধা সমাধান করো (১০ নম্বর):',
                items: [
                  { prefix: '___ + ২৫ = ৫০', answer: '২৫', suffix: '' },
                  { prefix: '___ - ১৫ = ৩৫', answer: '৫০', suffix: '' },
                  { prefix: '৪৮ + ___ = ৮০', answer: '৩২', suffix: '' },
                  { prefix: '___ × ৬ = ৩৬', answer: '৬', suffix: '' },
                  { prefix: '৬৩ ÷ ___ = ৯', answer: '৭', suffix: '' },
                  { prefix: '___ + ৪৫ = ৯০', answer: '৪৫', suffix: '' },
                  { prefix: '১০০ - ___ = ৬৫', answer: '৩৫', suffix: '' },
                  { prefix: '___ × ৮ = ৬৪', answer: '৮', suffix: '' },
                  { prefix: '৫৪ ÷ ___ = ৬', answer: '৯', suffix: '' },
                  { prefix: '___ + ৩৮ = ৭৬', answer: '৩৮', suffix: '' },
                ],
                marks: 10,
              },
              // চিহ্ন বসাও
              {
                id: 'math-compare-full',
                type: 'standard_text',
                instruction: '৭. সঠিক চিহ্ন (<, >, =) বসাও (৫ নম্বর):',
                items: [
                  { prefix: '৪৫ ___ ৫৪', answer: '<', suffix: '' },
                  { prefix: '৬৭ ___ ৬৭', answer: '=', suffix: '' },
                  { prefix: '৮৯ ___ ৭৮', answer: '>', suffix: '' },
                  { prefix: '২৩ ___ ৩২', answer: '<', suffix: '' },
                  { prefix: '৯৫ ___ ৫৯', answer: '>', suffix: '' },
                ],
                marks: 5,
              },
              // গুণের সারণি
              {
                id: 'math-table-full',
                type: 'table',
                question: '৮. গুণের সারণি পূরণ করো (১০ নম্বর):',
                rows: [
                  ['×', '২', '৩', '৪', '৫'],
                  ['৫', '১০', '', '', ''],
                  ['৬', '', '১৮', '', ''],
                  ['৭', '', '', '২৮', ''],
                  ['৮', '', '', '', '৪০'],
                  ['৯', '', '', '', ''],
                ],
                marks: 10,
              },
              // চিত্র সমস্যা
              {
                id: 'math-picture-full',
                type: 'short_question',
                question: '৯. ছবি দেখে যোগ করো (৫ নম্বর):\n(উত্তরের জন্য স্থান রাখো)',
                marks: 5,
                answer_space_lines: 3,
              },
            ],
          },
        ],
      },
    },
  },
  'class-4': {
    name: 'Class 4',
    icon: '📖',
    subjects: {
      bangla: {
        name: 'Bangla',
        nameEn: 'বাংলা (১ম পত্র)',
        icon: '📚',
        papers: [
          {
            id: 'class-4-bangla-annual-full',
            name: 'বার্ষিক পরীক্ষা (১ম পত্র)',
            nameEn: 'Annual Exam (Full Paper)',
            total_marks: 100,
            time_minutes: 150,
            instructions: 'সকল প্রশ্নের উত্তর দাও। সৃজনশীল প্রশ্নের উত্তরের জন্য যথেষ্ট স্থান রাখো। সব লেখা বাংলায় হবে।',
            questions: [
              {
                id: 'c4-seen-full',
                type: 'parent_passage',
                instruction: '১. নিচের অনুচ্ছেদটি পড়ে প্রশ্নগুলোর উত্তর দাও:',
                passage: 'বাংলাদেশ আমার জন্মভূমি। একে আমি সোনার বাংলা বলি। আমার দেশে ছয়টি ঋতু - গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত ও বসন্ত। প্রতিটি ঋতুর নিজস্ব সৌন্দর্য আছে। বসন্তকালে ফুল ফোটে, বর্ষায় বৃষ্টি হয়। শরৎকালে আকাশ নীল থাকে, মেঘ ভাসে। শীতে শীত পড়ে, গ্রীষ্মে রোদ ঝলমলে। আমি আমার দেশকে ভালোবাসি।',
                sub_questions: [
                  { label: '(ক)', text: 'শব্দার্থ লেখো (৫ নম্বর): জন্মভূমি, সৌন্দর্য, বৃষ্টি, মেঘ, ঝলমলে', marks: 5 },
                  { label: '(খ)', text: 'বাংলাদেশকে কী বলা হয়? (২ নম্বর)', marks: 2 },
                  { label: '(গ)', text: 'বাংলাদেশে কতটি ঋতু আছে? (৩ নম্বর)', marks: 3 },
                  { label: '(ঘ)', text: 'বসন্তকালে কী হয়? (৩ নম্বর)', marks: 3 },
                  { label: '(ঙ)', text: 'শরৎকালের বর্ণনা দাও (৭ নম্বর)', marks: 7 },
                ],
                marks: 20,
              },
              {
                id: 'c4-oneword-full',
                type: 'standard_text',
                instruction: '২. এক কথায় প্রকাশ করো (১০ নম্বর):',
                items: [
                  { prefix: 'যে দেশ জন্ম দেয়', answer: 'জন্মভূমি', suffix: '' },
                  { prefix: 'ছয় ঋতুর দেশ', answer: 'ষটঋতুর দেশ', suffix: '' },
                  { prefix: 'নীল আকাশ', answer: 'নীলাকাশ', suffix: '' },
                  { prefix: 'রোদের ঔজ্জ্বল্য', answer: 'রৌজ্জ', suffix: '' },
                  { prefix: 'ফুলের বাগান', answer: 'উদ্যান', suffix: '' },
                  { prefix: 'বিকেল বেলা', answer: 'গোধূলি', suffix: '' },
                  { prefix: 'কুয়াশার সময়', answer: 'ক্রান্তিকাল', suffix: '' },
                  { prefix: 'প্রভাতকালীন আলো', answer: 'ঊষা', suffix: '' },
                  { prefix: 'সকালের শিশির', answer: 'শিশির', suffix: '' },
                  { prefix: 'দিনের শেষে', answer: 'সন্ধ্যা', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'c4-opposite-full',
                type: 'standard_text',
                instruction: '৩. বিপরীত শব্দ লেখো (১০ নম্বর):',
                items: [
                  { prefix: 'সোনার', answer: 'সাধারণ', suffix: '' },
                  { prefix: 'শীত', answer: 'গ্রীষ্ম', suffix: '' },
                  { prefix: 'রাত', answer: 'দিন', suffix: '' },
                  { prefix: 'আসা', answer: 'যাওয়া', suffix: '' },
                  { prefix: 'ভালো', answer: 'মন্দ', suffix: '' },
                  { prefix: 'বড়', answer: 'ছোট', suffix: '' },
                  { prefix: 'নীল', answer: 'লাল', suffix: '' },
                  { prefix: 'শুকনো', answer: 'ভেজা', suffix: '' },
                  { prefix: 'উন্নতি', answer: 'অবনতি', suffix: '' },
                  { prefix: 'উজ্জ্বল', answer: 'অন্ধকার', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'c4-punctuation-full',
                type: 'short_question',
                question: '৪. বিরাম চিহ্ন বসিয়ে অনুচ্ছেদটি পুনরায় লেখো (১০ নম্বর):\n"আমার নাম করিম আমি ক্লাস ফোরে পড়ি আমার স্কুলের নাম শিশু নিকেতন আমি স্কুলে যেতে পছন্দ করি"',
                marks: 10,
                answer_space_lines: 5,
              },
              {
                id: 'c4-creative-1-full',
                type: 'short_question',
                question: '৫. সৃজনশীল প্রশ্ন (২০ নম্বর):\n"আমার প্রিয় ঋতু" শিরোনামে ১৫-২০ বাক্যের একটি অনুচ্ছেদ লেখো।',
                marks: 20,
                answer_space_lines: 16,
              },
              {
                id: 'c4-letter-full',
                type: 'short_question',
                question: '৬. অসুস্থ পিতার জন্য ছুটির আবেদন করে প্রধান শিক্ষক বরাবর একটি আবেদনপত্র লেখো (১৫ নম্বর)।',
                marks: 15,
                answer_space_lines: 12,
              },
              {
                id: 'c4-juktakshar-full',
                type: 'standard_text',
                instruction: '৭. যুক্তাক্ষরের সঠিক রূপ লেখো (১৫ নম্বর):',
                items: [
                  { prefix: 'ক + ষ =', answer: 'ক্ষ', suffix: '' },
                  { prefix: 'ত + র =', answer: 'ত্র', suffix: '' },
                  { prefix: 'জ + ঞ =', answer: 'জ্ঞ', suffix: '' },
                  { prefix: 'দ + ধ =', answer: 'দ্ধ', suffix: '' },
                  { prefix: 'ন + ধ =', answer: 'ন্ধ', suffix: '' },
                  { prefix: 'ল + খ =', answer: 'ল্খ', suffix: '' },
                  { prefix: 'স + ত =', answer: 'স্ত', suffix: '' },
                  { prefix: 'শ + চ =', answer: 'শ্চ', suffix: '' },
                  { prefix: 'ব + দ =', answer: 'ব্দ', suffix: '' },
                  { prefix: 'ন + ন =', answer: 'ন্ন', suffix: '' },
                ],
                marks: 10,
              },
            ],
          },
        ],
      },
    },
  },
  'class-5': {
    name: 'Class 5',
    icon: '🎓',
    subjects: {
      bangla: {
        name: 'Bangla',
        nameEn: 'বাংলা (১ম পত্র)',
        icon: '📕',
        papers: [
          {
            id: 'class-5-bangla-pec-full',
            name: 'PEC মডেল টেস্ট (১ম পত্র)',
            nameEn: 'PEC Model Test (Full Paper)',
            total_marks: 100,
            time_minutes: 180,
            instructions: 'PEC পরীক্ষার প্রস্তুতির জন্য সময়মতো উত্তর দাও। প্রতিটি প্রশ্নের উত্তর দাও।',
            questions: [
              {
                id: 'c5-seen-pec',
                type: 'parent_passage',
                instruction: '১. নিচের অনুচ্ছেদটি পড়ে প্রশ্নগুলোর উত্তর দাও:',
                passage: 'আমার গ্রামের নাম সুন্দরপুর। গ্রামের মাঝখানে একটি বড় পুকুর আছে। পুকুরের ধারে বড় বড় বটগাছ। গ্রামের একদিকে সবুজ ক্ষেত, অন্যদিকে লাল মাটির রাস্তা। প্রতিদিন সকালে কৃষকরা ক্ষেতে যায়। বিকেলে ছেলেরা খেলাধুলা করে। গ্রামের মানুষ সবাই মিলেমিশে থাকে।',
                sub_questions: [
                  { label: '(ক)', text: 'মূল ভাব লেখো (৫ নম্বর)', marks: 5 },
                  { label: '(খ)', text: 'শব্দার্থ লেখো (৫ নম্বর): গ্রাম, পুকুর, বটগাছ, ক্ষেত, কৃষক', marks: 5 },
                  { label: '(গ)', text: 'লেখকের গ্রামের নাম কী? (২ নম্বর)', marks: 2 },
                  { label: '(ঘ)', text: 'পুকুরের ধারে কী আছে? (৩ নম্বর)', marks: 3 },
                  { label: '(ঙ)', text: 'কৃষকরা প্রতিদিন কী করে? (৩ নম্বর)', marks: 3 },
                  { label: '(চ)', text: 'গ্রামের মানুষ কীভাবে থাকে? (২ নম্বর)', marks: 2 },
                ],
                marks: 20,
              },
              {
                id: 'c5-creative-pec',
                type: 'short_question',
                question: '২. সৃজনশীল প্রশ্ন (২৫ নম্বর):\n"আমার গ্রাম" শিরোনামে ২০-২৫ বাক্যের একটি সহযোগে অনুচ্ছেদ লেখো।',
                marks: 25,
                answer_space_lines: 20,
              },
              {
                id: 'c5-oneword-pec',
                type: 'standard_text',
                instruction: '৩. এক কথায় প্রকাশ করো (১০ নম্বর):',
                items: [
                  { prefix: 'গ্রামের মাঝে', answer: 'মধ্যখান', suffix: '' },
                  { prefix: 'বড় বটগাছ', answer: 'বটবৃক্ষ', suffix: '' },
                  { prefix: 'সবুজ ক্ষেত', answer: 'সবুজ শস্য', suffix: '' },
                  { prefix: 'লাল মাটি', answer: 'লাল মৃত্তিকা', suffix: '' },
                  { prefix: 'মিলেমিশে', answer: 'সমবয়', suffix: '' },
                  { prefix: 'খেলাধুলা', answer: 'ক্রীড়া-বিনোদন', suffix: '' },
                  { prefix: 'বন্ধুত্বের বন্ধন', answer: 'বন্ধুত্ব', suffix: '' },
                  { prefix: 'স্বপ্ন দেখা', answer: 'স্বপ্নদর্শন', suffix: '' },
                  { prefix: 'মিথ্যা বলা', answer: 'মিথ্যাচার', suffix: '' },
                  { prefix: 'মানুষ গড়া', answer: 'মানবসমাজ', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'c5-punctuation-pec',
                type: 'short_question',
                question: '৪. বিরাম চিহ্ন বসিয়ে অনুচ্ছেদটি পুনরায় লেখো (১০ নম্বর):\n"আমার গ্রাম সুন্দরপুর এখানে একটি পুকুর আছে প্রতিদিন লোকেরা সেখানে যায় বটগাছের নিচে বসে গল্প শোনে"',
                marks: 10,
                answer_space_lines: 5,
              },
              {
                id: 'c5-letter-pec',
                type: 'short_question',
                question: '৫. গ্রামের একটি উৎসব উপলক্ষে বন্ধুকে আমন্ত্রণা জানিয়ে চিঠি লেখো (১৫ নম্বর)।',
                marks: 15,
                answer_space_lines: 12,
              },
              {
                id: 'c5-grammar-pec',
                type: 'standard_text',
                instruction: '৬. কাল পরিবর্তন করো (২০ নম্বর):',
                items: [
                  { prefix: 'আমি যাই (বর্তমান)', answer: 'আমি গেলাম', suffix: '(অতীত)' },
                  { prefix: 'তুমি খেলছ (বর্তমান)', answer: 'তুমি খেললে', suffix: '(অতীত)' },
                  { prefix: 'সে আসে (বর্তমান)', answer: 'সে এল', suffix: '(অতীত)' },
                  { prefix: 'আমরা পড়ি (বর্তমান)', answer: 'আমরা পড়লাম', suffix: '(অতীত)' },
                  { prefix: 'সে বলে (অতীত)', answer: 'সে বলবে', suffix: '(ভবিষ্যৎ)' },
                  { prefix: 'আমি খাই (বর্তমান)', answer: 'আমি খাব', suffix: '(ভবিষ্যৎ)' },
                  { prefix: 'তুমি যাবে (ভবিষ্যৎ)', answer: 'তুমি গেলে', suffix: '(অতীত)' },
                  { prefix: 'রহিম আসবে (ভবিষ্যৎ)', answer: 'রহিম এসেছিল', suffix: '(অতীত)' },
                  { prefix: 'আমরা দৌড়াই (বর্তমান)', answer: 'আমরা দৌড়ালাম', suffix: '(অতীত)' },
                  { prefix: 'ওরা লুকো (বর্তমান)', answer: 'ওরা লুকাল', suffix: '(অতীত)' },
                ],
                marks: 20,
              },
            ],
          },
        ],
      },
    },
  },
  'class-1': {
    name: 'Class 1',
    icon: '📘',
    subjects: {
      bangla: {
        name: 'Bangla',
        nameEn: 'Bengali (১ম পত্র)',
        icon: '📖',
        papers: [
          {
            id: 'class-1-bangla-royal-full',
            name: 'বার্ষিক পরীক্ষা - ২০২৬',
            nameEn: 'Annual Exam - 2026',
            total_marks: 100,
            time_minutes: 120,
            instructions: 'প্রতিটি প্রশ্নের উত্তর দাও।',
            questions: [
              {
                id: 'class1-bangla-vowel',
                type: 'standard_text',
                instruction: '১. স্বরবর্ণগুলো লেখো (১০ নম্বর):',
                items: [
                  { prefix: 'অ, আ, কি করে?', answer: 'ই', suffix: '' },
                  { prefix: 'ই, ঈ, কি করে?', answer: 'উ', suffix: '' },
                  { prefix: 'উ, ঊ, কি করে?', answer: 'ঋ', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'class1-bangla-consonant',
                type: 'standard_text',
                instruction: '২. ব্যঞ্জনবর্ণগুলো লেখো (১০ নম্বর):',
                items: [
                  { prefix: 'ক, খ, কি করে?', answer: 'গ', suffix: '' },
                  { prefix: 'গ, ঘ, কি করে?', answer: 'চ', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'class1-bangla-matching',
                type: 'column_matching',
                instruction: '৩. ছবি ও বর্ণ মেলাও (৫ × ২ = ১০)',
                pairs: [
                  { column_a: '🍎 (আপেল)', column_b: 'আ' },
                  { column_a: '🏠 (ঘর)', column_b: 'ঘ' },
                  { column_a: '🐱 (বিড়াল)', column_b: 'ব' },
                  { column_a: '🌳 (গাছ)', column_b: 'গ' },
                  { column_a: '☀️ (সূর্য)', column_b: 'স' },
                ],
                marks: 10,
              },
              {
                id: 'class1-bangla-numbers',
                type: 'standard_text',
                instruction: '৪. সংখ্যা গণনা করো (৫ × ২ = ১০)',
                items: [
                  { prefix: '১ + ১ = ', answer: '২', suffix: '' },
                  { prefix: '২ + ১ = ', answer: '৩', suffix: '' },
                  { prefix: '২ + ২ = ', answer: '৪', suffix: '' },
                ],
                marks: 10,
              },
            ],
          },
        ],
      },
      mathematics: {
        name: 'Mathematics',
        nameEn: 'Primary Mathematics',
        icon: '🔢',
        papers: [
          {
            id: 'class-1-math-royal-full',
            name: 'বার্ষিক পরীক্ষা - ২০২৬',
            nameEn: 'Annual Exam - 2026',
            total_marks: 100,
            time_minutes: 120,
            instructions: 'সব প্রশ্নের উত্তর দাও।',
            questions: [
              {
                id: 'class1-math-count',
                type: 'visual_grid',
                instruction: '১. ছবি গণনা করো (৫ × ২ = ১০)',
                left_asset: 'apple',
                left_count: 5,
                right_asset: 'apple',
                right_count: 5,
                operator: '?',
                marks: 10,
              },
              {
                id: 'class1-math-add',
                type: 'standard_text',
                instruction: '২. যোগ করো (৫ × ২ = ১০)',
                items: [
                  { prefix: '১ + ১ = ', answer: '২', suffix: '' },
                  { prefix: '২ + ১ = ', answer: '৩', suffix: '' },
                  { prefix: '১ + ৩ = ', answer: '৪', suffix: '' },
                  { prefix: '২ + ২ = ', answer: '৪', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'class1-math-shape',
                type: 'visual_grid',
                instruction: '৩. আকৃতি স্বন্তকরণ করো (২ × ১০ = ২০)',
                left_asset: 'circle',
                left_count: 3,
                right_asset: 'square',
                right_count: 2,
                operator: '>',
                marks: 20,
              },
            ],
          },
        ],
      },
      general: {
        name: 'General',
        nameEn: 'General Knowledge',
        icon: '⭐',
        papers: [
          {
            id: 'class-1-general-royal-full',
            name: 'বার্ষিক পরীক্ষা - ২০২৬',
            nameEn: 'Annual Exam - 2026',
            total_marks: 100,
            time_minutes: 60,
            instructions: 'প্রতিটি প্রশ্নের উত্তর দাও।',
            questions: [
              {
                id: 'class1-gen-color',
                type: 'standard_text',
                instruction: '১. রঙ চিনো (১০ নম্বর):',
                items: [
                  { prefix: '(ক) 🔴', answer: 'লাল', suffix: '' },
                  { prefix: '(খ) 🔵', answer: 'নীল', suffix: '' },
                  { prefix: '(গ) 🟢', answer: 'সবুজ', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'class1-gen-shape',
                type: 'standard_text',
                instruction: '২. আকৃতি চিনো (৫ নম্বর):',
                items: [
                  { prefix: '⚪ =', answer: 'বৃত্ত', suffix: '' },
                  { prefix: '🔺 =', answer: 'ত্রিভুজ', suffix: '' },
                ],
                marks: 5,
              },
            ],
          },
        ],
      },
    },
  },
  'class-2': {
    name: 'Class 2',
    icon: '📗',
    subjects: {
      english: {
        name: 'English',
        nameEn: 'English (Worksheet Mode)',
        icon: '🇬🇧',
        papers: [
          {
            id: 'class-2-english-royal-full',
            name: 'বার্ষিক পরীক্ষা - ২০২৬',
            nameEn: 'Annual Exam - 2026',
            total_marks: 50,
            time_minutes: 90,
            instructions: 'Read all questions carefully and answer them.',
            questions: [
              {
                id: 'class2-eng-match-columns',
                type: 'column_matching',
                instruction: '1. Match the words of Column A with their meanings in Column B: (5 × 2 = 10)',
                pairs: [
                  { column_a: '(a) Farmer', column_b: '(iii) A person who grows crops and food.' },
                  { column_a: '(b) Tailor', column_b: '(i) A person who makes clothes.' },
                  { column_a: '(c) Doctor', column_b: '(v) A person who helps sick people to get well.' },
                  { column_a: '(d) Holiday', column_b: '(ii) A period of rest from school or work.' },
                  { column_a: '(e) River', column_b: '(iv) A large stream of water that flows into the sea.' },
                ],
                marks: 10,
              },
              {
                id: 'class2-eng-wh-questions',
                type: 'standard_text',
                instruction: '2. Make Wh-Questions with the underlined words: (5 × 2 = 10)',
                items: [
                  { prefix: '(a) Anita Sarkar <u>get ups</u> early in the morning. ', answer: 'When', suffix: ' does she get up?', clue: '' },
                  { prefix: '(b) Kanak is <u>a student of class 2</u>. ', answer: 'What', suffix: ' is Kanak?', clue: '' },
                  { prefix: '(c) The crow <u>lives in a tree</u>. ', answer: 'Where', suffix: ' does the crow live?', clue: '' },
                ],
                marks: 10,
              },
              {
                id: 'class2-eng-rearrange',
                type: 'standard_text',
                instruction: '3. Rearrange the words to make correct sentences: (5 × 2 = 10)',
                items: [
                  { prefix: '(a) what / is / your / name / ?', answer: 'What is your name?', suffix: '', clue: '' },
                  { prefix: '(b) country / beautiful / is / a / .', answer: 'A country beautiful is.', suffix: '', clue: '' },
                ],
                marks: 10,
              },
              {
                id: 'class2-eng-passage',
                type: 'parent_passage',
                instruction: '4. Read the passage and answer the questions: (4 × 5 = 20)',
                passage: 'Rumi is seven years old. He is in class 2. He lives with his parents in Dhaka. He has a pet cat named Tom. Tom likes to drink milk.',
                sub_questions: [
                  { label: '(a)', text: 'How old is Rumi?', marks: 5 },
                  { label: '(b)', text: 'What is the name of Rumi\'s pet cat?', marks: 5 },
                  { label: '(c)', text: 'Where does Rumi live?', marks: 5 },
                  { label: '(d)', text: 'What does Tom like to drink?', marks: 5 },
                ],
                marks: 20,
              },
            ],
          },
        ],
      },
      mathematics: {
        name: 'Mathematics',
        nameEn: 'Primary Mathematics',
        icon: '🔢',
        papers: [
          {
            id: 'class-2-math-royal-full',
            name: 'বার্ষিক পরীক্ষা - ২০২৬',
            nameEn: 'Annual Exam - 2026',
            total_marks: 50,
            time_minutes: 90,
            instructions: 'All questions must be answered. Show your working clearly.',
            questions: [
              {
                id: 'class2-math-compare',
                type: 'standard_text',
                instruction: '5. Fill in the blanks with correct symbol (>, <, =): (5 × 2 = 10)',
                items: [
                  { prefix: '47 ____ 54', answer: '<', suffix: '' },
                  { prefix: '83 ____ 83', answer: '=', suffix: '' },
                  { prefix: '35 + 10 ____ 45', answer: '=', suffix: '' },
                  { prefix: '9 × 3 = ____', answer: '27', suffix: '' },
                  { prefix: '7 × 4 = ____', answer: '28', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'class2-math-add-subtract',
                type: 'standard_text',
                instruction: '6. Solve the following problems: (4 × 5 = 20)',
                items: [
                  { prefix: '54 + 28 = ', answer: '82', suffix: '' },
                  { prefix: '67 - 25 = ', answer: '42', suffix: '' },
                  { prefix: '36 + 47 = ', answer: '83', suffix: '' },
                  { prefix: '89 - 34 = ', answer: '55', suffix: '' },
                ],
                marks: 20,
              },
              {
                id: 'class2-math-place-value',
                type: 'standard_text',
                instruction: '7. Write the correct number in the box: (10 × 1 = 10)',
                items: [
                  { prefix: 'Tens: 5, Ones: 4 = ', answer: '54', suffix: '' },
                  { prefix: 'Hundreds: 3, Tens: 6, Ones: 8 = ', answer: '368', suffix: '' },
                ],
                marks: 10,
              },
              {
                id: 'class2-math-shape-count',
                type: 'visual_grid',
                instruction: '8. Count and compare shapes: (2 × 10 = 20)',
                left_asset: 'apple',
                left_count: 5,
                right_asset: 'apple',
                right_count: 3,
                operator: '>',
                marks: 20,
              },
            ],
          },
        ],
      },
    },
  },
  'nursery': {
    name: 'Nursery',
    icon: '🧸',
    subjects: {
      bangla: {
        name: 'Bangla',
        nameEn: 'বাংলা (সাধারণ ও বর্ণ লিখন)',
        icon: '📖',
        papers: [
          {
            id: 'nursery-bangla-2nd-term',
            name: 'দ্বিতীয় সাময়িক পরীক্ষা - ২০২৬',
            nameEn: '2nd Term Exam - 2026',
            total_marks: 50,
            time_minutes: 120,
            instructions: 'প্রতিটি প্রশ্নের উত্তর দাও।',
            questions: [
              // প্রশ্ন-১: স্বরবর্ণগুলো ক্রমানুসারে ফাঁকা ঘরে লেখো
              {
                id: 'nursery-swarbarna-1',
                type: 'standard_text',
                instruction: '১. স্বরবর্ণগুলো ক্রমানুসারে ফাঁকা ঘরে লেখো: (১০ × ১ = ১০)',
                items: [
                  { prefix: 'অ', answer: 'আ', suffix: '', clue: '' },
                  { prefix: 'ই', answer: 'ঈ', suffix: '', clue: '' },
                  { prefix: 'উ', answer: 'ঊ', suffix: '', clue: '' },
                  { prefix: 'ঋ', answer: 'এ', suffix: '', clue: '' },
                  { prefix: 'এ', answer: 'ঐ', suffix: '', clue: '' },
                  { prefix: 'ও', answer: 'ঔ', suffix: '', clue: '' },
                  { prefix: 'ঋ', answer: 'ঔ', suffix: '', clue: '' },
                  { prefix: 'ঐ', answer: 'ও', suffix: '', clue: '' },
                  { prefix: 'ঔ', answer: 'অ', suffix: '', clue: '' },
                  { prefix: 'ঊ', answer: 'উ', suffix: '', clue: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-২: আগের ও পরের বর্ণ বসিয়ে খালি ঘর পূরণ করো
              {
                id: 'nursery-before-after-1',
                type: 'standard_text',
                instruction: '২. আগের ও পরের বর্ণ বসিয়ে খালি ঘর পূরণ করো: (৫ × ২ = ১০)',
                items: [
                  { prefix: '', answer: 'ঋ', suffix: 'আ', clue: '' },
                  { prefix: '', answer: 'ঊ', suffix: 'ঈ', clue: '' },
                  { prefix: '', answer: 'এ', suffix: 'ঊ', clue: '' },
                  { prefix: '', answer: 'ও', suffix: 'ঐ', clue: '' },
                  { prefix: '', answer: 'অ', suffix: 'ঔ', clue: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-৩: এলোমেলো বর্ণগুলো সাজিয়ে সুন্দর করে লেখো
              {
                id: 'nursery-arrange-1',
                type: 'standard_text',
                instruction: '৩. এলোমেলো বর্ণগুলো সাজিয়ে সুন্দর করে লেখো: (৫ × ২ = ১০)',
                items: [
                  { prefix: '(ক) ঈ , অ , আ , ই', answer: 'অ আ ই ঈ', suffix: 'উত্তর:', clue: '' },
                  { prefix: '(খ) ঊ , ঋ , উ , এ', answer: 'উ ঊ ঋ এ', suffix: 'উত্তর:', clue: '' },
                  { prefix: '(গ) ঐ , ও , ঔ', answer: 'ও ঔ ঐ', suffix: 'উত্তর:', clue: '' },
                  { prefix: '(ঘ) ঋ , অ , এ , ই', answer: 'অ ই এ ঋ', suffix: 'উত্তর:', clue: '' },
                  { prefix: '(ঙ) ঔ , আ , উ , ঊ', answer: 'আ উ ঊ ঔ', suffix: 'উত্তর:', clue: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-৪: ছবি দেখে প্রথম বর্ণটি ফাঁকা বক্সে লেখো
              {
                id: 'nursery-picture-1',
                type: 'standard_text',
                instruction: '৪. ছবি দেখে প্রথম বর্ণটি ফাঁকা বক্সে লেখো: (৪ × ২.৫ = ১০)',
                items: [
                  { prefix: '(ক) 🍎 আপেল', answer: 'আ', suffix: '', clue: '' },
                  { prefix: '(খ) 🏠 ঘর', answer: 'ঘ', suffix: '', clue: '' },
                  { prefix: '(গ) 🐪 উট', answer: 'উ', suffix: '', clue: '' },
                  { prefix: '(ঘ) ☁️ মেঘ', answer: 'ম', suffix: '', clue: '' },
                ],
                marks: 10,
              },
              // প্রশ্ন-৫: নিচের বর্ণগুলো দিয়ে ১টি করে শব্দ মুখে বলো এবং খাতায় লেখো
              {
                id: 'nursery-words-1',
                type: 'standard_text',
                instruction: '৫. নিচের বর্ণগুলো দিয়ে ১টি করে শব্দ মুখে বলো এবং খাতায় লেখো: (৫ × ২ = ১০)',
                items: [
                  { prefix: '(ক) অ -', answer: 'আম', suffix: '(যেমন: আম, অলু, অনার)', clue: '' },
                  { prefix: '(খ) ই -', answer: 'ইঁদুর', suffix: '(যেমন: ইঁদুর, ইট, ইস্পাত)', clue: '' },
                  { prefix: '(গ) উ -', answer: 'উট', suffix: '(যেমন: উট, উল্টো, উড়া)', clue: '' },
                  { prefix: '(ঘ) এ -', answer: 'একতা', suffix: '(যেমন: একতা, এঁকে, একমুখী)', clue: '' },
                  { prefix: '(ঙ) ও -', answer: 'ওড়না', suffix: '(যেমন: ওড়না, ওজন, ওষুধ)', clue: '' },
                ],
                marks: 10,
              },
            ],
          },
          {
            id: 'nursery-bangla-annual-mixed',
            name: 'বার্ষিক পরীক্ষা (বাংলা - মিশ্রিত)',
            nameEn: 'Annual Exam (Bangla - Mixed)',
            total_marks: 100,
            time_minutes: 120,
            instructions: 'সকল প্রশ্নের উত্তর দাও। ছবি ও বর্ণগুলো ভালোভাবে লক্ষ্য করো।',
            questions: [
              {
                id: 'nursery-annual-mcq',
                type: 'MCQ',
                question: '১. "আ" এর পরের স্বরবর্ণ কোনটি?',
                option_a: 'অ',
                option_b: 'ই',
                option_c: 'ঈ',
                option_d: 'উ',
                answer: 'option_b',
                marks: 10,
              },
              {
                id: 'nursery-annual-match',
                type: 'column_matching',
                instruction: '২. কলাম A এর সাথে কলাম B এর সঠিক জোড়া মেলাও:',
                pairs: [
                  { column_a: '🍎 (আপেল)', column_b: 'আ' },
                  { column_a: '🏠 (ঘর)', column_b: 'ঘ' },
                  { column_a: '🐪 (উট)', column_b: 'উ' },
                  { column_a: '☁️ (মেঘ)', column_b: 'ম' },
                  { column_a: '🐠 (মাছ)', column_b: 'ম' },
                ],
                marks: 20,
              },
              {
                id: 'nursery-annual-write-missing',
                type: 'standard_text',
                instruction: '৩. স্বরবর্ণের শূন্যস্থান পূরণ করো (১০ × ৩ = ৩০ নম্বর):',
                items: [
                  { prefix: 'অ', answer: 'আ', suffix: 'ই', clue: '' },
                  { prefix: 'ই', answer: 'ঈ', suffix: 'উ', clue: '' },
                  { prefix: 'উ', answer: 'ঊ', suffix: 'ঋ', clue: '' },
                  { prefix: 'ঋ', answer: 'এ', suffix: 'ঐ', clue: '' },
                  { prefix: 'এ', answer: 'ঐ', suffix: 'ও', clue: '' },
                  { prefix: 'ও', answer: 'ঔ', suffix: '', clue: '' },
                  { prefix: 'ক', answer: 'খ', suffix: 'গ', clue: '' },
                  { prefix: 'গ', answer: 'ঘ', suffix: 'ঙ', clue: '' },
                  { prefix: 'চ', answer: 'ছ', suffix: 'জ', clue: '' },
                  { prefix: 'ত', answer: 'থ', suffix: 'দ', clue: '' },
                ],
                marks: 30,
              },
              {
                id: 'nursery-annual-arrange',
                type: 'standard_text',
                instruction: '৪. এলোমেলো বর্ণগুলো ক্রমানুসারে সাজিয়ে লেখো (৪ × ৫ = ২০ নম্বর):',
                items: [
                  { prefix: 'উ , অ , ঈ , আ , ই', answer: 'অ আ ই ঈ উ', suffix: 'উত্তর:', clue: '' },
                  { prefix: 'খ , ক , ঘ , গ , ঙ', answer: 'ক খ গ ঘ ঙ', suffix: 'উত্তর:', clue: '' },
                  { prefix: 'ছ , চ , ঝ , জ , ঞ', answer: 'চ ছ জ ঝ ঞ', clue: '' },
                  { prefix: 'থ , ত , ধ , দ , ন', answer: 'ত থ দ ধ ন', clue: '' },
                ],
                marks: 20,
              },
              {
                id: 'nursery-annual-short-q',
                type: 'short_question',
                question: '৫. নিচের ছবিগুলোর নাম মুখে বলো এবং খাতার ফাঁকা জায়গায় সুন্দর করে লেখো (৪ × ৫ = ২০ নম্বর):\nক) 🍎 _____________\nখ) 🏠 _____________\nগ) 🐠 _____________\nঘ) ☀️ _____________',
                marks: 20,
                answer_space_lines: 5,
              },
            ],
          },
        ],
      },
      general: {
        name: 'General',
        nameEn: 'সাধারণ জ্ঞান',
        icon: '⭐',
        papers: [
          {
            id: 'nursery-general-full',
            name: 'বার্ষিক পরীক্ষা (সাধারণ)',
            nameEn: 'Annual Exam (General)',
            total_marks: 100,
            time_minutes: 90,
            instructions: 'প্রতিটি প্রশ্নের উত্তর দাও।',
            questions: [
              // ছবি দেখে নাম লেখো
              {
                id: 'nursery-name-1',
                type: 'standard_text',
                instruction: '১. ছবি দেখে নাম লেখো (২০ নম্বর):',
                items: [
                  { prefix: '(আম এঁকে দেখে) নাম:', answer: 'আম', suffix: '__________', clue: '' },
                  { prefix: '(গরু দেখে) নাম:', answer: 'গরু', suffix: '__________', clue: '' },
                  { prefix: '(বিড়াল দেখে) নাম:', answer: 'বিড়াল', suffix: '__________', clue: '' },
                  { prefix: '(কুকুর দেখে) নাম:', answer: 'কুকুর', suffix: '__________', clue: '' },
                  { prefix: '(পাখি দেখে) নাম:', answer: 'পাখি', suffix: '__________', clue: '' },
                  { prefix: '(মাছ দেখে) নাম:', answer: 'মাছ', suffix: '__________', clue: '' },
                  { prefix: '(ফুল দেখে) নাম:', answer: 'ফুল', suffix: '__________', clue: '' },
                  { prefix: '(বই দেখে) নাম:', answer: 'বই', suffix: '__________', clue: '' },
                  { prefix: '(পেন্সিল দেখে) নাম:', answer: 'পেন্সিল', suffix: '__________', clue: '' },
                  { prefix: '(খাতা দেখে) নাম:', answer: 'খাতা', suffix: '__________', clue: '' },
                ],
                marks: 20,
              },
              // বাংলা বর্ণমালা
              {
                id: 'nursery-bangla-1',
                type: 'standard_text',
                instruction: '২. বাংলা বর্ণমালা লেখো (৩০ নম্বর):',
                items: [
                  { prefix: 'স্বরবর্ণ (১০ নম্বর):', answer: '', suffix: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ', clue: '' },
                  { prefix: 'ব্যঞ্জনবর্ণ (১০ নম্বর):', answer: '', suffix: 'ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ', clue: '' },
                  { prefix: 'যুক্তবর্ণ (৫ নম্বর):', answer: '', suffix: 'ক্ষ ত্র জ্ঞ দ্ধ', clue: '' },
                  { prefix: 'সংখ্যা বাংলায় (৫ নম্বর):', answer: '', suffix: '১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯ ১০', clue: '' },
                ],
                marks: 30,
              },
              // ইংরেজি বর্ণমালা
              {
                id: 'nursery-english-1',
                type: 'standard_text',
                instruction: '৩. ইংরেজি বর্ণমালা লেখো (২০ নম্বর):',
                items: [
                  { prefix: 'Capital letters (১০ নম্বর):', answer: '', suffix: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', clue: '' },
                  { prefix: 'Small letters (১০ নম্বর):', answer: '', suffix: 'a b c d e f g h i j k l m n o p q r s t u v w x y z', clue: '' },
                ],
                marks: 20,
              },
              // সংখ্যা গণনা
              {
                id: 'nursery-math-1',
                type: 'standard_text',
                instruction: '৪. সংখ্যা গণনা করো (২০ নম্বর):',
                items: [
                  { prefix: '১ + ১ =', answer: '২', suffix: '' },
                  { prefix: '২ + ১ =', answer: '৩', suffix: '' },
                  { prefix: '২ + ২ =', answer: '৪', suffix: '' },
                  { prefix: '৩ + ২ =', answer: '৫', suffix: '' },
                  { prefix: '৫ - ১ =', answer: '৪', suffix: '' },
                  { prefix: '৫ - ২ =', answer: '৩', suffix: '' },
                  { prefix: '৪ - ২ =', answer: '২', suffix: '' },
                  { prefix: '৩ - ৩ =', answer: '০', suffix: '' },
                  { prefix: '২ × ২ =', answer: '৪', suffix: '' },
                  { prefix: '৩ × ২ =', answer: '৬', suffix: '' },
                ],
                marks: 20,
              },
              // রং চিনো
              {
                id: 'nursery-color-1',
                type: 'standard_text',
                instruction: '৫. রং চিনো (১০ নম্বর):',
                items: [
                  { prefix: 'লাল রঙের নাম:', answer: 'Red', suffix: '' },
                  { prefix: 'নীল রঙের নাম:', answer: 'Blue', suffix: '' },
                  { prefix: 'সবুজ রঙের নাম:', answer: 'Green', suffix: '' },
                  { prefix: 'হলুদ রঙের নাম:', answer: 'Yellow', suffix: '' },
                  { prefix: 'সাদা রঙের নাম:', answer: 'White', suffix: '' },
                  { prefix: 'কালো রঙের নাম:', answer: 'Black', suffix: '' },
                  { prefix: 'কমলা রঙের নাম:', answer: 'Orange', suffix: '' },
                  { prefix: 'গোলাপি রঙের নাম:', answer: 'Pink', suffix: '' },
                  { prefix: 'বেগুনি রঙের নাম:', answer: 'Purple', suffix: '' },
                  { prefix: 'বাদামী রঙের নাম:', answer: 'Brown', suffix: '' },
                ],
                marks: 10,
              },
            ],
          },
        ],
      },
    },
  },
}

export default function FullPaperTemplatesModal({ onClose }) {
  const setQuestions = usePaperStore((s) => s.setQuestions)
  const updatePaper = usePaperStore((s) => s.updatePaper)

  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [detailView, setDetailView] = useState('preview')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDetailView('preview')
  }, [selectedPaper])

  // Get selected data
  const classData = selectedClass ? FULL_PAPER_TEMPLATES[selectedClass] : null
  const subjectData = selectedClass && selectedSubject ? classData?.subjects[selectedSubject] : null
  const paperData = selectedPaper ? subjectData?.papers.find((p) => p.id === selectedPaper) : null

  // Handle paper selection
  const handleSelectPaper = (paperId) => {
    setSelectedPaper(paperId)
  }

  // Apply paper template
  const handleApplyPaper = () => {
    if (!paperData) return

    setLoading(true)

    // Add IDs to questions
    const questionsWithIds = paperData.questions.map((q, i) => ({
      ...q,
      id: crypto.randomUUID(),
      order: i,
    }))

    // Update paper metadata
    updatePaper({
      exam_title: paperData.name,
      total_marks: paperData.total_marks,
      time_minutes: paperData.time_minutes,
      instructions: paperData.instructions,
    })

    // Set questions
    setQuestions(questionsWithIds)

    setTimeout(() => {
      setLoading(false)
      toast.success(`${paperData.questions.length}টি প্রশ্ন যোগ হয়েছে!`)
      onClose()
    }, 300)
  }

  // Reset navigation
  const handleBackToSubjects = () => {
    setSelectedSubject(null)
    setSelectedPaper(null)
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
    setSelectedSubject(null)
    setSelectedPaper(null)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="sm:rounded-[24px]"
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px 12px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {selectedSubject && (
                <button
                  onClick={handleBackToSubjects}
                  className="btn-press"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {selectedClass && !selectedSubject && (
                <button
                  onClick={handleBackToClasses}
                  className="btn-press"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <span style={{ fontSize: 22 }}>
                {paperData ? '📄' : subjectData ? subjectData.icon : classData ? classData.icon : '📚'}
              </span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {paperData ? paperData.name : subjectData ? subjectData.name : classData ? classData.name : 'পূর্ণ প্রশ্নপত্র টেমপ্লেট'}
                </h3>
                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>
                  {paperData ? paperData.nameEn : subjectData ? subjectData.nameEn : classData ? 'Select a subject' : 'Full exam paper templates'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: selectedPaper && detailView === 'preview' ? '8px 12px' : '16px 20px',
            }}
          >
            {!selectedClass ? (
              // Class Selection
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 12px' }}>
                  শ্রেণী নির্বাচন করুন
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {Object.values(FULL_PAPER_TEMPLATES).map((cls) => (
                    <button
                      key={cls.name}
                      onClick={() => setSelectedClass(cls.name.toLowerCase().replace(' ', '-'))}
                      className="btn-press"
                      style={{
                        padding: '20px 16px',
                        borderRadius: 16,
                        border: '2px solid #e2e8f0',
                        background: '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>{cls.icon}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        {cls.name}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedClass && !selectedSubject ? (
              // Subject Selection
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 12px' }}>
                  বিষয় নির্বাচন করুন
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {Object.values(classData.subjects).map((subj) => (
                    <button
                      key={subj.name}
                      onClick={() => setSelectedSubject(subj.name.toLowerCase())}
                      className="btn-press"
                      style={{
                        padding: '16px',
                        borderRadius: 16,
                        border: '2px solid',
                        borderColor: '#3b82f640',
                        background: '#3b82f610',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{subj.icon}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
                        {subj.name}
                      </h4>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                        {subj.papers.length}টি পেপার
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedSubject && !selectedPaper ? (
              // Paper Selection
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 12px' }}>
                  পরীক্ষা নির্বাচন করুন
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subjectData.papers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => handleSelectPaper(paper.id)}
                      className="btn-press"
                      style={{
                        padding: '16px',
                        borderRadius: 12,
                        border: '2px solid #e2e8f0',
                        background: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
                            {paper.name}
                          </h4>
                          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                            {paper.nameEn}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                            {paper.total_marks} নম্বর
                          </span>
                          <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>
                            {paper.time_minutes} মিনিট
                          </p>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: '#64748b' }}>
                        {paper.questions.length}টি প্রশ্ন
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedPaper && paperData ? (
              // Paper Details
              <div>
                {detailView === 'list' && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                        {paperData.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                        {paperData.total_marks} নম্বর
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                      ⏱ {paperData.time_minutes} মিনিট • {paperData.questions.length}টি প্রশ্ন
                    </div>
                    {paperData.instructions && (
                      <div style={{ marginTop: 8, fontSize: 11, fontStyle: 'italic', color: '#475569' }}>
                        {paperData.instructions}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: detailView === 'preview' ? 10 : 12 }}>
                  {[
                    { id: 'preview', label: 'PDF প্রিভিউ' },
                    { id: 'list', label: 'প্রশ্ন তালিকা' },
                  ].map((tab) => {
                    const active = detailView === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDetailView(tab.id)}
                        className="btn-press"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid',
                          borderColor: active ? '#2563eb' : '#e2e8f0',
                          background: active ? '#eff6ff' : '#fff',
                          color: active ? '#2563eb' : '#64748b',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {detailView === 'preview' ? (
                  <TemplatePaperPreview
                    paperMeta={paperData}
                    questions={paperData.questions}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {paperData.questions.map((q, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: '#fff',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', minWidth: 20 }}>
                            {i + 1}.
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, color: '#334155', margin: '0 0 4px', fontWeight: 500 }}>
                              {q.instruction || q.question || q.description || 'Question ' + (i + 1)}
                            </p>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>
                              {q.type} • {q.marks || 0} নম্বর
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {selectedPaper && paperData && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#fafafa',
              }}
            >
              <button
                onClick={handleApplyPaper}
                disabled={loading}
                className="btn-press"
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: loading ? '#94a3b8' : '#059669',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'যোগ হচ্ছে...' : 'পেপার লোড করুন'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
