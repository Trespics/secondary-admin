import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  FileText, 
  ArrowLeft,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  ListTree,
  Target
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from 'dompurify';

interface Strand {
  id: string;
  name: string;
}

interface SubStrand {
  id: string;
  strand_id: string;
  name: string;
}

interface LearningOutcome {
  id: string;
  sub_strand_id: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}


const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "clean",
  "align",
  "script",
];

type ViewLevel = 'strands' | 'sub-strands' | 'learning-outcomes';

const SubjectContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('strands');
  
  const [strands, setStrands] = useState<Strand[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);
  
  const [subStrands, setSubStrands] = useState<SubStrand[]>([]);
  const [selectedSubStrand, setSelectedSubStrand] = useState<SubStrand | null>(null);
  
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'strand' | 'sub-strand' | 'lo'>('strand');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const fetchSubject = async () => {
    try {
      const { data } = await api.get(`/admin/subjects`);
      const current = (data || []).find((s: any) => s.id === id);
      setSubject(current);
    } catch (err) {
      console.error("Error fetching subject:", err);
    }
  };

  const fetchStrands = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cbc/strands?subject_id=${id}`);
      setStrands(data || []);
    } catch (err) {
      toast.error("Failed to load strands");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubStrands = async (strandId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cbc/sub-strands?strand_id=${strandId}`);
      setSubStrands(data || []);
    } catch (err) {
      toast.error("Failed to load sub-strands");
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningOutcomes = async (subStrandId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cbc/learning-outcomes?sub_strand_id=${subStrandId}`);
      setLearningOutcomes(data || []);
    } catch (err) {
      toast.error("Failed to load learning outcomes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubject();
    fetchStrands();
  }, [id]);

  const handleStrandClick = (strand: Strand) => {
    setSelectedStrand(strand);
    setViewLevel('sub-strands');
    fetchSubStrands(strand.id);
  };

  const handleSubStrandClick = (subStrand: SubStrand) => {
    setSelectedSubStrand(subStrand);
    setViewLevel('learning-outcomes');
    fetchLearningOutcomes(subStrand.id);
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    if (level === 'strands') {
      setSelectedStrand(null);
      setSelectedSubStrand(null);
      setViewLevel('strands');
      fetchStrands();
    } else if (level === 'sub-strands') {
      setSelectedSubStrand(null);
      setViewLevel('sub-strands');
      if (selectedStrand) fetchSubStrands(selectedStrand.id);
    }
  };

  const handleOpenModal = (type: 'strand' | 'sub-strand' | 'lo', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setFormData({
      name: item?.name || "",
      description: type === 'lo' ? (item?.description || "") : ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let endpoint = '';
      if (modalType === 'strand') endpoint = '/cbc/strands';
      else if (modalType === 'sub-strand') endpoint = '/cbc/sub-strands';
      else endpoint = '/cbc/learning-outcomes';

      const payload: any = { ...formData };
      if (modalType === 'strand') payload.subject_id = id;
      else if (modalType === 'sub-strand') payload.strand_id = selectedStrand?.id;
      else if (modalType === 'lo') payload.sub_strand_id = selectedSubStrand?.id;

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload);
        toast.success("Updated successfully");
      } else {
        await api.post(endpoint, payload);
        toast.success("Created successfully");
      }

      // Refresh current view
      if (viewLevel === 'strands') fetchStrands();
      else if (viewLevel === 'sub-strands') fetchSubStrands(selectedStrand!.id);
      else fetchLearningOutcomes(selectedSubStrand!.id);

      setIsModalOpen(false);    
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure? This will delete all child items as well.")) return;
    
    try {
      let endpoint = '';
      if (viewLevel === 'strands') endpoint = '/cbc/strands';
      else if (viewLevel === 'sub-strands') endpoint = '/cbc/sub-strands';
      else endpoint = '/cbc/learning-outcomes';

      await api.delete(`${endpoint}/${itemId}`);
      toast.success("Deleted successfully");
      
      if (viewLevel === 'strands') fetchStrands();
      else if (viewLevel === 'sub-strands') fetchSubStrands(selectedStrand!.id);
      else fetchLearningOutcomes(selectedSubStrand!.id);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin/subjects")} size="icon" className="rounded-full">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{subject?.name} Content</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleBreadcrumbClick('strands')}>Strands</span>
              {selectedStrand && (
                <>
                  <ChevronRight size={14} />
                  <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleBreadcrumbClick('sub-strands')}>{selectedStrand.name}</span>
                </>
              )}
              {selectedSubStrand && (
                <>
                  <ChevronRight size={14} />
                  <span>{selectedSubStrand.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {viewLevel === 'strands' && "Strands"}
              {viewLevel === 'sub-strands' && "Sub-strands"}
              {viewLevel === 'learning-outcomes' && "Learning Outcomes"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {viewLevel === 'strands' && "Manage main topic areas for this subject."}
              {viewLevel === 'sub-strands' && `Sub-topics for ${selectedStrand?.name}.`}
              {viewLevel === 'learning-outcomes' && `Define what students should achieve in ${selectedSubStrand?.name}.`}
            </p>
          </div>
          <Button onClick={() => handleOpenModal(viewLevel === 'strands' ? 'strand' : viewLevel === 'sub-strands' ? 'sub-strand' : 'lo')} className="gap-2">
            <Plus size={18} /> Add {viewLevel === 'strands' ? 'Strand' : viewLevel === 'sub-strands' ? 'Sub-strand' : 'Outcome'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viewLevel === 'strands' && strands.map(strand => (
              <Card key={strand.id} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden" onClick={() => handleStrandClick(strand)}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <LayoutGrid size={20} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenModal('strand', strand); }}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(strand.id); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">{strand.name}</CardTitle>
                  <div className="mt-4 flex items-center text-xs font-semibold text-primary uppercase tracking-wider">
                    View Sub-strands <ChevronRight size={14} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {viewLevel === 'sub-strands' && subStrands.map(sub => (
              <Card key={sub.id} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden" onClick={() => handleSubStrandClick(sub)}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <ListTree size={20} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenModal('sub-strand', sub); }}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">{sub.name}</CardTitle>
                  <div className="mt-4 flex items-center text-xs font-semibold text-primary uppercase tracking-wider">
                    View Learning Outcomes <ChevronRight size={14} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {viewLevel === 'learning-outcomes' && learningOutcomes.map(lo => (
              <Card key={lo.id} className="group border-l-4 border-l-green-500 hover:shadow-md transition-all w-96">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 shrink-0 mt-1">
                          <Target size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground mb-2">Learning Outcome</div>
                          <div className="prose max-w-none text-base font-medium" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lo.description || '') }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenModal('lo', lo)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(lo.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {((viewLevel === 'strands' && strands.length === 0) || 
              (viewLevel === 'sub-strands' && subStrands.length === 0) || 
              (viewLevel === 'learning-outcomes' && learningOutcomes.length === 0)) && !loading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Nothing found here</h3>
                <p className="text-muted-foreground">Start by adding content to this level.</p>
                <Button onClick={() => handleOpenModal(viewLevel === 'strands' ? 'strand' : viewLevel === 'sub-strands' ? 'sub-strand' : 'lo')} variant="outline" className="mt-4">
                  Add New Item
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-background rounded-xl shadow-2xl w-full ${modalType === 'lo' ? 'max-w-3xl' : 'max-w-md'} overflow-hidden`}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Edit ' : 'Add New '}
                {modalType === 'strand' ? 'Strand' : modalType === 'sub-strand' ? 'Sub-strand' : 'Learning Outcome'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {modalType !== 'lo' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={modalType === 'strand' ? "e.g. Numbers" : "e.g. Fractions"}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Outcome Description</label>
                    <div className="border rounded-lg overflow-hidden">
                      <ReactQuill
                        value={formData.description}
                        onChange={(value: string) => setFormData({ ...formData, description: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        className="min-h-[280px] h-72 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (editingItem ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PortalLayout>
  );
};

export default SubjectContent;
