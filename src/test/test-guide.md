# প্রশ্ন শালা — টেস্ট গাইড

## টেস্ট সেটআপ কী কী করা হয়েছে

### 1. Dependencies ইনস্টল

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

| প্যাকেজ | কেন দরকার |
|---|---|
| `vitest` | Vite-native টেস্ট রানার — Jest-এর বিকল্প, Vite config সরাসরি ব্যবহার করে |
| `@testing-library/react` | React কম্পোনেন্ট render ও DOM query করার জন্য |
| `@testing-library/jest-dom` | `.toBeInTheDocument()`, `.toBeRequired()` ইত্যাদি custom matchers |
| `@testing-library/user-event` | ইউজার ইন্টারেকশন সিমুলেট — click, type, keyboard |
| `jsdom` | ব্রাউজার ছাড়া DOM এনভায়রনমেন্ট (Node.js-এ window, document) |

### 2. Vitest কনফিগারেশন (vite.config.js)

```js
test: {
  globals: true,          // describe, it, expect গ্লোবালি available
  environment: 'jsdom',   // DOM এনভায়রনমেন্ট
  setupFiles: './src/test/setup.js',  // প্রতিটি টেস্ট ফাইলের আগে রান হয়
  css: false,             // CSS প্রসেস করা বন্ধ — টেস্ট দ্রুত হয়
  env: {
    NODE_ENV: 'development',  // React 19 এর act() শুধু dev build-এ আছে
  },
}
```

### 3. Setup ফাইল (src/test/setup.js)

```js
import { act } from 'react'
import '@testing-library/jest-dom'
globalThis.IS_REACT_ACT_ENVIRONMENT = true
```

**কী করে:**
- `@testing-library/jest-dom` ইম্পোর্ট করে custom matchers যোগ করে
- `IS_REACT_ACT_ENVIRONMENT = true` — React-কে বলে এটা টেস্ট এনভায়রনমেন্ট, act() warning ঠিকমতো কাজ করবে

### 4. React 19 Compatibility Shim (src/test/react-dom-test-utils-shim.js)

```js
import { act } from 'react'
export { act }
```

**কেন দরকার:**
- React 19 থেকে `react-dom/test-utils` module-এ `act()` deprecated
- React 19-এ `act()` শুধু `react` প্যাকেজের **development build**-এ আছে, production-এ নেই
- `@testing-library/react` এখনো `react-dom/test-utils` থেকে `act` import করার চেষ্টা করে
- এই shim ফাইলটা fallback হিসেবে কাজ করে

### 5. package.json-এ নতুন scripts

```json
"test": "vitest run",        // একবার সব টেস্ট রান করে
"test:watch": "vitest"        // ফাইল পরিবর্তনে অটো রিরান
```

---

## টেস্ট রান করার নিয়ম

```bash
# সব টেস্ট একবারে রান
npm test

# watch mode — ফাইল save করলেই আবার রান হয়
npm run test:watch

# নির্দিষ্ট ফাইল টেস্ট
npx vitest run src/store/authStore.test.js

# নির্দিষ্ট টেস্ট নাম দিয়ে ফিল্টার
npx vitest run -t "should clear all auth state"
```

**গুরুত্বপূর্ণ:** Windows-এ `NODE_ENV=development` সেট না থাকলে React 19 এর `act()` কাজ করবে না। vite.config.js-এ `test.env` দিয়ে এটা handle করা হয়েছে, তাই আলাদা কিছু করতে হবে না।

---

## টেস্ট ফাইল তালিকা ও বিবরণ

### Store Tests (Unit Tests — কোনো DOM render নেই, দ্রুত চলে)

#### `src/store/authStore.test.js` — 11 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| login — set user, token, isAuthenticated | সঠিক state সেট হচ্ছে কিনা |
| login — isAuthenticated false if missing | user/token না থাকলে false |
| login — keep existing refreshToken | নতুন refreshToken না দিলে পুরনোটা থাকবে |
| logout — clear all auth state | সব null/false হচ্ছে কিনা |
| setUser — update only user | অন্য state (token) অপরিবর্তিত |
| applySession — no access_token | অবৈধ session-এ null রিটার্ন |
| applySession — null session | null session-এ null রিটার্ন |
| applySession — valid session | token, user, isAuthenticated সেট হচ্ছে |
| applySession — backend profile | /auth/me থেকে user আপডেট হচ্ছে |
| applySession — /auth/me failure | API fail হলেও basic user থাকে |
| applySession — deduplication | একসাথে দুইবার কল হলে একবারই API call |

