import React from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Trophy,
  Calendar,
  Filter,
  PieChart as PieChartIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from "recharts";

const performanceData = [
  { name: "Grade 1", score: 78 },
  { name: "Grade 2", score: 82 },
  { name: "Grade 3", score: 75 },
  { name: "Grade 4", score: 88 },
  { name: "Grade 5", score: 81 },
  { name: "Grade 6", score: 85 },
  { name: "Grade 7", score: 79 },
];

const attendanceData = [
  { name: "Mon", rate: 94 },
  { name: "Tue", rate: 96 },
  { name: "Wed", rate: 92 },
  { name: "Thu", rate: 95 },
  { name: "Fri", rate: 89 },
];

const subjectDistribution = [
  { name: "Math", value: 400 },
  { name: "English", value: 300 },
  { name: "Science", value: 300 },
  { name: "Social", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SystemReports = () => {
  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
            <p className="text-muted-foreground">Aggregated analytics across grades, subjects, and teacher activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar size={18} /> Last 30 Days
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Download size={18} /> Export Data
            </Button>
          </div>
        </div>

        {/* Top Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Trophy size={32} className="opacity-80" />
                        <div>
                            <p className="text-sm opacity-80 uppercase font-bold tracking-tighter">Top Class</p>
                            <h2 className="text-2xl font-bold">Grade 4 West</h2>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <TrendingUp size={32} className="text-green-600" />
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Avg. Score</p>
                            <h2 className="text-2xl font-bold">81.4%</h2>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Users size={32} className="text-blue-600" />
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Attendance</p>
                            <h2 className="text-2xl font-bold">92.8%</h2>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <BookOpen size={32} className="text-purple-600" />
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Submissions</p>
                            <h2 className="text-2xl font-bold">4.2k</h2>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Academic Performance Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Academic Performance</CardTitle>
                    <CardDescription>Average score distribution across all grades.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Attendance Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Attendance Trends</CardTitle>
                    <CardDescription>Monitored attendance rates for the current week.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceData}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Subject Enrollment */}
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Material Engagement</CardTitle>
                    <CardDescription>Distribution of materials by category.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subjectDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {subjectDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>

             {/* Recent Exports */}
             <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Generated Reports</CardTitle>
                        <CardDescription>Log of school-wide data exports.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-md text-muted-foreground">
                                        <BarChart3 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Term 1 Performance Analysis</p>
                                        <p className="text-xs text-muted-foreground">Generated by Admin on March 1{i}, 2024</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8">Download</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
             </Card>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default SystemReports;
