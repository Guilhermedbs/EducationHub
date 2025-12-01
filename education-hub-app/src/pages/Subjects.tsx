import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  lms_url: string | null;
  teacher_id: string;
  profiles: {
    name: string;
  };
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select(`
          *,
          profiles:profiles!subjects_teacher_id_fkey (name)
        `)
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar disciplinas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Disciplinas</h1>
          <p className="text-muted-foreground">
            Navegue pelas disciplinas disponíveis e acesse os materiais
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando disciplinas...</div>
        ) : subjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma disciplina cadastrada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span>{subject.name}</span>
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                  </CardTitle>
                  <CardDescription>
                    Professor: {subject.profiles.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subject.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {subject.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Link to={`/subjects/${subject.id}`} className="flex-1">
                      <Button className="w-full">Ver detalhes</Button>
                    </Link>
                    
                    {subject.lms_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(subject.lms_url!, "_blank")}
                        title="Abrir LMS externo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