#### `src/store/paperStore.test.js` — 14 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| setPaper | paper ও questions সেট, isDirty false |
| setPaper — no questions | questions ছাড়া paper handle করে |
| updatePaper | field merge ও isDirty true |
| addQuestion — order | order সঠিকভাবে assign হচ্ছে |
| addQuestion — multiple | একাধিক question-এ sequential order |
| updateQuestion | নির্দিষ্ট question আপডেট, অন্যগুলো অপরিবর্তিত |
| removeQuestion | মুছে ফেলা ও reorder |
| duplicateQuestion | original-এর পরে duplicate, নতুন id |
| duplicateQuestion — nonexistent | ভুল id-তে কিছু হয় না |
| reorderQuestions | নতুন order assign |
| getTotalMarks | সব marks যোগ |
| getTotalMarks — CQ | sub_questions এর marks যোগ |
| getTotalMarks — missing marks | marks না থাকলে 0 |
| clearPaper ও markClean | state রিসেট |

#### `src/store/examStore.test.js` — 7 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| setExam | exam সেট, answers/submitted রিসেট |
| setAnswer | উত্তর সেট, পুরনো preserve, overwrite |
| setTimeRemaining | সময় সেট |
| markSubmitted | submitted true |
| resetExam | সব state রিসেট |

#### `src/store/studentStore.test.js` — 8 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| initial state — zero values | কোনো hardcoded demo data নেই |
| setClass | class level সেট |
| addXP | XP যোগ হচ্ছে |
| completeTopic | topic complete হচ্ছে, count বাড়ছে |
| completeTopic — no duplicate | দুইবার same topic complete করলে একবারই count |
| setTopicProgress | progress সেট, অন্যগুলো preserve |
| resetStudentData | সব শূন্য |

### Service Tests

#### `src/services/api.test.js` — 8 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| baseURL default | /api ব্যবহার হচ্ছে |
| request interceptor — token | Authorization header সেট |
| request interceptor — no token | token না থাকলে header নেই |
| response — success passthrough | সফল response পাস হচ্ছে |
| response — 401 logout | 401 পেলে logout কল হচ্ছে |
| response — 401 /auth/me skip | /auth/me তে 401 পেলে logout হয় না |
| response — non-401 passthrough | 500 error পাস হচ্ছে |
| configuration | timeout, content-type, credentials সঠিক |

#### `src/lib/supabase.test.js` — 1 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| missing env throws | VITE_SUPABASE_URL/KEY না থাকলে error throw |

### Component Tests (React render + DOM interaction)

#### `src/App.test.jsx` — 10 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| GuestRoute — unauthenticated | login page দেখায় |
| GuestRoute — authenticated with role | / এ redirect |
| GuestRoute — authenticated no role | /register?step=role এ redirect |
| ProtectedRoute — unauthenticated | /login এ redirect |
| ProtectedRoute — with role | RoleSelection দেখায় |
| ProtectedRoute — no role | /register এ redirect |
| AdminRoute — non-admin | / এ redirect |
| AdminRoute — admin | AdminDashboard দেখায় |
| Public — exam portal | auth ছাড়া accessible |
| Public — auth callback | auth ছাড়া accessible |

#### `src/pages/Register.test.jsx` — 6 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| step 1 default | registration form দেখায় |
| required fields | সব field required |
| password mismatch | ভিন্ন password-এ error toast |
| password match | matching password-এ step 2 যায় |
| step bypass — not logged in | URL-এ ?step=role দিলেও step 1 দেখায় |
| step bypass — logged in | Google OAuth user-এর জন্য step 2 যায় |

