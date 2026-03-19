import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock,      
  Filter,
  Search,
  FileText,
  PlayCircle,
  Music,
  MoreVertical,
  Loader2,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";

const ContentApproval = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const [materialsRes, pastPapersRes] = await Promise.all([
        api.get("/admin/materials"),
        api.get("/admin/past-papers")
      ]);
      
      const mats = (materialsRes.data || []).map((m: any) => ({ ...m, _table: 'materials' }));
      const papers = (pastPapersRes.data || []).map((p: any) => ({ ...p, _table: 'past_papers', type: 'Past Paper' }));
      
      setMaterials([...mats, ...papers]);
    } catch (err) {
      console.error("Fetch materials error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleToggleFlag = async (id: string, isFlagged: boolean, table: string = 'materials') => {
    try {
      const endpoint = table === 'past_papers' 
        ? `/admin/past-papers/${id}/${isFlagged ? 'unflag' : 'flag'}`
        : `/admin/materials/${id}/${isFlagged ? 'unflag' : 'flag'}`;
      
      await api.put(endpoint);
      toast.success(isFlagged ? "Content unflagged" : "Content flagged as inappropriate");
      fetchMaterials();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'Notes': return <FileText className="text-red-500" size={24} />;
        case 'Video': return <PlayCircle className="text-blue-500" size={24} />;
        case 'Audio': return <Music className="text-green-500" size={24} />;
        default: return <FileText className="text-primary" size={24} />;
    }
  };

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Content Moderation</h1>
            <p className="text-slate-500">Monitor and flag inappropriate learning materials. All materials are live by default.</p>
          </div>
          <div className="flex items-center gap-2">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search materials..." 
                      className="pl-10 w-[250px]" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No materials found.</p>
            ) : (
              <AnimatePresence>
                {filtered.map((req) => (
                    <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 bg-muted/40 rounded-lg">
                                {getIcon(req.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{req.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="font-medium text-foreground">{req.users?.name || "Unknown"}</span>
                                    <span>•</span>
                                    <span>{req.type}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <div className="flex items-center gap-2">
                                {req.is_flagged ? (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <AlertCircle size={12} /> Flagged
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                        <CheckCircle2 size={12} className="mr-1" /> Active
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button 
                                  variant={req.is_flagged ? "outline" : "destructive"} 
                                  size="sm" 
                                  className={!req.is_flagged ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : ""}
                                  onClick={() => handleToggleFlag(req.id, req.is_flagged, req._table)}
                                >
                                    {req.is_flagged ? (
                                        <><CheckCircle2 size={14} className="mr-1" /> Unflag</>
                                    ) : (
                                        <><XCircle size={14} className="mr-1" /> Flag</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
              </AnimatePresence>
            )}
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default ContentApproval;
