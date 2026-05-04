
/** Simplified auth bootstrap - skip hydration wait to prevent infinite loading */
export default function AuthBootstrap({ children }) {
  // Don't wait for hydration - just render children immediately
  // Auth state will sync in the background
  return children
}
