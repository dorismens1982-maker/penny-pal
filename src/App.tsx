import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/auth", element: <AuthPage /> },
    { path: "/", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
    { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
    { path: "/transactions", element: <ProtectedRoute><Transactions /></ProtectedRoute> },
    { path: "/settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
    { path: "*", element: <NotFound /> },
  ],
  { future: { v7_startTransition: true, v7_relativeSplatPath: true } }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider 
          router={router}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
