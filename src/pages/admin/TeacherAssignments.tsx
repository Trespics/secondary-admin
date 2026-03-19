import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Users, 
  Map, 
  ChevronRight, 
  Search, 
  PlusCircle, 
  Trash2, 
  Loader2,
  BookOpen,
  School,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    class_id: "",
    subject_id: "",
    teacher_id: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes, subRes, userRes] = await Promise.all([
        api.get("/admin/teacher-assignments"),
        api.get("/admin/classes"),
        api.get("/admin/subjects"),
        api.get("/admin/users", { params: { role: 'teacher' } })
      ]);
      setAssignments(assignRes.data || []);
      setClasses(classRes.data || []);
      setSubjects(subRes.data || []);
      setTeachers(userRes.data || []);
    } catch (err) {
      toast.error("Failed to load assignment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.class_id || !newAssignment.subject_id) {
      toast.error("Class and subject are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/teacher-assignments", newAssignment);
      toast.success("Assignment saved successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to save assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/admin/teacher-assignments/${id}`);
      toast.success("Assignment removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove assignment");
    }
  };

  return (
    <PortalLayout type="masomo">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Teacher Assignments</h1>
          <p className="text-muted-foreground">Link teachers to specific subjects and classes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-lg h-fit rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon size={20} className="text-indigo-600" /> New Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssign} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Select Class</Label>
                  <Select value={newAssignment.class_id} onValueChange={v => setNewAssignment({...newAssignment, class_id: v})}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder="Choose a Class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Select Subject</Label>
                  <Select value={newAssignment.subject_id} onValueChange={v => setNewAssignment({...newAssignment, subject_id: v})}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder="Choose a Subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Assign Teacher</Label>
                  <Select value={newAssignment.teacher_id} onValueChange={v => setNewAssignment({...newAssignment, teacher_id: v})}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Unassigned</SelectItem>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button disabled={submitting} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold shadow-md rounded-xl mt-4">
                  {submitting ? <Loader2 className="animate-spin" /> : "Link Teacher to Subject"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-slate-50">
                <CardTitle>Currently Assigned</CardTitle>
                <CardDescription>View all active class-subject-teacher mappings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                 <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
               ) : assignments.length === 0 ? (
                 <div className="text-center py-20 text-muted-foreground">No assignments linked yet.</div>
               ) : (
                 <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Class</TableHead>
                            <TableHead className="font-bold text-slate-700">Subject</TableHead>
                            <TableHead className="font-bold text-slate-700">Teacher</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map(a => (
                            <TableRow key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-semibold">{a.classes?.name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">{a.subjects?.name}</Badge>
                                </TableCell>
                                <TableCell className="text-indigo-600 font-medium">{a.users?.name || "Unassigned"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(a.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default TeacherAssignments;
