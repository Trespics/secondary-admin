import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Send, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTarget, setNewTarget] = useState("All");

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/admin/announcements");
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Fetch announcements error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
        toast.error("Please fill in all fields");
        return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/announcements", {
        title: newTitle,
        message: newContent,
        type: "general",
      });
      toast.success("Announcement broadcasted successfully!");
      setIsCreating(false);
      setNewTitle("");
      setNewContent("");
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAnn = async (id: string) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.info("Announcement removed");
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete announcement");
    }
  };

  if (loading) {
    return (
      <PortalLayout type="masomo">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Broadcasting</h1>
            <p className="text-muted-foreground">Manage school-wide announcements and targeted notifications.</p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <Plus size={18} /> New Announcement
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Panel */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="lg:col-span-1"
                    >
                        <Card className="border-primary/20 shadow-lg sticky top-6">
                            <CardHeader className="bg-primary/5 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Megaphone size={20} className="text-primary" /> New Broadcast
                                </CardTitle>
                                <CardDescription>Compose a message for your audience.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Headline</Label>
                                        <Input id="title" placeholder="Summary of the update..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Full Message</Label>
                                        <Textarea id="content" placeholder="Enter detailed announcement content..." className="min-h-[120px]" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>Cancel</Button>
                                        <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
                                          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                          {submitting ? "Sending..." : "Broadcast"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History List */}
            <div className={`${isCreating ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl mb-4 border border-dashed">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar size={18} /> Announcement History ({announcements.length})
                    </div>
                </div>

                {announcements.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No announcements yet. Create your first one!</p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {announcements.map((ann) => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card className="hover:border-primary/20 transition-all group shadow-sm">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="default" className="rounded-md">📢 Broadcast</Badge>
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                                      {new Date(ann.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{ann.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{ann.message}</p>
                                        </div>
                                        <div className="sm:w-20 flex flex-row sm:flex-col items-center justify-center p-4 gap-4 bg-muted/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => deleteAnn(ann.id)}><Trash2 size={18} /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                  </AnimatePresence>
                )}
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default Announcements;
