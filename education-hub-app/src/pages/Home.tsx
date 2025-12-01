import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageSquare, Star, GraduationCap } from "lucide-react";

export default function Home() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-6 rounded-full">
              <GraduationCap className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bem-vindo ao EducationHub
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {profile?.role === "TEACHER"
              ? `Olá, Professor ${profile.name}! Gerencie suas disciplinas e recursos educacionais.`
              : `Olá, ${profile?.name}! Acesse materiais de estudo e interaja com seus professores.`}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-all hover:scale-105">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Disciplinas</CardTitle>
              <CardDescription>
                {profile?.role === "TEACHER"
                  ? "Crie e gerencie suas disciplinas"
                  : "Acesse materiais das disciplinas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/subjects">
                <Button className="w-full">Acessar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:scale-105">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Mensagens</CardTitle>
              <CardDescription>
                Converse com professores e alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/messages">
                <Button className="w-full">Abrir</Button>
              </Link>
            </CardContent>
          </Card>

          {profile?.role === "TEACHER" ? (
            <Card className="hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Área do Professor</CardTitle>
                <CardDescription>
                  Gerencie recursos e veja feedbacks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/teacher">
                  <Button className="w-full">Acessar</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>
                  Avalie disciplinas e professores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/subjects">
                  <Button className="w-full">Dar Feedback</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Sobre o EducationHub</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Uma plataforma completa para gestão de conteúdo educacional, facilitando a
                comunicação entre professores e alunos, organização de materiais didáticos e
                coleta de feedback.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 pt-4">
                <div>
                  <h4 className="font-semibold mb-2">📚 Organização</h4>
                  <p className="text-sm text-muted-foreground">
                    Materiais bem organizados por disciplina e tipo
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">💬 Comunicação</h4>
                  <p className="text-sm text-muted-foreground">
                    Chat direto entre professores e alunos
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⭐ Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistema de avaliação e comentários
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
