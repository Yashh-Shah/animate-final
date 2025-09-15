import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Sparkles, Bell, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AnalyzerForm from "@/components/app/AnalyzerForm";

export function Navbar() {
  const { pathname } = useLocation();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const cls = document.documentElement.classList;
    if (dark) cls.add("dark"); else cls.remove("dark");
  }, [dark]);

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link to={to} className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === to ? "bg-secondary text-foreground" : "text-foreground/80 hover:text-foreground"}`}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="text-primary" />
          <span>Sentinel Guard</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" label="Dashboard" />
          <NavLink to="/incidents" label="Incidents" />
          <NavLink to="/learn" label="Learn" />
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="alerts">
            <Bell />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="toggle theme">
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="hidden sm:inline-flex transition-transform hover:-translate-y-0.5 hover:scale-[1.02]"><Sparkles className="mr-2"/>Scan Now</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Scan Content</DialogTitle>
              </DialogHeader>
              <AnalyzerForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