#### `src/pages/ExamPortal.test.jsx` — 7 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| loading spinner | API লোডিং-এ spinner |
| error on failed fetch | ব্যর্থ হলে error page |
| entry — title and input | exam title ও name input দেখায় |
| entry — no name error | নাম ছাড়া শুরু করলে toast error |
| exam — timer and questions | 30:00 timer ও submit button |
| submission — startedAt | সার্ভারে startedAt পাঠায় |
| submission — success screen | সফল submission-এ success message |

#### `src/pages/Dashboard.test.jsx` — 6 টেস্ট
| টেস্ট | কী যাচাই করে |
|---|---|
| skeleton loading | লোডিং-এ skeleton দেখায় |
| user name | ইউজারের নাম দেখায় |
| paper count stats | পেপার/প্রশ্ন stats দেখায় |
| empty state | পেপার না থাকলে "প্রথম পেপার তৈরি করুন" |
| error toast | API fail হলে toast দেখায় |
| premium CTA | free user-এ upgrade প্রম্পট |

---

## টেস্টে যেসব টেকনিক ব্যবহার হয়েছে

### 1. Mocking

```js
// API mock
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

// Store mock (controller pattern)
let mockAuthState = {}
vi.mock('@/store/authStore', () => ({
  default: vi.fn((selector) => selector(mockAuthState)),
}))
// টেস্টে mockAuthState পরিবর্তন করে ভিন্ন ভিন্ন scenario টেস্ট করা যায়

// Framer Motion mock (animation timing issue এড়াতে)
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: ({ children, ...props }) => <div>{children}</div> },
}))
```

### 2. Zustand Store Direct Testing

```js
// Zustand store সরাসরি getState/setState দিয়ে টেস্ট করা যায়
beforeEach(() => {
  useAuthStore.setState({ user: null, token: null })  // রিসেট
})

useAuthStore.getState().login(user, token)  // অ্যাকশন কল
expect(useAuthStore.getState().user).toEqual(user)  // state চেক
```

### 3. Async Testing

```js
// waitFor — DOM আপডেট হওয়া পর্যন্ত অপেক্ষা করে
await waitFor(() => {
  expect(screen.getByText('গণিত পরীক্ষা')).toBeInTheDocument()
})

// userEvent — রিয়েল ইউজার interaction সিমুলেট
const user = userEvent.setup()
await user.type(screen.getByPlaceholderText('আপনার নাম'), 'টেস্ট')
await user.click(screen.getByText('পরীক্ষা শুরু করুন'))
```

---

## নতুন টেস্ট লেখার নিয়ম

### Store টেস্ট টেমপ্লেট:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import useMyStore from './myStore'

describe('myStore', () => {
  beforeEach(() => {
    useMyStore.setState({ /* initial state */ })
  })

  it('should do something', () => {
    useMyStore.getState().someAction()
    expect(useMyStore.getState().someValue).toBe(expected)
  })
})
```

### Component টেস্ট টেমপ্লেট:
```js
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// mock dependencies first
vi.mock('@/services/api', () => ({ /* ... */ }))

import MyComponent from './MyComponent'

function renderComponent() {
  return render(
    <MemoryRouter>
      <MyComponent />
    </MemoryRouter>
  )
}

describe('MyComponent', () => {
  it('should render', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('expected text')).toBeInTheDocument()
    })
  })
})
```

---

## ফাইল স্ট্রাকচার

```
src/test/
├── setup.js                        ← jest-dom + React 19 act environment
├── react-dom-test-utils-shim.js    ← React 19 act() compatibility shim
└── test-guide.md                   ← এই ফাইল

src/store/
├── authStore.js        ← সোর্স
├── authStore.test.js   ← টেস্ট (পাশাপাশি রাখা)
├── paperStore.js
├── paperStore.test.js
├── examStore.js
├── examStore.test.js
├── studentStore.js
└── studentStore.test.js

src/services/
├── api.js
└── api.test.js

src/lib/
├── supabase.js
└── supabase.test.js

src/pages/
├── ExamPortal.jsx
├── ExamPortal.test.jsx
├── Dashboard.jsx
├── Dashboard.test.jsx
├── Register.jsx
└── Register.test.jsx

src/
├── App.jsx
└── App.test.jsx
```

**Convention:** টেস্ট ফাইল সোর্স ফাইলের পাশেই থাকে — `.test.js` বা `.test.jsx` এক্সটেনশন দিয়ে।
