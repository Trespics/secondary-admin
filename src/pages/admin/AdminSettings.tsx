import React, { useState } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import { 
  Settings, 
  Shield, 
  Database, 
  Cloud, 
  Bell, 
  Save, 
  Lock,
  Globe,
  Palette,
  Server
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        toast.success("System configurations saved successfully!");
    }, 1200);
  };

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Configure global system parameters, security, and integration.</p>
            </div>
            <Button onClick={handleSave} className="gap-2 px-8" disabled={isSaving}>
                <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
        </div>

        <div className="space-y-8">
            {/* General Configurations */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe size={20} className="text-primary" /> General Config
                    </CardTitle>
                    <CardDescription>Basic system preferences and regional settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>System Name</Label>
                            <Input defaultValue="Florante CBC Management" />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="support@trespics.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Input defaultValue="Africa/Nairobi (GMT+3)" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Language</Label>
                            <Input defaultValue="English (Kenya)" readOnly />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security & Access */}
            <Card className="shadow-sm border-orange-200">
                <CardHeader className="bg-orange-50/50">
                    <CardTitle className="flex items-center gap-2">
                        <Shield size={20} className="text-orange-600" /> Security
                    </CardTitle>
                    <CardDescription>Control authentication and data protection.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Force Two-Factor Authentication (Admin)</p>
                            <p className="text-xs text-muted-foreground">Requires all administrators to use an OTP for login.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Auto-lock Inactive Sessions</p>
                            <p className="text-xs text-muted-foreground">Log out users after 30 minutes of inactivity.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Public Material Access</p>
                            <p className="text-xs text-muted-foreground">Allows guests to view 'Public' tagged materials without login.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* System Performance & Infrastructure */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server size={20} className="text-purple-600" /> Infrastructure
                    </CardTitle>
                    <CardDescription>Monitoring and external service connections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/40 rounded-lg flex items-center justify-between border border-dashed">
                        <div className="flex items-center gap-4 text-sm">
                            <Database className="text-muted-foreground" size={20} />
                            <div>
                                <p className="font-semibold">Supabase Connection</p>
                                <p className="text-xs text-green-600 font-medium">HEALTHY • v2.45.1</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Test Ping</Button>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-lg flex items-center justify-between border border-dashed">
                        <div className="flex items-center gap-4 text-sm">
                            <Cloud className="text-muted-foreground" size={20} />
                            <div>
                                <p className="font-semibold">Edge Functions (AI Grading)</p>
                                <p className="text-xs text-muted-foreground">IDLE • last used 4 hours ago</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Branding & Personalization */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette size={20} className="text-pink-600" /> Appearance
                    </CardTitle>
                    <CardDescription>Customize the look and feel of portals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between text-sm">
                        <p className="font-medium">Allow User Custom Themes</p>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                         <p className="font-medium">Compact Sidebar Mode</p>
                         <Switch />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Settings size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-primary italic">"System settings apply globally across Student and Teacher portals."</p>
                </div>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default AdminSettings;
