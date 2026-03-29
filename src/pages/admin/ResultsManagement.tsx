import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Save, 
  Upload, 
  Loader2,
  FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const EXAM_TYPES = ["CAT 1", "CAT 2", "Mid Term", "End Term"];

const ResultsManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedExamType, setSelectedExamType] = useState("End Term");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Grid state: studentId -> subjectId -> { id?, score, remarks }
  const [gridData, setGridData] = useState<Record<string, Record<string, any>>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndGridData();
    } else {
      setStudents([]);
      setGridData({});
    }
  }, [selectedClass, selectedTerm, selectedExamType, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const [clsRes, subRes] = await Promise.all([
        api.get("/admin/classes"),
        api.get("/admin/subjects")
      ]);
      setClasses(clsRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      toast.error("Failed to load initial data");
    }
  };

  const fetchStudentsAndGridData = async () => {
    try {
      setLoading(true);
      // Fetch enrollments for the class
      const enrollRes = await api.get(`/admin/enrollments?class_id=${selectedClass}`);
      const enrolledStudents = (enrollRes.data || []).map((e: any) => ({
        id: e.users?.id || e.student_id,
        name: e.users?.name || 'Unknown'
      }));
      setStudents(enrolledStudents);

      // Fetch results
      const resRes = await api.get(`/admin/exam-results`, {
        params: {
          class_id: selectedClass,
          term: selectedTerm,
          exam_type: selectedExamType,
          year: selectedYear
        }
      });
      const fetchedResults = resRes.data || [];
      
      const newGrid: Record<string, Record<string, any>> = {};
      enrolledStudents.forEach((student: any) => {
        newGrid[student.id] = {};
        subjects.forEach((subj) => {
          newGrid[student.id][subj.id] = { score: "" };
        });
      });

      fetchedResults.forEach((r: any) => {
        if (newGrid[r.student_id] && newGrid[r.student_id][r.subject_id]) {
          newGrid[r.student_id][r.subject_id] = { id: r.id, score: r.score, remarks: r.remarks || "" };
        }
      });

      setGridData(newGrid);
    } catch (err) {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score: number) => {
    if (score >= 75) return "EE";
    if (score >= 50) return "ME";
    if (score >= 25) return "AE";
    return "BE";
  };

  const getOverallGrade = (studentId: string) => {
    if (!gridData[studentId]) return "";
    let total = 0;
    let count = 0;
    subjects.forEach(sub => {
       const score = parseFloat(gridData[studentId][sub.id]?.score);
       if (!isNaN(score)) {
         total += score;
         count++;
       }
    });
    if (count === 0) return "-";
    const avg = total / count;
    return `${avg.toFixed(1)} (${calculateGrade(avg)})`;
  };

  const handleScoreChange = (studentId: string, subjectId: string, val: string) => {
    setGridData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          score: val
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) return toast.error("Select a class first");
    
    const payload: any[] = [];
    Object.keys(gridData).forEach(studentId => {
      Object.keys(gridData[studentId]).forEach(subjectId => {
        const cell = gridData[studentId][subjectId];
        const scoreVal = parseFloat(cell.score);
        if (!isNaN(scoreVal)) {
          payload.push({
            id: cell.id, // for updates
            student_id: studentId,
            class_id: selectedClass,
            subject_id: subjectId,
            exam_type: selectedExamType,
            term: selectedTerm,
            year: parseInt(selectedYear),
            score: scoreVal,
            grade: calculateGrade(scoreVal),
            remarks: cell.remarks
          });
        }
      });
    });

    if (payload.length === 0) return toast.error("No valid scores to save");

    setSaving(true);
    try {
      await api.post("/admin/exam-results/bulk", { results: payload });
      toast.success("Results saved successfully");
      fetchStudentsAndGridData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/admin/exam-results/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Results imported successfully");
      fetchStudentsAndGridData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to import CSV");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
            <p className="text-muted-foreground">Enter or upload student marks across all subjects and grades.</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={handleCSVUpload}
            />
            <Button 
              variant="outline" 
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
              Import CSV
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving || students.length === 0}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Results
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-none mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Class / Grade</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input 
                type="number" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                min="2020" max="2100" 
              />
            </div>
          </CardContent>
        </Card>

        {!selectedClass ? (
          <div className="flex items-center justify-center p-12 bg-card border rounded-xl shadow-sm text-muted-foreground">
            Please select a class to view and enter results.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[200px] sticky left-0 z-10 bg-card">Student Name</TableHead>
                  {subjects.map(sub => (
                    <TableHead key={sub.id} className="min-w-[100px] text-center">{sub.name}</TableHead>
                  ))}
                  <TableHead className="min-w-[120px] text-right">Overall Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={subjects.length + 2} className="text-center py-8 text-muted-foreground">
                      No students enrolled in this class.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map(student => (
                    <TableRow key={student.id} className="hover:bg-muted/10">
                      <TableCell className="font-medium sticky left-0 z-10 bg-card shadow-[1px_0_0_0_#e5e7eb]">
                        {student.name}
                      </TableCell>
                      {subjects.map(sub => (
                        <TableCell key={sub.id} className="p-2">
                          <Input
                            type="number"
                            min="0" max="100"
                            className="h-8 w-full text-center"
                            placeholder="-"
                            value={gridData[student.id]?.[sub.id]?.score || ""}
                            onChange={(e) => handleScoreChange(student.id, sub.id, e.target.value)}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-bold">
                        {getOverallGrade(student.id)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default ResultsManagement;
