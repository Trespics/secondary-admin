import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Save, 
  Lock,
  Camera,
  Loader2,
  Building
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const AdminProfile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
    position: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/admin/profile");
      setProfile(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        department: data.admin_details?.department || "",
        position: data.admin_details?.position || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/profile", form);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your administrative profile and security settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card className="text-center overflow-hidden">
                    <div className="h-24 bg-primary/10 w-full" />
                    <CardContent className="pt-0 -mt-12">
                        <div className="relative inline-block mb-4">
                            <Avatar className="h-24 w-24 border-4 border-background mx-auto">
                                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                    {profile?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90">
                                <Camera size={14} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold">{profile?.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{profile?.admin_details?.position || "Administrator"}</p>
                        <div className="flex flex-col gap-2 text-sm text-left border-t pt-4 mt-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail size={14} /> {profile?.email}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building size={14} /> {profile?.schools?.name}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <form onSubmit={handleUpdate}>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User size={18} className="text-primary" /> Administrative Details
                            </CardTitle>
                            <CardDescription>Update your personal and professional information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} />
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end">
                            <Button type="submit" disabled={saving} className="gap-2">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="border-red-100">
                    <form onSubmit={handleChangePassword}>
                        <CardHeader className="bg-red-50/50">
                            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                                <Lock size={18} /> Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end">
                            <Button type="submit" variant="destructive" disabled={changingPassword} className="gap-2">
                                {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default AdminProfile;
