import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes/router'

/**
 * Root App component — renders the router provider.
 * AuthProvider, QueryClientProvider, and Toaster are mounted in main.tsx.
 */
export function App() {
  return <RouterProvider router={router} />
}
