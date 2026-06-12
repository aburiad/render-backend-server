// Shim for react-dom/test-utils — React 19 removed act() from this module.
// Re-export act from 'react' so @testing-library/react works.
import { act } from 'react'
export { act }
