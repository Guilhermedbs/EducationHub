import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Presentation, Video, Link as LinkIcon, Star, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

interface Subject {
  id: string;
  name: string;
  description: string | null;
  lms_url: string | null;
  teacher_id: string;
  profiles: { name: string; id: string };
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: "DOCUMENT" | "PRESENTATION" | "VIDEO" | "LINK";
  url: string;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { name: string };
}

const resourceIcons = {
  DOCUMENT: FileText,
  PRESENTATION: Presentation,
  VIDEO: Video,
  LINK: LinkIcon,
};

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubjectData();
    }
  }, [id]);

  const fetchSubjectData = async () => {
    try {
      const [subjectRes, resourcesRes, feedbackRes] = await Promise.all([
        supabase
          .from("subjects")
          .select("*, profiles:profiles!subjects_teacher_id_fkey (name, id)")
          .eq("id", id!)
          .single(),
        supabase
          .from("resources")
          .select("*")
          .eq("subject_id", id!)
          .order("created_at", { ascending: false }),
        supabase
          .from("feedback")
          .select("*, profiles:profiles!feedback_student_id_fkey (name)")
          .eq("subject_id", id!)
          .order("created_at", { ascending: false }),
      ]);

      if (subjectRes.error) throw subjectRes.error;
      if (resourcesRes.error) throw resourcesRes.error;
      if (feedbackRes.error) throw feedbackRes.error;

      setSubject(subjectRes.data);
      setResources(resourcesRes.data || []);
      setFeedbacks(feedbackRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || profile.role !== "STUDENT") {
      toast.error("Apenas alunos podem enviar feedback");
      return;
    }

    if (rating === 0) {
      toast.error("Por favor, selecione uma nota");
      return;
    }

    try {
      feedbackSchema.parse({ rating, comment });
      setSubmitting(true);

      const { error } = await supabase.from("feedback").insert({
        student_id: profile.id,
        subject_id: id!,
        teacher_id: subject?.teacher_id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success("Feedback enviado com sucesso!");
      setRating(0);
      setComment("");
      fetchSubjectData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao enviar feedback");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const groupedResources = {
    DOCUMENT: resources.filter((r) => r.type === "DOCUMENT"),
    PRESENTATION: resources.filter((r) => r.type === "PRESENTATION"),
    VIDEO: resources.filter((r) => r.type === "VIDEO"),
    LINK: resources.filter((r) => r.type === "LINK"),
  };

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">Carregando...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Disciplina não encontrada</p>
          <Link to="/subjects">
            <Button className="mt-4">Voltar para disciplinas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/subjects">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
              <p className="text-muted-foreground">Professor: {subject.profiles.name}</p>
            </div>
            {subject.lms_url && (
              <Button
                variant="outline"
                onClick={() => window.open(subject.lms_url!, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir LMS
              </Button>
            )}
          </div>
          
          {subject.description && (
            <p className="text-muted-foreground">{subject.description}</p>
          )}
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            {Object.entries(groupedResources).map(([type, items]) => {
              if (items.length === 0) return null;
              const Icon = resourceIcons[type as keyof typeof resourceIcons];
              
              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {type === "DOCUMENT" && "Documentos"}
                      {type === "PRESENTATION" && "Apresentações"}
                      {type === "VIDEO" && "Vídeos"}
                      {type === "LINK" && "Links"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {resource.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            Abrir
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {resources.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum recurso disponível ainda
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {profile?.role === "STUDENT" && (
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Feedback</CardTitle>
                  <CardDescription>
                    Avalie esta disciplina e deixe um comentário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nota (1 a 5)</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                value <= rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comment">Comentário (opcional)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Deixe seu comentário sobre a disciplina..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                      />
                    </div>

                    <Button type="submit" disabled={submitting || rating === 0}>
                      {submitting ? "Enviando..." : "Enviar Feedback"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Feedbacks dos Alunos</span>
                  <span className="text-lg">
                    Média: {averageRating} <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" />
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbacks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum feedback ainda
                  </p>
                ) : (
                  feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{feedback.profiles.name}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {feedback.comment && (
                        <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
