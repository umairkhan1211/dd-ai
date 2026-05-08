import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import mainLogo from "@/assets/Nav/mainLogo.png";

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // This is for demo purposes only - in a real app, use auth state
  const toggleAuth = () => setIsAuthenticated(!isAuthenticated);

  return (
    <header className="border-b border-white/15 bg-[#020103]">
      <div className="flex h-16 items-center justify-center px-4 md:px-6 notion-container">
        <div className="flex gap-12">
          <Link to="/" className="flex items-center gap-2 mr-6">
            {/* <div className="font-bold text-xl">Dev. Engine</div> */}
            <img src={mainLogo} alt="Main Logo" className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center justify-center gap-12 text-sm flex-1 text-white border border-white/15 rounded-3xl px-10 py-2 h-10 my-auto">
            <Link
              to="/"
              className="font-medium transition-colors hover:text-primary text-color"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              to="/about"
              className="font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              to="/pricing"
              className="font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button onClick={toggleAuth}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 pt-4">
              <Link
                to="/"
                className="font-medium transition-colors hover:text-primary text-color"
              >
                Home
              </Link>
              <Link
                to="/features"
                className="font-medium transition-colors hover:text-primary text-color"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="font-medium transition-colors hover:text-primary text-color"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="font-medium transition-colors hover:text-primary text-color"
              >
                About
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button onClick={toggleAuth} className="w-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="outline" className="w-full text-color border-white">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_1px_1px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.15)]
    hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[3px] border-white/50
    backdrop-blur-3xl">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
