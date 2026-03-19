import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  ListTree,
  Target,
  ChevronDown,
  ChevronRight,
  Database,
  UploadCloud,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CBCCurriculum = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [strands, setStrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedStrand, setExpandedStrand] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get("/admin/subjects");
      setSubjects(data || []);
      if (data?.length > 0) setSelectedSubject(data[0].id);
    } catch (err) {
      toast.error("Failed to load subjects");
    }
  };

  const fetchStrands = async (subjectId: string) => {
    if (!subjectId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/strands`, { params: { subject_id: subjectId } });
      setStrands(data || []);
    } catch (err) {
      toast.error("Failed to load strands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) fetchStrands(selectedSubject);
  }, [selectedSubject]);

  return (
    <PortalLayout type="masomo">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CBC Curriculum Framework</h1>
            <p className="text-muted-foreground">Manage the hierarchy of Strands, Sub-strands and Learning Outcomes.</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-11 shadow-md font-bold px-6 rounded-xl">
            <UploadCloud size={20} /> Bulk Import Curriculum
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 border-r border-slate-100 pr-4">
                <Card className="border-none shadow-sm bg-slate-50/50">
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Select Subject</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1">
                        {subjects.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSubject(s.id)}
                                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                                    selectedSubject === s.id 
                                    ? "bg-indigo-600 text-white shadow-lg font-bold" 
                                    : "hover:bg-indigo-50 text-slate-600"
                                }`}
                            >
                                <span className="truncate">{s.name}</span>
                                {selectedSubject === s.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                    <Badge className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full border-none font-bold">
                        {subjects.find(s => s.id === selectedSubject)?.name || "Select a subject"}
                    </Badge>
                    <Button variant="outline" className="border-indigo-200 text-indigo-600 gap-2 font-bold h-10 px-4 rounded-xl">
                        <Plus size={18} /> Add New Strand
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : strands.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                        <Layers size={48} className="mx-auto text-muted-foreground opacity-10 mb-4" />
                        <h3 className="font-bold text-slate-400">No Strands defined for this subject</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {strands.map(strand => (
                            <StrandAccordion key={strand.id} strand={strand} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </PortalLayout>
  );
};

const StrandAccordion = ({ strand }: { strand: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [subStrands, setSubStrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSubStrands = async () => {
        if (!isOpen) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/admin/sub-strands`, { params: { strand_id: strand.id } });
            setSubStrands(data || []);
        } catch (err) {
            toast.error("Failed to load sub-strands");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchSubStrands();
    }, [isOpen]);

    return (
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors bg-white font-bold text-lg text-slate-800"
            >
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <ListTree size={16} />
                    </div>
                    {strand.name}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">Strand</div>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-50"
                    >
                        <div className="p-5 space-y-4 bg-slate-50/30">
                            {loading ? (
                                <Loader2 className="animate-spin text-indigo-400 mx-auto" />
                            ) : subStrands.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-400">No sub-strands defined</div>
                            ) : (
                                subStrands.map(ss => (
                                    <SubStrandItem key={ss.id} subStrand={ss} />
                                ))
                            )}
                            <Button variant="ghost" size="sm" className="w-full border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl mt-2">
                                <Plus size={14} /> Add Sub-Strand
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

const SubStrandItem = ({ subStrand }: { subStrand: any }) => {
    const [outcomes, setOutcomes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOutcomes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/admin/learning-outcomes`, { params: { sub_strand_id: subStrand.id } });
            setOutcomes(data || []);
        } catch (err) { } finally { setLoading(false); }
    };

    useEffect(() => { fetchOutcomes(); }, []);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">{subStrand.name}</h4>
                    <p className="text-xs text-slate-500">{subStrand.description || "No description provided."}</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-tighter text-indigo-400 border-indigo-100">SUB-STRAND</Badge>
            </div>
            
            <div className="space-y-2 pl-4 border-l-2 border-indigo-100">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mb-2">
                    <Target size={10} /> Learning Outcomes
                </h5>
                {loading ? <Loader2 size={12} className="animate-spin" /> : outcomes.map(o => (
                    <div key={o.id} className="text-sm text-slate-600 flex items-start gap-2 group">
                        <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 shrink-0" />
                        <span>{o.description}</span>
                    </div>
                ))}
                <button className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1 mt-1">
                    <Plus size={10} /> Add Outcome
                </button>
            </div>
        </div>
    );
};

export default CBCCurriculum;
