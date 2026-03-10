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
import { Calendar, Users, Save, Copy, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "../lib/apiClient";

export default function DailyAttendance() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Settings ──────────────────────────────────────────────────────────────
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet('/api/settings/global').then(res => res.data || {}),
    staleTime: 5 * 60 * 1000, // Settings don't change often — cache 5 min
    retry: 1,
  });

<<<<<<< HEAD
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
=======
  // ── Daily Attendance Fetch ────────────────────────────────────────────────
  const {
    data: attendanceResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['attendance-daily', selectedDate, selectedCategory],
    queryFn: () => apiGet(`/api/attendance/daily?date=${selectedDate}&category=${selectedCategory}`),
    staleTime: 30 * 1000, // Cache 30s — attendance changes frequently
    retry: 1,             // Only retry once. Don't freeze UI on 401.
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
    retryDelay: 1000,
  });

  // ── Save Attendance Mutation ──────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data) => apiPost('/api/attendance/daily', data),
    onSuccess: (res) => {
      toast({ title: "✅ Saved", description: res.message || "Attendance updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['attendance-daily'] });
    },
    onError: (err) => {
      toast({
        title: "Save Failed",
        description: err.message || "Could not save attendance",
        variant: "destructive",
      });
    }
  });

  // ── Sync fetched data into local editable state ───────────────────────────
  useEffect(() => {
    if (attendanceResponse?.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing API response to local state is intentional
      setAttendanceData(attendanceResponse.data);
      setCurrentPage(1);
    }
  }, [attendanceResponse]);

  const attendanceStatuses = settingsData?.attendance_status_codes?.split(',')
    ?? ['Present', 'Absent', 'CL', 'ML', 'OD', 'L', 'WO', 'H'];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusChange = (empno, status) =>
    setAttendanceData(prev => prev.map(item =>
      item.EMPNO === empno ? { ...item, Status: status } : item
    ));

  const handleRemarkChange = (empno, remark) =>
    setAttendanceData(prev => prev.map(item =>
      item.EMPNO === empno ? { ...item, Remark: remark } : item
    ));

  const handleSave = () => {
    const records = attendanceData.map(item => ({
      EMPNO: item.EMPNO,
      Status: item.Status,
      Remark: item.Remark,
      SNAME: item.SNAME,
      Designation: item.Designation,
      Category: item.Category,
    }));
    updateMutation.mutate({ date: selectedDate, records });
  };

  const handleMarkAllPresent = () =>
    setAttendanceData(prev => prev.map(item => ({ ...item, Status: 'Present', Remark: '' })));

  const handleCopyPreviousDay = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    try {
      const res = await apiGet(`/api/attendance/daily?date=${prevDateStr}&category=${selectedCategory}`);
      if (res?.data?.length > 0) {
        setAttendanceData(res.data);
        toast({ title: "✅ Copied", description: `Previous day's attendance (${res.data.length} records) loaded` });
      } else {
        toast({ title: "No Data", description: "No attendance found for previous day", variant: "destructive" });
      }
<<<<<<< HEAD
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy previous day's attendance",
        variant: "destructive",
      });
