import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import Pagination from "../components/Pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;
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
  const { data: attendanceResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['attendance-daily', selectedDate, selectedCategory],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/daily?date=${selectedDate}&category=${selectedCategory}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }
      return res.json();
    },
    retry: 1,
    retryDelay: 1000,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing API response to local state is intentional
      setAttendanceData(attendanceResponse.data);
      setCurrentPage(1);
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
    } catch {
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
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label htmlFor="att-date" className="text-sm font-medium">Date</label>
                <Input
                  id="att-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[180px]">
                <label htmlFor="att-category" className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Non-Teaching">Non-Teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <Button onClick={handleMarkAllPresent} variant="outline" size="sm">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Mark All Present
                </Button>
                <Button onClick={handleCopyPreviousDay} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy Previous Day
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} size="sm">
                  <Save className="w-4 h-4 mr-1.5" />
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
              <div className="text-center py-12 space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading attendance data...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <span className="text-red-500 text-xl">!</span>
                </div>
                <p className="font-semibold text-red-600">Failed to load attendance data</p>
                <p className="text-sm text-muted-foreground">{error?.message || 'Server not responding'}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
                >
                  Retry
                </button>
              </div>
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
                    {attendanceData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((employee) => (
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
                <Pagination
                  page={currentPage}
                  totalPages={Math.ceil(attendanceData.length / PAGE_SIZE)}
                  total={attendanceData.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}