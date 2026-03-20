import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Image as ImageIcon,
  ArrowRight,
  GraduationCap,
  ChevronLeft,
  Settings
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";   
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Subject {
  id: string;
  name: string;
  code: string;
  image_url: string;
  created_at: string;
}

interface Grade {
  id: string;
  name: string;
  school_id: string;
}

interface Assignment {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  subjects?: Subject;
}

const Subjects = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    image_url: ""
  });
  const [uploading, setUploading] = useState(false);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/classes");
      setGrades(data || []);
    } catch (err) {
      console.error("Error fetching grades:", err);
      toast.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (gradeId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/teacher-assignments?class_id=${gradeId}`);
      setAssignments(data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error("Failed to load subjects for this grade");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const { data } = await api.get("/admin/subjects");
      setSubjects(data || []);
    } catch (err) {
      console.error("Error fetching all subjects:", err);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchAllSubjects();
  }, []);

  const handleGradeClick = (grade: Grade) => {
    setSelectedGrade(grade);
    fetchAssignments(grade.id);
  };

  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setAssignments([]);
    setSearchTerm("");
  };

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code || "",
        image_url: subject.image_url || ""
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        code: "",
        image_url: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let subjectId = "";
      if (editingSubject) {
        await api.put(`/admin/subjects/${editingSubject.id}`, formData);
        subjectId = editingSubject.id;
        toast.success("Subject updated successfully");
      } else {
        const { data } = await api.post("/admin/subjects", formData);
        subjectId = data.id || data[0]?.id; // Robust handling for both single and array returns
        // If we are in a grade view, automatically assign this subject to the grade
        if (selectedGrade) {
        await api.post("/admin/teacher-assignments", {
            class_id: selectedGrade.id,
            subject_id: subjectId,
            teacher_id: null
          });
          toast.success("Subject created and assigned to grade");
        } else {
          toast.success("Subject created successfully");
        }
      }
      
      if (selectedGrade) {
        fetchAssignments(selectedGrade.id);
      }
      fetchAllSubjects();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving subject:", error);
      toast.error(error.response?.data?.error || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from ${selectedGrade?.name}?`)) {
      try {
        await api.delete(`/admin/teacher-assignments/${assignmentId}`);
        toast.success("Subject removed from grade");
        if (selectedGrade) fetchAssignments(selectedGrade.id);
      } catch (error) {
        console.error("Error removing assignment:", error);
        toast.error("Failed to remove subject");
      }
    }
  };

  const filteredGrades = grades.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(a => 
    a.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subjects?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !selectedGrade && grades.length === 0) {
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
        className="p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {selectedGrade && (
                <Button variant="ghost" size="icon" onClick={handleBackToGrades} className="h-8 w-8 rounded-full">
                  <ChevronLeft size={18} />
                </Button>
              )}
              <h1 className="text-3xl font-bold tracking-tight">
                {selectedGrade ? `${selectedGrade.name} Subjects` : "Subject Management"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {selectedGrade 
                ? `Manage and view academic subjects assigned to ${selectedGrade.name}.` 
                : "Select a grade to manage its specific academic subjects."}
            </p>
          </div>
          {selectedGrade && (
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus size={18} /> Add Subject to {selectedGrade.name}
            </Button>
          )}
        </div>

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder={selectedGrade ? "Search subjects in this grade..." : "Search grades..."} 
            className="pl-10 h-11 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <AnimatePresence mode="wait">
          {!selectedGrade ? (
            <motion.div
              key="grades-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredGrades.length > 0 ? (
                filteredGrades.map((grade) => (
                  <Card 
                    key={grade.id} 
                    className="cursor-pointer group hover:border-primary/50 hover:shadow-lg transition-all border-primary/10 overflow-hidden"
                    onClick={() => handleGradeClick(grade)}
                  >
                    <div className="h-2 bg-primary/10 group-hover:bg-primary transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl font-bold">{grade.name}</CardTitle>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <GraduationCap size={20} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Grade</p>
                      <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View Subjects <ArrowRight size={14} className="ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <GraduationCap size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No grades found</h3>
                  <p className="text-muted-foreground">Go to Class Management to create your school's grades.</p>
                  <Link to="/admin/classes">
                    <Button variant="outline" className="mt-4">Go to Class Management</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="subjects-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {loading ? (
                <div className="col-span-full flex justify-center py-20">
                  <Loader2 className="animate-spin h-10 w-10 text-primary" />
                </div>
              ) : filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="overflow-hidden group hover:shadow-md transition-shadow border-primary/10">
                    <div className="h-40 bg-muted relative">
                      {assignment.subjects?.image_url ? (
                        <img src={assignment.subjects.image_url} alt={assignment.subjects.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <BookOpen size={48} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90" onClick={() => handleOpenModal(assignment.subjects)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteAssignment(assignment.id, assignment.subjects?.name || "")}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{assignment.subjects?.name}</CardTitle>
                          <CardDescription className="text-xs uppercase font-semibold text-primary">{assignment.subjects?.code}</CardDescription>
                        </div>
                        {assignment.teacher_id ? (
                           <Badge variant="secondary" className="text-[10px]">T-ASSIGNED</Badge>
                        ) : (
                           <Badge variant="outline" className="text-[10px] text-muted-foreground">NO TEACHER</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex gap-2">
                        <Link to={`/admin/subjects/${assignment.subject_id}`} className="flex-1">
                          <Button variant="outline" className="w-full gap-2 text-xs h-9">
                            Manage Content <ArrowRight size={14} />
                          </Button>
                        </Link>
                        <Link to={`/admin/assignments`}>
                          <Button variant="secondary" size="icon" className="h-9 w-9" title="Assign Teacher">
                            <Settings size={14} />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <BookOpen size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No subjects found for {selectedGrade.name}</h3>
                  <p className="text-muted-foreground">Start by adding a subject to this grade level.</p>
                  <Button onClick={() => handleOpenModal()} variant="outline" className="mt-4">
                    Add Subject
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
                {selectedGrade && !editingSubject && (
                  <p className="text-xs text-muted-foreground">This subject will be assigned to {selectedGrade.name}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Name</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Mathematics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Code</label>
                  <Input 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g. MATH-01"   
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Image</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="subject-image" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          const uploadData = new FormData();
                          uploadData.append('file', file);
                          try {
                            const { data } = await api.post('/upload', uploadData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            setFormData({...formData, image_url: data.url});
                            toast.success("Image uploaded");
                          } catch (err) {
                            toast.error("Upload failed");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                      <label 
                        htmlFor="subject-image" 
                        className="cursor-pointer flex items-center justify-center w-full h-10 border border-dashed rounded-lg text-xs font-medium hover:bg-muted/50 transition-colors"
                      >
                        {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : "Upload Subject Cover"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || uploading}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (editingSubject ? 'Update Subject' : 'Create Subject')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PortalLayout>
  );
};

export default Subjects;