=======
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to copy", variant: "destructive" });
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
    }
  };

  const getStatusColor = (status) => {
    const map = {
      'Present': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Absent': 'bg-red-100 text-red-800 border-red-200',
      'CL': 'bg-blue-100 text-blue-800 border-blue-200',
      'ML': 'bg-purple-100 text-purple-800 border-purple-200',
      'OD': 'bg-amber-100 text-amber-800 border-amber-200',
      'WO': 'bg-gray-100 text-gray-700 border-gray-200',
      'H': 'bg-orange-100 text-orange-800 border-orange-200',
      'LOP': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderTableBody = () => {
    // 1. Still loading
    if (isLoading) {
      return Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {[...Array(6)].map((__, j) => (
            <TableCell key={j}>
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: j === 1 ? '120px' : '80px' }} />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    // 2. Error state
    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-12">
            <div className="flex flex-col items-center gap-3 text-red-600">
              <AlertCircle className="w-10 h-10" />
              <p className="font-semibold">Failed to load attendance</p>
              <p className="text-sm text-gray-500">{error?.message || 'Unknown error'}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    // 3. Empty state
    if (attendanceData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-12">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Users className="w-10 h-10" />
              <p className="font-medium">No employees found</p>
              <p className="text-sm">Check employee CheckStatus or category filter</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    // 4. Data rows
    return attendanceData.map((employee) => (
      <TableRow key={employee.EMPNO} className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-mono font-medium text-gray-700">{employee.EMPNO}</TableCell>
        <TableCell className="font-medium">{employee.SNAME}</TableCell>
        <TableCell className="text-sm text-gray-600">{employee.Designation}</TableCell>
        <TableCell>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {employee.Category || '—'}
          </span>
        </TableCell>
        <TableCell>
          <Select
            value={employee.Status || 'NOT_MARKED'}
            onValueChange={(val) => handleStatusChange(employee.EMPNO, val === 'NOT_MARKED' ? '' : val)}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue>
                {employee.Status ? (
                  <span className={`text-xs px-2 py-0.5 rounded font-medium border ${getStatusColor(employee.Status)}`}>
                    {employee.Status}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Not Marked</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT_MARKED">
                <span className="text-gray-400">Not Marked</span>
              </SelectItem>
              {attendanceStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium border ${getStatusColor(status)}`}>
                    {status}
                  </span>
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
            className="w-40 h-8 text-sm"
          />
        </TableCell>
      </TableRow>
    ));
  };

  const markedCount = attendanceData.filter(e => e.Status).length;
  const presentCount = attendanceData.filter(e => e.Status === 'Present').length;
  const absentCount = attendanceData.filter(e => e.Status === 'Absent' || e.Status === 'LOP').length;

  return (
    <DashboardLayout activeRoute="attendance-daily">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Attendance</h1>
            <p className="text-muted-foreground">Mark and manage daily employee attendance</p>
          </div>
          {/* Quick stats */}
          {!isLoading && !isError && attendanceData.length > 0 && (
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-lg font-bold text-emerald-700">{presentCount}</div>
                <div className="text-xs text-emerald-600">Present</div>
              </div>
              <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                <div className="text-lg font-bold text-red-700">{absentCount}</div>
                <div className="text-xs text-red-600">Absent/LOP</div>
              </div>
              <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-lg font-bold text-gray-700">{attendanceData.length - markedCount}</div>
                <div className="text-xs text-gray-600">Unmarked</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Attendance Controls
            </CardTitle>
          </CardHeader>
<<<<<<< HEAD
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label htmlFor="att-date" className="text-sm font-medium">Date</label>
=======
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
                <Input
                  id="att-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
<<<<<<< HEAD
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[180px]">
                <label htmlFor="att-category" className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
=======
                  className="w-44"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-44">
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Non-Teaching">Non-Teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
<<<<<<< HEAD
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
=======
              <div className="flex gap-2 ml-auto">
                <Button onClick={handleMarkAllPresent} variant="outline" size="sm" disabled={isLoading || isError}>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Mark All Present
                </Button>
                <Button onClick={handleCopyPreviousDay} variant="outline" size="sm" disabled={isLoading}>
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy Previous Day
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || isLoading || attendanceData.length === 0}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {updateMutation.isPending ? 'Saving…' : `Save Attendance (${markedCount}/${attendanceData.length})`}
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Employee Attendance
              {!isLoading && !isError && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {attendanceData.length} employee{attendanceData.length !== 1 ? 's' : ''}
                </span>
              )}
              {isLoading && (
                <span className="ml-2 text-xs font-normal text-gray-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Loading…
                </span>
              )}
            </CardTitle>
          </CardHeader>
<<<<<<< HEAD
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
=======
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="w-24 font-semibold">Emp No</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Designation</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="w-40 font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableBody()}
                </TableBody>
              </Table>
            </div>
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}