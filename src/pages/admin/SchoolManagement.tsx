import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Save,
  Camera,
  Settings2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SchoolManagement = () => {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", phone: "", email: "", motto: "",
  });

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const { data } = await api.get("/admin/school");
        if (data) {
          setSchool(data);
          setForm({
            name: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            motto: data.motto || "",
          });
        }
      } catch (err) {
        console.error("Fetch school error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.put("/admin/school", form);
      setSchool(data);
      toast.success("School profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update school");
    } finally {
      setIsSaving(false);
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
        className="masomo-container p-6 max-w-5xl mx-auto"
      >
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">School Management</h1>
            <p className="text-muted-foreground">Manage your institution's profile, contact info, and system branding.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Branding Panel */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Institution Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="relative inline-block mx-auto">
                            <div className="h-32 w-32 rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed border-primary/20">
                                {school?.logo_url ? (
                                  <img src={school.logo_url} alt="Logo" className="h-full w-full object-cover rounded-2xl" />
                                ) : (
                                  <Building2 size={48} className="text-muted-foreground/40" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold">{school?.name || "Your School"}</h3>
                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{school?.motto || "Set your motto"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">General Information</CardTitle>
                        <CardDescription>These details will appear on student reports and the public portal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="sname">Institution Full Name</Label>
                                <Input id="sname" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Motto / Mission</Label>
                                <Textarea id="bio" className="min-h-[80px]" value={form.motto} onChange={(e) => setForm({...form, motto: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="semail">Contact Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <Input id="semail" className="pl-10" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sphone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <Input id="sphone" className="pl-10" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="loc">Address / Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <Input id="loc" className="pl-10" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" className="gap-2 px-8" disabled={isSaving}>
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isSaving ? "Saving..." : "Update Profile"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default SchoolManagement;
