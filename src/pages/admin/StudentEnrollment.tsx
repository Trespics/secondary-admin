import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Loader2,
  Filter,
  GraduationCap
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const StudentEnrollment = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [promoting, setPromoting] = useState(false);
  
  const [enrollmentForm, setEnrollmentForm] = useState({
    student_id: "",
    class_id: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollRes, classRes, userRes] = await Promise.all([
        api.get("/admin/enrollments"),
        api.get("/admin/classes"),
        api.get("/admin/users", { params: { role: 'student' } })
      ]);
      setEnrollments(enrollRes.data || []);
      setClasses(classRes.data || []);
      setStudents(userRes.data || []);
    } catch (err) {
      toast.error("Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentForm.student_id || !enrollmentForm.class_id) {
      toast.error("Student and class are required");
      return;
    }
    try {
      await api.post("/admin/enrollments", enrollmentForm);
      toast.success("Student enrolled successfully");
      fetchData();
    } catch (err) {
      toast.error("Enrollment failed");
    }
  };

  const handleUnenroll = async (id: string) => {
    try {
      await api.delete(`/admin/enrollments/${id}`);
      toast.success("Student unenrolled");
      fetchData();
    } catch (err) {
      toast.error("Failed to unenroll student");
    }
  };

  const handlePromoteAll = async () => {
    if (!confirm("Are you sure you want to promote ALL students to their next grade? This action should typically be done once a year.")) return;
    
    try {
      setPromoting(true);
      const res = await api.post("/admin/enrollments/promote-all");
      toast.success(`${res.data.promotedCount} students promoted!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  const filteredEnrollments = selectedClass === "all" 
    ? enrollments 
    : enrollments.filter(e => e.class_id === selectedClass);

  return (
    <PortalLayout type="masomo">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Enrollment</h1>
            <p className="text-muted-foreground">Admit students into grades and manage class lists.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handlePromoteAll} 
            disabled={promoting}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2 h-11 px-6 rounded-xl shadow-sm"
          >
            {promoting ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />}
            Promote All Students
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <Card className="lg:col-span-1 border-none shadow-lg h-fit rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><UserPlus size={20} className="text-indigo-600" /> New Enrollment</CardTitle>
             </CardHeader>
             <CardContent>
                <form onSubmit={handleEnroll} className="space-y-5">
                   <div className="space-y-2">
                     <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Student</Label>
                     <Select value={enrollmentForm.student_id} onValueChange={v => setEnrollmentForm({...enrollmentForm, student_id: v})}>
                        <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Select Student" /></SelectTrigger>
                        <SelectContent>
                           {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}
                        </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Target Class</Label>
                     <Select value={enrollmentForm.class_id} onValueChange={v => setEnrollmentForm({...enrollmentForm, class_id: v})}>
                        <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Select Grade" /></SelectTrigger>
                        <SelectContent>
                           {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                     </Select>
                   </div>
                   <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold shadow-md rounded-xl mt-4">Enroll Now</Button>
                </form>
             </CardContent>
           </Card>

           <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="flex-1 relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input placeholder="Filter list..." className="pl-10 h-10 rounded-xl" />
                 </div>
                 <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
              </div>

              <Card className="border-none shadow-sm rounded-2xl">
                 <CardContent className="p-0">
                    {loading ? (
                      <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
                    ) : (
                      <Table>
                        <TableHeader>
                           <TableRow className="bg-slate-50/50">
                             <TableHead className="font-bold">Student Name</TableHead>
                             <TableHead className="font-bold">Enrolled Class</TableHead>
                             <TableHead className="text-right">Action</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredEnrollments.length === 0 ? (
                             <TableRow><TableCell colSpan={3} className="text-center py-20 text-muted-foreground">No students enrolled matching filter.</TableCell></TableRow>
                           ) : (
                             filteredEnrollments.map(e => (
                               <TableRow key={e.id} className="hover:bg-slate-50/50 transition-colors">
                                 <TableCell className="font-bold text-slate-900">{e.users?.name}</TableCell>
                                 <TableCell>
                                    <Badge className="bg-indigo-50 text-indigo-700 border-none px-3">{e.classes?.name}</Badge>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleUnenroll(e.id)} className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded-full">
                                       <Trash2 size={16} />
                                    </Button>
                                 </TableCell>
                               </TableRow>
                             ))
                           )}
                        </TableBody>
                      </Table>
                    )}
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default StudentEnrollment;
