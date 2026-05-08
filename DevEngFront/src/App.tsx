import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { useAuth } from "@/hooks/use-auth";

// Public Pages
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/dashboard/Projects";
import ProjectView from "./pages/dashboard/ProjectView";
import NewProject from "./pages/dashboard/NewProject";
import CastMembers from "./pages/dashboard/CastMembers";
import NewCastMember from "./pages/dashboard/NewCastMember";
import EditCastMember from "./pages/dashboard/EditCastMember";
import Settings from "./pages/dashboard/Settings";
import Subscription from "./pages/dashboard/Subscription";
import { useLocation } from "react-router-dom"; // Add import for useLocation
import Wallet from "./pages/dashboard/Wallet";
// import RequireSubscription from "./components/RequireSubscription";

const queryClient = new QueryClient();

// Custom PublicRoute component to handle route guarding

const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { useAuthStatus } = useAuth();
  const { data: isAuthenticated, isLoading } = useAuthStatus();
  const location = useLocation();

  // Allow public routes to render while loading or on /signin
  if (isLoading || location.pathname === "/signin") {
    return element;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LayoutProvider>


            <Routes>
              {/* Public Routes with Guard */}
              <Route path="/" element={<PublicRoute element={<Index />} />} />
              <Route
                path="/signin"
                element={<PublicRoute element={<SignIn />} />}
              />
              <Route
                path="/signup"
                element={<PublicRoute element={<SignUp />} />}
              />
              <Route
                path="/features"
                element={<PublicRoute element={<Features />} />}
              />
              <Route
                path="/pricing"
                element={<PublicRoute element={<Pricing />} />}
              />
              <Route
                path="/about"
                element={<PublicRoute element={<About />} />}
              />

              {/* Dashboard Routes */}
              <Route path="/dashboard"
                element={

                  <Dashboard />

                } />

              <Route path="/dashboard/projects"
                element={

                  <Projects />

                } />
              <Route path="/dashboard/projects/new"
                element={

                  <NewProject />

                } />
              <Route
                path="/dashboard/projects/:projectId"
                element={

                  <ProjectView />

                }
              />

              {/* Cast Members Routes */}
              <Route path="/dashboard/cast-members"
                element={

                  <CastMembers />

                } />
              <Route
                path="/dashboard/cast-members/new"
                element={

                  <NewCastMember />

                }
              />
              <Route
                path="/dashboard/cast-members/:castMemberId/edit"
                element={

                  <EditCastMember />

                }
              />

              {/* <Route path="/dashboard/settings"
              element={

                <Settings />

              } /> */}
              <Route path="/dashboard/subscription" element={
                <Subscription />} />
              <Route path="/dashboard/wallet"
                element={

                  <Wallet />

                } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LayoutProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
