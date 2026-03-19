import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  BookOpen,
  UserCheck,
  MoreVertical,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ClassManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState(0);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/classes");
      setClasses(res.data || []);
    } catch (err) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      setCreating(true);

      await api.post("/admin/classes", { name: newClassName, grade_level: newGradeLevel });

      toast.success("Class created successfully");
      setIsAdding(false);
      setNewClassName("");
      setNewGradeLevel(0);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to create class");
    } finally {
      setCreating(false);
    }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editingClass.name.trim()) return;

    try {
      setUpdating(true);

      await api.put(`/admin/classes/${editingClass.id}`, {
        name: editingClass.name,
        grade_level: editingClass.grade_level,
      });

      toast.success("Class updated successfully");
      setEditingClass(null);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to update class");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove all enrollments for this class.")) return;

    try {
      setDeletingId(id);

      await api.delete(`/admin/classes/${id}`);

      toast.success("Class deleted");
      fetchClasses();
    } catch (err) {
      toast.error("Failed to delete class");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout type="masomo">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
            <p className="text-muted-foreground">Define and manage Grades/Classes (e.g., Grade 1, Grade 4).</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-11 px-6 rounded-xl shadow-md">
            <PlusCircle size={20} /> Add New Grade/Class
          </Button>
        </div>

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search classes..."
            className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 rounded-xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <Card className="border-dashed py-20 text-center">
            <GraduationCap size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No Classes Found</h3>
            <p className="text-muted-foreground text-sm">Start by adding your school's classes or grade levels.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((c) => (
              <Card key={c.id} className="group hover:border-indigo-200 transition-all border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 flex flex-row justify-between items-center py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{c.name}</CardTitle>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">ACTIVE</Badge>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 border-none">Level {c.grade_level}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setEditingClass(c)} className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"><Edit2 size={14} /></Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c.id)}
                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500 flex items-center gap-1.5"><UserCheck size={14} /> Students</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">{c.student_count || 0} Enrolled</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500 flex items-center gap-1.5"><BookOpen size={14} /> Subjects</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">{c.subject_count || 0} Assigned</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-indigo-950">Add Grade/Class</DialogTitle>
              <DialogDescription>Enter the official name for this teaching unit.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Class Name</Label>
                <Input
                  placeholder="e.g. Grade 1, Baby Class, Form 4 East"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Grade Level (for promotion order)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1, 2, 3"
                  value={newGradeLevel}
                  onChange={e => setNewGradeLevel(parseInt(e.target.value) || 0)}
                  className="h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent rounded-xl"
                />
                <p className="text-[10px] text-slate-400 tracking-tight">Lower levels are promoted to higher levels (e.g., Level 1 → Level 2).</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl h-11">Cancel</Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 h-11 font-bold shadow-md"
                >
                  {creating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    "Create Class"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
          <DialogContent className="rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-indigo-950">Edit Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Class Name</Label>
                <Input
                  value={editingClass?.name || ""}
                  onChange={e => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Grade Level</Label>
                <Input
                  type="number"
                  value={editingClass?.grade_level || 0}
                  onChange={e => setEditingClass({ ...editingClass, grade_level: parseInt(e.target.value) || 0 })}
                  className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingClass(null)} className="rounded-xl h-11">Cancel</Button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 h-11 font-bold shadow-md"
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default ClassManagement;
