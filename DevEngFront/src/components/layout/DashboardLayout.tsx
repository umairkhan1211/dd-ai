import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
// import Walkthrough from "../Walkthrough/walkthrough";
import headerlogo from "@/assets/Dashboard/headerlogo.png";
import ducklogo from "@/assets/Dashboard/duck.png";
import dashboardbgheader from "@/assets/Dashboard/dashboardbgheader.png";
import dashboardbgbottom from "@/assets/Dashboard/dashboardbgbottom.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  Plus,
  LogOut,
  Menu,
  CreditCard,
  Wallet,
  Linkedin,
  Loader2,
  Coins,
} from "lucide-react";

import { Instagram, Youtube, Twitter, Facebook } from "lucide-react";

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useLayout } from "@/contexts/LayoutContext";
import { useSubscription } from "@/hooks/use-subscription";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: any;
}

// Add this to persist sidebar state between navigations
const SIDEBAR_STATE_KEY = "dashboard-sidebar-state";

export function DashboardSidebar({ mobile = false }: { mobile?: boolean }) {
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { useSignOut } = useAuth();
  const { mutate: signOut, isPending } = useSignOut();

  const { useBillingStatusQuery } = useSubscription();

  const { data: billingStatus, isLoading: isBillingLoading } =
    useBillingStatusQuery();

  const RemainingDucks = billingStatus?.wallet?.totalDucksAvailable || 0;

  const currentTier = billingStatus?.currentTier?.toLowerCase();
  const TotalDucks =
    currentTier === "core" ? 1500 : currentTier === "trial" ? 20 : 0;

  const usedDucks = TotalDucks - RemainingDucks;
  const progressPercent = TotalDucks > 0 ? (usedDucks / TotalDucks) * 100 : 0;

  const handleSignOut = () => {
    // localStorage.removeItem("walkthroughFinished");

    signOut(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["authStatus"] });
        navigate("/signin");
      },
      onError: (error) => {
        console.error("Sign-out failed:", error);
        toast({
          title: "Sign Out Failed",
          description: "An error occurred while signing out. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  // Load sidebar state only on first mount, with an empty dependency array
  useEffect(() => {
    // Get saved state from localStorage
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);

    // Only set the state if there's a saved value
    if (savedState) {
      setOpen(savedState === "expanded");
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Save sidebar state when it changes, but avoid the state dependency
  // to prevent infinite updates
  const prevStateRef = useState(state)[0];
  useEffect(() => {
    // Only update localStorage if the state actually changed from previous
    if (prevStateRef !== state) {
      localStorage.setItem(SIDEBAR_STATE_KEY, state);
    }
  }, [state, prevStateRef]);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard"; // Exact match for dashboard
    }
    if (path === "/dashboard/projects") {
      return currentPath.startsWith("/dashboard/projects");
    }
    if (path === "/dashboard/cast-members") {
      return currentPath.startsWith("/dashboard/cast-members");
    }
    // if (path === "/dashboard/settings") {
    //   return currentPath.startsWith("/dashboard/settings");
    // }
    // if (path === "/dashboard/subscription") {
    //   return currentPath.startsWith("/dashboard/subscription");
    // }
    if (path === "/dashboard/wallet") {
      return currentPath.startsWith("/dashboard/wallet");
    }
    return false;
  };

  function getNavCls(path: string, isCollapsed?: boolean) {
    const isActive = location.pathname === path;

    // Shared base classes for both states
    const baseCls =
      "!w-[190px] flex items-center **justify-center sm:justify-start** transition-all duration-300 " + // <--- Yahan 'sm:justify-start' sirf bade screens ke liye justify-start rakhta hai.
      "rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none px-3 py-2 " +
      "text-white hover:!text-muted-foreground";

    // Active (glassy effect) style
    const activeCls =
      "relative bg-transparent backdrop-blur-sm " +
      "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)] " +
      "before:content-[''] before:absolute before:left-0 before:top-0 " +
      "before:h-full before:w-[3px] before:bg-[#7B69FF] before:rounded-r-[8px] " +
      "before:shadow-[0_0_12px_4px_rgba(123,105,255,0.9)] before:animate-[slideGlow_0.4s_ease-out]";

    // Adjust spacing based on collapsed or expanded state
    const spacing = isCollapsed ? "justify-center" : "justify-start pl-2";

    return `${baseCls} ${spacing} ${isActive ? activeCls : ""}`;
  }

  // function getNavCls(path: string, isCollapsed?: boolean) {
  //   const isActive = location.pathname === path;

  //   // Base classes for all states
  //   const baseCls =
  //     "!w-[190px] flex items-center transition-all duration-300 " +
  //     "rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none px-3 py-2 " +
  //     "text-white hover:!text-muted-foreground";

  //   // Active (glassy + glowing + smooth slide)
  //   const activeCls =
  //     "relative bg-transparent backdrop-blur-sm " +
  //     "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)] " +
  //     "before:content-[''] before:absolute before:left-0 before:top-0 " +
  //     "before:h-full before:w-[3px] before:bg-[#7B69FF] before:rounded-r-[8px] " +
  //     "before:shadow-[0_0_12px_4px_rgba(123,105,255,0.9)] before:animate-[slideGlow_0.4s_ease-out] " +
  //     "active-menu-animate";

  //   // Adjust spacing
  //   const spacing = isCollapsed ? "justify-center" : "justify-start pl-2";

  //   return `${baseCls} ${spacing} ${isActive ? activeCls : ""}`;
  // }

  // function getNavCls(path: string, isCollapsed?: boolean) {
  //   const isActive = location.pathname === path;

  //   const baseCls =
  //     "!w-[190px] flex items-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  //     "rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none px-3 py-2 " +
  //     "text-white hover:!text-muted-foreground will-change-transform";

  //   const activeCls =
  //     "relative bg-transparent backdrop-blur-md " +
  //     "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_3px_10px_rgba(0,0,0,0.45)] " +
  //     "before:content-[''] before:absolute before:left-0 before:top-0 " +
  //     "before:h-full before:w-[3px] before:bg-[#7B69FF] before:rounded-r-[8px] " +
  //     "before:shadow-[0_0_14px_5px_rgba(123,105,255,0.9)] " +
  //     "animate-[flipSmooth_1.2s_cubic-bezier(0.22,1,0.36,1)_forwards] " +
  //     "before:animate-[glowPulse_3s_ease-in-out_infinite]";

  //   const spacing = isCollapsed ? "justify-center" : "justify-start pl-2";

  //   return `${baseCls} ${spacing} ${isActive ? activeCls : ""}`;
  // }

  function Divider() {
    return (
      <div className="w-[92%] my-2 border-[2px]  border-[#C6C5C5]/50 rounded-r-3xl" />
    );
  }

  const sidebarContent = (
    <>
      <div className="px-3 py-4 flex items-center justify-center overflow-x-hidden">
        {!mobile && (
          <>
            {!isCollapsed ? (
              <img
                src={headerlogo}
                alt="Desruptive Duck AI"
                width={178}
                height={38}
                className="object-contain"
              />
            ) : (
              <img
                src={ducklogo}
                alt="Desruptive Duck AI Icon"
                width={40}
                height={40}
                className="object-contain"
              />
            )}
          </>
        )}

        {mobile && (
          <img
            src={headerlogo}
            alt="Desruptive Duck AI"
            width={100}
            height={40}
            className="object-contain"
          />
        )}
      </div>

      <Divider />

      <Link
        to="/dashboard/projects/new"
        className="px-3 mt-2 mb-4 flex items-center justify-center"
      >
        {isCollapsed && !mobile ? (
          <Button
            variant="outline"
            className=" w-[26px] h-[26px] rounded-full flex items-center justify-center   bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[1px] border-white/50
    backdrop-blur-3xl
    transition duration-300 ease-out"
            size="icon"
          >
            <Plus size={16} />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="
    w-[70%] rounded-md px-5 py-3 flex items-center justify-center
 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[1px] border-white/50
    backdrop-blur-3xl
    transition duration-300 ease-out
    "
          >
            <Plus size={16} />
            <span className="font-ubuntu">New Project</span>
          </Button>
        )}
      </Link>

      <div>
        <SidebarGroup>
          {/* <SidebarGroupLabel
            className={`${mobile ? "" : isCollapsed ? "sr-only" : ""
              } text-primary font-medium`}
          >
            Main
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="rounded-tr-2xl rounded-br-2xl rounded-tl-none rounded-bl-none"
                  tooltip={isCollapsed ? "Home" : ""}
                >
                  {mobile ? (
                    <Link
                      to="/dashboard"
                      className={`flex items-center py-2 px-3  ${getNavCls(
                        "/dashboard",
                      )}`}
                    >
                      <Home size={18} className="ml-2" />
                      <span className="ml-2 font-ubuntu">Home</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className={`flex items-center py-2 px-3 ${getNavCls(
                        "/dashboard",
                        isCollapsed,
                      )}`}
                    >
                      <Home
                        size={18}
                        className={`${isCollapsed ? "" : "ml-2"}`}
                      />
                      {!isCollapsed && (
                        <span className="ml-2 font-ubuntu">Home</span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Projects" : ""}
                >
                  {mobile ? (
                    <Link
                      to="/dashboard/projects"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/projects",
                      )}`}
                    >
                      <FolderOpen size={18} className="ml-2" />
                      <span className="ml-2 font-ubuntu">Projects</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/projects"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/projects",
                        isCollapsed,
                      )}`}
                    >
                      <FolderOpen
                        size={18}
                        className={`${isCollapsed ? "" : "ml-2"}`}
                      />
                      {!isCollapsed && (
                        <span className="ml-2 font-ubuntu">Projects</span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Cast Members" : ""}
                >
                  {mobile ? (
                    <Link
                      to="/dashboard/cast-members"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/cast-members",
                      )}`}
                    >
                      <Users size={18} className="ml-2" />
                      <span className="ml-2 CreateCastMembers font-ubuntu">
                        Cast Members
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/cast-members"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/cast-members",
                        isCollapsed,
                      )}`}
                    >
                      <Users
                        size={18}
                        className={`${isCollapsed ? "" : "ml-2"}`}
                      />
                      {!isCollapsed && (
                        <span className="ml-2 font-ubuntu">Cast Members</span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Subscription" : ""}
                >
                  {mobile ? (
                    <Link
                      to="/dashboard/subscription"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/subscription",
                      )}`}
                    >
                      <CreditCard size={18} className="ml-2" />
                      <span className="">Subscription</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/subscription"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/subscription",
                        isCollapsed,
                      )}`}
                    >
                      <CreditCard
                        size={18}
                        className={`${isCollapsed ? "" : "ml-2"}`}
                      />
                      {!isCollapsed && (
                        <span className="ml-2">Subscription</span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Wallet" : ""}
                >
                  {mobile ? (
                    <Link
                      to="/dashboard/wallet"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/wallet",
                      )}`}
                    >
                      <Wallet size={18} className="ml-2" />
                      <span className="ml-2 font-ubuntu">Wallet</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/wallet"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/wallet",
                        isCollapsed,
                      )}`}
                    >
                      <Wallet
                        size={18}
                        className={`${isCollapsed ? "" : "ml-2"}`}
                      />
                      {!isCollapsed && (
                        <span className="ml-2 font-ubuntu">Wallet</span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Divider />

        <SidebarGroup>
          {/* <SidebarGroupLabel
            className={`${mobile ? "" : isCollapsed ? "sr-only" : ""
              } text-primary font-medium`}
          >
            Account
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {/* <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Settings" : ""}
                >
                  {mobile ? (
                    <Link
                      to="/dashboard/settings"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/settings"
                      )}`}
                    >
                      <Settings size={18} className="ml-2" />
                      <span className="ml-2 font-ubuntu">Settings</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/settings"
                      className={`flex items-center py-2 px-3 w-full ${getNavCls(
                        "/dashboard/settings"
                      )}`}
                    >
                      <Settings size={18} className="ml-2" />
                      {!isCollapsed && (
                        <span className="ml-2 font-ubuntu">Settings</span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton> */}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Sign Out" : ""}
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  <div
                    className={`flex items-center py-2 px-3 rounded-xl w-full text-white hover:!text-muted-foreground ${
                      isPending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isPending ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-muted-foreground"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        {(mobile || !isCollapsed) && (
                          <span className="ml-2 font-ubuntu">
                            Signing out...
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <LogOut
                          size={18}
                          className={`${isCollapsed ? "" : "ml-2"}`}
                        />
                        {(mobile || !isCollapsed) && (
                          <span className="ml-2 font-ubuntu  ">Sign Out</span>
                        )}
                      </>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Divider />

        {isCollapsed ? (
          // When sidebar is collapsed — only show the icon centered
          <div className="flex justify-center mt-3 mb-3">
            <Coins className="text-white" size={20} />
          </div>
        ) : (
          // When sidebar is expanded — show full Ducks section
          <div className="mt-3 px-3 sm:px-4 py-2 flex flex-col items-center gap-1 w-full">
            {/* Title */}
            <div className="w-full flex flex-row items-center justify-between mx-auto">
              <h4 className="text-sm sm:text-base font-[400] text-white mb-1 text-center font-ubuntu flex items-center justify-center gap-2">
                <Coins size={18} className="ml-2" />
                <span>Ducks</span>
                {isBillingLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
                )}
              </h4>
            </div>

            {/* Progress Bar */}
            {!isBillingLoading && (
              <>
                <div className="w-[60vw] sm:w-[40vw] md:w-[20vw] lg:w-[12vw] bg-gray-700 rounded-full h-2 overflow-hidden mb-2 mx-auto">
                  <div
                    className="h-2 bg-[#3D30A1] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Remaining Info */}
                <span className="text-[10px] sm:text-xs text-gray-300 font-ubuntu flex w-[60vw] sm:w-[40vw] md:w-[20vw] lg:w-[12vw] items-center justify-start">
                  {usedDucks.toFixed(1)} used / {RemainingDucks.toFixed(1)}{" "}
                  remaining
                </span>
              </>
            )}
          </div>
        )}

        {/* Social Links at bottom */}
        <Divider />

        {!isCollapsed && (
          <div className="mt-5 px-4">
            <h4 className="text-xl font-medium text-white  mb-3 text-center font-ubuntu ">
              Our Socials
            </h4>
            <div className="flex items-center mt-4 gap-4 justify-center">
              <a
                href="https://www.instagram.com/disruptiveduckai/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-[28px] h-[28px] text-white hover:scale-125 transition-all duration-300" />
              </a>
              <a
                href="https://www.linkedin.com/company/disruptive-duck-lda/about/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-[32px] h-[32px] text-white hover:scale-125 transition-all duration-300" />
              </a>
              {/* <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-[28px] h-[28px] text-white hover:scale-125 transition-all duration-300 " />
              </a> */}
              <a
                href="https://www.facebook.com/people/Disruptive-Duck-AI/61577882027860/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-[28px] h-[28px] text-white hover:scale-125 transition-all duration-300 " />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (mobile) {
    return <div className="px-2 py-6">{sidebarContent}</div>;
  }

  return (
    <Sidebar
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-card  h-[100vh] my-auto mr-3 shadow-sm border border-border overflow-x-hidden **break-words**`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />
      <SidebarContent>{sidebarContent}</SidebarContent>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#3D30A1] to-transparent pointer-events-none " />
    </Sidebar>
  );
}
// let walkthroughShown = false;
export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  // Initialize sidebar state from localStorage, default to expanded if no value exists
  const initialSidebarState =
    localStorage.getItem(SIDEBAR_STATE_KEY) !== "collapsed";
  const isMobile = useIsMobile();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { showBackground } = useLayout();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // useEffect(() => {
  //   if (!user) return;
  //   if (!walkthroughShown) {
  //     if (user.isFirstLogin == true) {
  //       setRun(true);
  //       walkthroughShown = true;
  //     }
  //   }
  // }, [user]);

  useEffect(() => {
    setIsLayoutReady(true);
  }, []);

  return (
    <SidebarProvider defaultOpen={initialSidebarState}>
      {/* Welcome message overlay */}
      {/* {walkthroughShown && (
        <Walkthrough
          run={run}
          setRun={setRun}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
        />
      )} */}

      <div className="flex w-full h-screen bg-background transition-colors duration-300 overflow-hidden">
        {!isMobile && <DashboardSidebar />}

        {/* Use ScrollArea as the ONLY scroll container */}
        <ScrollArea className="flex-1 relative ">
          <div className="flex-1 flex flex-col  w-full h-full p-2 relative ">
            {showBackground && (
              <>
                {/* Top-left image */}
                <img
                  src={dashboardbgheader}
                  alt="top-left"
                  className="absolute top-0 left-0 w-[300px] h-auto object-contain  opacity-75 pointer-events-none select-none"
                />
                {/* Bottom-right image */}
                <img
                  src={dashboardbgbottom}
                  alt="bottom-right"
                  className="absolute bottom-0 right-0 w-[300px] h-auto object-contain opacity-75 pointer-events-none select-none "
                />
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full w-full flex flex-col "
            >
              {isMobile && (
                <div className="p-3 border-b flex justify-end">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 text-color border-white"
                      >
                        <Menu />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0">
                      <DashboardSidebar mobile={true} />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </ScrollArea>
      </div>
    </SidebarProvider>
  );
}
