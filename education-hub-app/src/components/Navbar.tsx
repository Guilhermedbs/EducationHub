import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, MessageSquare, User, LogOut, GraduationCap } from "lucide-react";

export function Navbar() {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <GraduationCap className="w-6 h-6" />
          <span>EducationHub</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/subjects">
            <Button variant="ghost" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Disciplinas</span>
            </Button>
          </Link>

          <Link to="/messages">
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </Button>
          </Link>

          {profile.role === "TEACHER" && (
            <Link to="/teacher">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Área do Professor</span>
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
