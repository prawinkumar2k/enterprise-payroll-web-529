import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Save, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DailyAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [attendanceData, setAttendanceData] = useState([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings/global', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(res => res.success ? res.data : {})
  });

  // Fetch daily attendance
  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ['attendance-daily', selectedDate, selectedCategory],
    queryFn: () => fetch(`/api/attendance/daily?date=${selectedDate}&category=${selectedCategory}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  // Update attendance mutation
  const updateMutation = useMutation({
    mutationFn: (data) => fetch('/api/attendance/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
      queryClient.invalidateQueries(['attendance-daily']);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update attendance",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (attendanceResponse?.data) {
      setAttendanceData(attendanceResponse.data);
    }
  }, [attendanceResponse]);

  const attendanceStatuses = settings?.attendance_status_codes?.split(',') || ['Present', 'Absent', 'CL', 'ML', 'OD', 'L', 'WO', 'H'];

  const handleStatusChange = (empno, status) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.EMPNO === empno ? { ...item, Status: status } : item
      )
    );
  };

  const handleRemarkChange = (empno, remark) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.EMPNO === empno ? { ...item, Remark: remark } : item
      )
    );
  };

  const handleSave = () => {
    const records = attendanceData.map(item => ({
      EMPNO: item.EMPNO,
      Status: item.Status,
      Remark: item.Remark,
      SNAME: item.SNAME,
      Designation: item.Designation
    }));

    updateMutation.mutate({ date: selectedDate, records });
  };

  const handleMarkAllPresent = () => {
    setAttendanceData(prev =>
      prev.map(item => ({ ...item, Status: 'Present', Remark: '' }))
    );
  };

  const handleCopyPreviousDay = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    try {
      const response = await fetch(`/api/attendance/daily?date=${prevDateStr}&category=${selectedCategory}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();

      if (data.data) {
        setAttendanceData(data.data);
        toast({
          title: "Success",
          description: "Previous day's attendance copied",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy previous day's attendance",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Present': return 'default';
      case 'Absent': return 'destructive';
      case 'CL': case 'ML': return 'secondary';
      case 'OD': return 'outline';
      case 'WO': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout activeRoute="attendance-daily">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Attendance</h1>
            <p className="text-muted-foreground">Mark and manage daily employee attendance</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Non-Teaching">Non-Teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleMarkAllPresent} variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Present
                </Button>
                <Button onClick={handleCopyPreviousDay} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Previous Day
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Employee Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading attendance data...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((employee) => (
                      <TableRow key={employee.EMPNO}>
                        <TableCell className="font-medium">{employee.EMPNO}</TableCell>
                        <TableCell>{employee.SNAME}</TableCell>
                        <TableCell>{employee.Designation}</TableCell>
                        <TableCell>{employee.Category}</TableCell>
                        <TableCell>
                          <Select
                            value={employee.Status || 'NOT_MARKED'}
                            onValueChange={(value) => handleStatusChange(employee.EMPNO, value === 'NOT_MARKED' ? '' : value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NOT_MARKED">Not Marked</SelectItem>
                              {attendanceStatuses.map(status => (
                                <SelectItem key={status} value={status}>
                                  <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={employee.Remark || ''}
                            onChange={(e) => handleRemarkChange(employee.EMPNO, e.target.value)}
                            placeholder="Optional remark"
                            className="w-40"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}