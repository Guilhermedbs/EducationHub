import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  lmsUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

const resourceSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["DOCUMENT", "PRESENTATION", "VIDEO", "LINK"]),
  url: z.string().url("URL inválida"),
  subjectId: z.string().uuid(),
});

interface Subject {
  id: string;
  name: string;
  description: string | null;
  lms_url: string | null;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  subject_id: string;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { name: string };
  subjects: { name: string };
}

export default function Teacher() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  // Subject form
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectLmsUrl, setSubjectLmsUrl] = useState("");
  
  // Resource form
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceType, setResourceType] = useState<"DOCUMENT" | "PRESENTATION" | "VIDEO" | "LINK">("DOCUMENT");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceSubjectId, setResourceSubjectId] = useState("");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.role === "TEACHER") {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      const [subjectsRes, resourcesRes, feedbackRes] = await Promise.all([
        supabase
          .from("subjects")
          .select("*")
          .eq("teacher_id", profile!.id)
          .order("name"),
        supabase
          .from("resources")
          .select("*")
          .eq("uploaded_by_id", profile!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("feedback")
          .select("*, profiles:profiles!feedback_student_id_fkey (name), subjects (name)")
          .eq("teacher_id", profile!.id)
          .order("created_at", { ascending: false }),
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
      if (resourcesRes.error) throw resourcesRes.error;
      if (feedbackRes.error) throw feedbackRes.error;

      setSubjects(subjectsRes.data || []);
      setResources(resourcesRes.data || []);
      setFeedbacks(feedbackRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      subjectSchema.parse({
        name: subjectName,
        description: subjectDescription,
        lmsUrl: subjectLmsUrl,
      });

      setLoading(true);

      const { error } = await supabase.from("subjects").insert({
        name: subjectName,
        description: subjectDescription || null,
        lms_url: subjectLmsUrl || null,
        teacher_id: profile!.id,
      });

      if (error) throw error;

      toast.success("Disciplina criada com sucesso!");
      setSubjectName("");
      setSubjectDescription("");
      setSubjectLmsUrl("");
      fetchData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao criar disciplina");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta disciplina?")) return;

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Disciplina excluída!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir disciplina");
      console.error(error);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      resourceSchema.parse({
        title: resourceTitle,
        description: resourceDescription,
        type: resourceType,
        url: resourceUrl,
        subjectId: resourceSubjectId,
      });

      setLoading(true);

      const { error } = await supabase.from("resources").insert({
        title: resourceTitle,
        description: resourceDescription || null,
        type: resourceType,
        url: resourceUrl,
        subject_id: resourceSubjectId,
        uploaded_by_id: profile!.id,
      });

      if (error) throw error;

      toast.success("Recurso criado com sucesso!");
      setResourceTitle("");
      setResourceDescription("");
      setResourceUrl("");
      setResourceSubjectId("");
      fetchData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao criar recurso");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este recurso?")) return;

    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      toast.success("Recurso excluído!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir recurso");
      console.error(error);
    }
  };

  if (profile?.role !== "TEACHER") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Acesso restrito a professores</p>
        </div>
      </div>
    );
  }

  const averageFeedback = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Área do Professor</h1>
          <p className="text-muted-foreground">
            Gerencie suas disciplinas, recursos e veja feedbacks dos alunos
          </p>
        </div>

        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subjects">Disciplinas</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nova Disciplina</CardTitle>
                <CardDescription>Crie uma nova disciplina para seus alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-name">Nome da Disciplina *</Label>
                    <Input
                      id="subject-name"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="Ex: Programação Web"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject-description">Descrição</Label>
                    <Textarea
                      id="subject-description"
                      value={subjectDescription}
                      onChange={(e) => setSubjectDescription(e.target.value)}
                      placeholder="Descreva a disciplina..."
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject-lms">URL do LMS Externo</Label>
                    <Input
                      id="subject-lms"
                      type="url"
                      value={subjectLmsUrl}
                      onChange={(e) => setSubjectLmsUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Disciplina
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minhas Disciplinas</CardTitle>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma disciplina criada ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{subject.name}</h4>
                          {subject.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {subject.description}
                            </p>
                          )}
                          {subject.lms_url && (
                            <a
                              href={subject.lms_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-1 block"
                            >
                              LMS: {subject.lms_url}
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Novo Recurso</CardTitle>
                <CardDescription>Adicione materiais para suas disciplinas</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resource-subject">Disciplina *</Label>
                    <Select value={resourceSubjectId} onValueChange={setResourceSubjectId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-title">Título *</Label>
                    <Input
                      id="resource-title"
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      placeholder="Ex: Aula 1 - Introdução"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-type">Tipo *</Label>
                    <Select value={resourceType} onValueChange={(v: any) => setResourceType(v)} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                        <SelectItem value="PRESENTATION">Apresentação</SelectItem>
                        <SelectItem value="VIDEO">Vídeo</SelectItem>
                        <SelectItem value="LINK">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-url">URL *</Label>
                    <Input
                      id="resource-url"
                      type="url"
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-description">Descrição</Label>
                    <Textarea
                      id="resource-description"
                      value={resourceDescription}
                      onChange={(e) => setResourceDescription(e.target.value)}
                      placeholder="Descreva o recurso..."
                      maxLength={500}
                    />
                  </div>

                  <Button type="submit" disabled={loading || subjects.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Recurso
                  </Button>
                  
                  {subjects.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Crie uma disciplina primeiro para adicionar recursos
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meus Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                {resources.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum recurso adicionado ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {resource.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {subjects.find((s) => s.id === resource.subject_id)?.name}
                            </span>
                          </div>
                          <h4 className="font-medium">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {resource.description}
                            </p>
                          )}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 block"
                          >
                            {resource.url}
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Feedbacks Recebidos</span>
                  <span className="text-lg">
                    Média Geral: {averageFeedback}{" "}
                    <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" />
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum feedback recebido ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-medium">{feedback.profiles.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              • {feedback.subjects.name}
                            </span>
                          </div>
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
                          <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
