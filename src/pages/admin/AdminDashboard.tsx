import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalClasses: 0, pendingMaterials: 0 });
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, materialsRes, logsRes] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/materials"),
          api.get("/admin/activity-logs"),
        ]);
        setStats(statsRes.data);
        setPendingApprovals((materialsRes.data || []).filter((m: any) => !m.is_public).slice(0, 5));
        setActivityLogs((logsRes.data || []).slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: "Total Students", value: (stats?.totalStudents || 0).toLocaleString(), icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Teachers", value: (stats?.totalTeachers || 0).toLocaleString(), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Active Classes", value: (stats?.totalClasses || 0).toLocaleString(), icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
    { title: "Pending Content", value: (stats?.pendingMaterials || 0).toLocaleString(), icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
  ];

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
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || "Admin"}. Monitor and manage school-wide activities.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/users">
              <Button variant="outline" className="gap-2">
                <Plus size={18} /> Add User
              </Button>
            </Link>
            <Link to="/admin/notifications">
              <Button className="gap-2">
                <FileCheck size={18} /> New Announcement
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Approvals */}
            <Card className="lg:col-span-1 shadow-sm border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Content Approval</CardTitle>
                        <CardDescription>Verify materials uploaded by teachers.</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                        {pendingApprovals.length} Pending
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingApprovals.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No pending content to review.</p>
                        ) : (
                          pendingApprovals.map((item: any) => (
                            <div key={item.id} className="group p-3 rounded-lg border hover:bg-muted/30 transition-colors flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 className="font-medium text-sm">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{item.users?.name || "Unknown"} • {item.type}</p>
                                </div>
                                <ArrowUpRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        )}
                    </div>
                    <Link to="/admin/content">
                      <Button variant="ghost" className="w-full mt-4 text-primary text-xs h-8">Review All Materials</Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card className="lg:col-span-2 shadow-sm border-primary/10">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Real-time updates of system-wide actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {activityLogs.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No recent activity logs.</p>
                        ) : (
                          activityLogs.map((log: any) => (
                            <div key={log.id} className="flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.users?.name || "System"}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">
                                      {new Date(log.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                          ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default AdminDashboard;
