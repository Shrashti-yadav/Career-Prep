import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, X, Sparkles, User, LogOut } from "lucide-react";
import { logout, reset } from "../features/auth/authSlice";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navClass = (path) =>
    `px-5 py-3 rounded-lg transition-all duration-200 text-sm font-semibold ${
      isActive(path)
        ? "text-primary bg-accent"
        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CareerPrep AI
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/" className={navClass("/")}>Home</Link>
            <Link to="/dashboard" className={navClass("/dashboard")}>Dashboard</Link>
            <Link to="/resume-analysis" className={navClass("/resume-analysis")}>Resume Analysis</Link>
            <Link to="/revision" className={navClass("/revision")}>Revision Notes</Link>
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4">

            {user && (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}

            {/* MOBILE MENU */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-lg hover:bg-accent"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden py-5 space-y-3 border-t border-border/40">
            <Link to="/" className={navClass("/")} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/dashboard" className={navClass("/dashboard")} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            <Link to="/resume-analysis" className={navClass("/resume-analysis")} onClick={() => setIsMenuOpen(false)}>Resume Analysis</Link>
            <Link to="/revision" className={navClass("/revision")} onClick={() => setIsMenuOpen(false)}>Revision Notes</Link>

            {user && (
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 font-semibold"
              >
                Logout
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;