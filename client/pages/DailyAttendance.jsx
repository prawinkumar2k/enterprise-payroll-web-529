import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Copy, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "../lib/apiClient";

export default function DailyAttendance() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [attendanceEdits, setAttendanceEdits] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet('/api/settings/global').then((res) => res.data || {}),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: attendanceResponse, isLoading, isError } = useQuery({
    queryKey: ['attendance-daily', selectedDate, selectedCategory],
    queryFn: () => apiGet(`/api/attendance/daily?date=${selectedDate}&category=${selectedCategory}`),
    staleTime: 30 * 1000,
    retry: 1,
    retryDelay: 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => apiPost('/api/attendance/daily', data),
    onSuccess: (res) => {
      toast({ title: "âœ… Saved", description: res.message || "Attendance updated successfully" });
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

  const attendanceData = useMemo(() => {
    const baseRows = attendanceResponse?.data ?? [];
    return baseRows.map((item) => ({
      ...item,
      ...(attendanceEdits[item.EMPNO] || {}),
    }));
  }, [attendanceEdits, attendanceResponse?.data]);

  const attendanceStatuses = settingsData?.attendance_status_codes?.split(',')
    ?? ['Present', 'Absent', 'CL', 'ML', 'OD', 'L', 'WO', 'H'];

  const handleStatusChange = (empno, status) =>
    setAttendanceEdits((prev) => ({
      ...prev,
      [empno]: {
        ...(prev[empno] || {}),
        Status: status,
      },
    }));

  const handleRemarkChange = (empno, remark) =>
    setAttendanceEdits((prev) => ({
      ...prev,
      [empno]: {
        ...(prev[empno] || {}),
        Remark: remark,
      },
    }));

  const handleSave = () => {
    const records = attendanceData.map((item) => ({
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
    setAttendanceEdits(() => Object.fromEntries(
      attendanceData.map((item) => [item.EMPNO, { Status: 'Present', Remark: '' }])
    ));

  const handleCopyPreviousDay = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    try {
      const res = await apiGet(`/api/attendance/daily?date=${prevDateStr}&category=${selectedCategory}`);
      if (res?.data?.length > 0) {
        setAttendanceEdits(Object.fromEntries(
          res.data.map((item) => [item.EMPNO, { Status: item.Status, Remark: item.Remark }])
        ));
        toast({ title: "âœ… Copied", description: "Previous day's attendance records loaded" });
      } else {
        toast({ title: "No Data", description: "No attendance found for previous day", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to copy", variant: "destructive" });
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

  const markedCount = attendanceData.filter((entry) => entry.Status).length;
  const presentCount = attendanceData.filter((entry) => entry.Status === 'Present').length;
  const absentCount = attendanceData.filter((entry) => ['Absent', 'LOP'].includes(entry.Status)).length;

  return (
    <DashboardLayout activeRoute="attendance-daily">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Daily Attendance</h1>
            <p className="text-muted-foreground font-medium">Capture workforce availability for {selectedDate}</p>
          </div>
          {!isLoading && !isError && attendanceData.length > 0 && (
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="text-xl font-black text-emerald-700">{presentCount}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Present</div>
              </div>
              <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-200 text-center">
                <div className="text-xl font-black text-red-700">{absentCount}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-600">Absent</div>
              </div>
            </div>
          )}
        </div>

        <Card className="rounded-[2rem] border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                    setAttendanceEdits({});
                  }}
                  className="w-48 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Staff Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCurrentPage(1);
                    setAttendanceEdits({});
                  }}
                >
                  <SelectTrigger className="w-48 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Staff</SelectItem>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Non-Teaching">Non-Teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button onClick={handleMarkAllPresent} variant="outline" size="sm" className="rounded-xl font-bold" disabled={isLoading || isError}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark All Present
                </Button>
                <Button onClick={handleCopyPreviousDay} variant="outline" size="sm" className="rounded-xl font-bold" disabled={isLoading}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Last Day
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending || isLoading || attendanceData.length === 0} size="sm" className="bg-primary rounded-xl font-black uppercase tracking-tighter px-6">
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Syncing...' : `Save (${markedCount}/${attendanceData.length})`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="w-24 font-black uppercase text-[10px] tracking-widest">Emp ID</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Employee Name</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Designation</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Category</TableHead>
                  <TableHead className="w-40 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-20 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                ) : isError ? (
                  <tr><td colSpan={6} className="p-20 text-center"><AlertCircle className="w-10 h-10 text-red-500 mx-auto" /><p className="text-red-600 font-bold mt-2">Failed to sync attendance</p></td></tr>
                ) : attendanceData.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-muted-foreground font-medium italic">No employees found for this criteria</td></tr>
                ) : (
                  attendanceData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((emp) => (
                    <TableRow key={emp.EMPNO} className="hover:bg-muted/30">
                      <TableCell className="font-black text-muted-foreground">{emp.EMPNO}</TableCell>
                      <TableCell className="font-bold">{emp.SNAME}</TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">{emp.Designation}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px] uppercase tracking-tighter">{emp.Category}</Badge></TableCell>
                      <TableCell>
                        <Select
                          value={emp.Status || 'NOT_MARKED'}
                          onValueChange={(val) => handleStatusChange(emp.EMPNO, val === 'NOT_MARKED' ? '' : val)}
                        >
                          <SelectTrigger className="h-9 rounded-lg font-bold">
                            <SelectValue>
                              {emp.Status ? (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase ${getStatusColor(emp.Status)}`}>
                                  {emp.Status}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px] font-black uppercase">Unmarked</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NOT_MARKED"><span className="text-gray-400 text-[10px] font-black uppercase">Unmarked</span></SelectItem>
                            {attendanceStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase ${getStatusColor(status)}`}>{status}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input value={emp.Remark || ''} onChange={(e) => handleRemarkChange(emp.EMPNO, e.target.value)} placeholder="Note..." className="h-9 text-xs font-medium rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {attendanceData.length > PAGE_SIZE && (
              <div className="p-4 border-t">
                <Pagination page={currentPage} totalPages={Math.ceil(attendanceData.length / PAGE_SIZE)} total={attendanceData.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
