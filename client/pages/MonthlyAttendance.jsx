import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Download } from "lucide-react";

export default function MonthlyAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch monthly attendance
  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ['attendance-monthly', selectedMonth, selectedYear],
    queryFn: () => fetch(`/api/attendance/monthly?month=${selectedMonth}&year=${selectedYear}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  // Fetch settings for working days
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings/global', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(res => res.success ? res.data : {})
  });

  const attendanceData = attendanceResponse?.data || [];
  const workingDays = settings?.working_days_per_month || 30;

  const calculatePayableDays = (present, lop) => {
    return Math.max(0, workingDays - lop);
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = ['EMPNO', 'Name', 'Present Days', 'LOP Days', 'Leave Days', 'Week Offs', 'Payable Days'];
    const csvContent = [
      headers.join(','),
      ...attendanceData.map(row => [
        row.EMPNO,
        `"${row.SNAME}"`,
        row.PresentDays || 0,
        row.LOPDays || 0,
        row.LeaveDays || 0,
        row.WeekOffs || 0,
        calculatePayableDays(row.PresentDays || 0, row.LOPDays || 0)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-attendance-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout activeRoute="attendance-monthly">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monthly Attendance Summary</h1>
            <p className="text-muted-foreground">View monthly attendance summary for all employees</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Month Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Month</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{attendanceData.length}</div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {attendanceData.reduce((sum, emp) => sum + (emp.PresentDays || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Present Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {attendanceData.reduce((sum, emp) => sum + (emp.LOPDays || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total LOP Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{workingDays}</div>
              <p className="text-sm text-muted-foreground">Working Days/Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Monthly Attendance Summary
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
                      <TableHead>Present Days</TableHead>
                      <TableHead>LOP Days</TableHead>
                      <TableHead>Leave Days</TableHead>
                      <TableHead>Week Offs</TableHead>
                      <TableHead>Payable Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((employee) => {
                      const payableDays = calculatePayableDays(employee.PresentDays || 0, employee.LOPDays || 0);
                      const isComplete = (employee.PresentDays || 0) + (employee.LOPDays || 0) + (employee.LeaveDays || 0) + (employee.WeekOffs || 0) >= workingDays;

                      return (
                        <TableRow key={employee.EMPNO}>
                          <TableCell className="font-medium">{employee.EMPNO}</TableCell>
                          <TableCell>{employee.SNAME}</TableCell>
                          <TableCell>
                            <Badge variant="default">{employee.PresentDays || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{employee.LOPDays || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{employee.LeaveDays || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.WeekOffs || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={payableDays < workingDays ? "destructive" : "default"}>
                              {payableDays}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isComplete ? "default" : "secondary"}>
                              {isComplete ? "Complete" : "Incomplete"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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