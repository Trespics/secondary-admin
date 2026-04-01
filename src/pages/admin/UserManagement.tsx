import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  FileUp,
  Download
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
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+254", country: "KE" },
  { code: "+255", country: "TZ" },
  { code: "+256", country: "UG" },
  { code: "+250", country: "RW" },
  { code: "+257", country: "BI" },
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+234", country: "NG" },
  { code: "+27", country: "ZA" },
];

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [importing, setImporting] = useState(false);
  const [countryCode, setCountryCode] = useState("+254");

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "12345678", phone: "", role: "student", student_id: "", parent_name: "", parent_contact: "", class_id: ""
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get("/admin/classes");
      setClasses(data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.password || !newUser.role) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (newUser.role !== "student" && !newUser.email) {
      toast.error("Email is required for teachers and admins.");
      return;
    }
    if (newUser.role === "student" && (!newUser.parent_name || !newUser.parent_contact)) {
      toast.error("Parent name and contact are required for students.");
      return;
    }
    setCreating(true);
    try {
      const payload = { ...newUser };
      if (payload.phone) payload.phone = `${countryCode}${payload.phone.replace(/^0+/, '')}`;
      if (payload.parent_contact) payload.parent_contact = `${countryCode}${payload.parent_contact.replace(/^0+/, '')}`;

      await api.post("/admin/users", payload);
      toast.success(`${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} created successfully!`);
      setIsCreateOpen(false);
      setNewUser({ name: "", email: "", password: "12345678", phone: "", role: "student", student_id: "", parent_name: "", parent_contact: "", class_id: "" });
      setShowPassword(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${id}`, { is_active: !currentStatus });
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update user");
    }
  };

  const handleBulkImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const usersToImport = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        if (values.length < headers.length) return null;
        
        const user: any = {};
        headers.forEach((h, i) => {
          user[h] = values[i];
        });
        return user;
      }).filter(u => u && u.name);

      if (usersToImport.length === 0) {
        toast.error("No valid user data found in CSV");
        return;
      }

      setImporting(true);
      try {
        const { data } = await api.post("/admin/users/bulk", { users: usersToImport });
        toast.success(data.message);
        fetchUsers();
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to import users");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Register and manage students, teachers, and administrators.</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBulkImport(file);
              }}
            />
            <Button 
              variant="outline" 
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={importing}
            >
              {importing ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
              Import CSV
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus size={18} /> Register New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register New User</DialogTitle>
                <DialogDescription>Create a new student or teacher account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={newUser.role} onValueChange={(val) => setNewUser({...newUser, role: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  {newUser.role !== "student" && (
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="john@school.com" />
                    </div>
                  )}
                  {newUser.role === "student" && (
                     <div className="space-y-2">
                      <Label>Registration ID (Auto if empty)</Label>
                      <Input value={newUser.student_id} onChange={(e) => setNewUser({...newUser, student_id: e.target.value})} placeholder="STD-2024-001" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={newUser.password} 
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                        placeholder="Min 6 characters" 
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {newUser.role !== "student" ? (
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_CODES.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.country} {c.code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input className="flex-1" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} placeholder="7XX XXX XXX" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Parent Name *</Label>
                      <Input value={newUser.parent_name} onChange={(e) => setNewUser({...newUser, parent_name: e.target.value})} placeholder="Jane Doe" />
                    </div>
                  )}
                </div>
                {newUser.role === "student" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Parent Contact (Phone) *</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_CODES.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.country} {c.code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input className="flex-1" value={newUser.parent_contact} onChange={(e) => setNewUser({...newUser, parent_contact: e.target.value})} placeholder="7XX XXX XXX" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Assign Grade/Class</Label>
                      <Select value={newUser.class_id} onValueChange={(val) => setNewUser({...newUser, class_id: val})}>
                        <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                        <SelectContent>
                          {classes.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating} className="gap-2">
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    {creating ? "Creating..." : "Register User"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-none mb-8">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                        placeholder="Search by name, email or ID..." 
                        className="pl-10 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[300px]">User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "No users matching your search." : "No users found. Register your first user!"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email || user.student_id || "No contact info"}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`
                                    ${user.role === 'admin' ? 'border-red-200 bg-red-50 text-red-700' : ''}
                                    ${user.role === 'teacher' ? 'border-purple-200 bg-purple-50 text-purple-700' : ''}
                                    ${user.role === 'student' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                                `}>
                                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{user.phone || "—"}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {user.is_active ? (
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    ) : (
                                        <XCircle size={16} className="text-muted-foreground" />
                                    )}
                                    <span className="text-sm">{user.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreVertical size={16} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="gap-2" onClick={() => handleToggleActive(user.id, user.is_active)}>
                                            <ShieldAlert size={14} /> {user.is_active ? 'Deactivate' : 'Activate'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                            <Trash2 size={14} /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

export default UserManagement;
