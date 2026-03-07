import { useReducer, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Printer, Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
import { REPORT_CONFIGS, paginateData } from "../utils/printEngine";

function ReportTable({ reportType, reportData, employees, selectedEmployee, selectedYear, selectedMonth }) {
  switch (reportType) {
    case 'daily-register':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employee No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((row, index) => (
              <TableRow key={`daily-${row.EMPNO}-${row.ADATE || index}`}>
                <TableCell>{row.Remark}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

    case 'monthly-summary':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Absent</TableHead>
              <TableHead>LOP</TableHead>
              <TableHead>Leave</TableHead>
              <TableHead>Week Off</TableHead>
              <TableHead>OD</TableHead>
              <TableHead>Half Day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((row) => (
              <TableRow key={row.EMPNO}>
                <TableCell>{row.EMPNO}</TableCell>
                <TableCell>{row.SNAME}</TableCell>
                <TableCell>{row.DESIGNATION}</TableCell>
                <TableCell>{row.Category}</TableCell>
                <TableCell><Badge variant="default">{row.PresentDays || 0}</Badge></TableCell>
                <TableCell><Badge variant="destructive">{row.AbsentDays || 0}</Badge></TableCell>
                <TableCell><Badge variant="destructive">{row.LOPDays || 0}</Badge></TableCell>
                <TableCell><Badge variant="secondary">{row.LeaveDays || 0}</Badge></TableCell>
                <TableCell><Badge variant="outline">{row.WeekOffs || 0}</Badge></TableCell>
                <TableCell><Badge variant="outline">{row.ODDays || 0}</Badge></TableCell>
                <TableCell><Badge variant="outline">{row.HalfDays || 0}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

    case 'employee-card':
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              Attendance Card for {employees.find(e => e.EMPNO === selectedEmployee)?.SNAME || selectedEmployee}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow key={`card-${row.EMPNO}-${row.ADATE || index}`}>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    default:
      return null;
  }
}

function getStatusBadgeVariant(status) {
  switch (status) {
    case 'Present': return 'default';
    case 'Absent': return 'destructive';
    case 'CL': case 'ML': return 'secondary';
    case 'OD': return 'outline';
    case 'WO': return 'secondary';
    default: return 'outline';
  }
}

function ReportConfigCard({ reportType, selectedMonth, selectedYear, selectedEmployee, employees, reportTypes, dispatch, handlePrint, handleExport, handleDownloadTemplate, handleFileImport, fileInputRef }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Report Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium">Report Type</p>
            <Select value={reportType} onValueChange={(v) => dispatch({ type: 'SET_FIELD', field: 'reportType', value: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="att-month" className="text-sm font-medium">Month</label>
            <select id="att-month" className="w-full p-2 border rounded-md" value={selectedMonth} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedMonth', value: parseInt(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="att-year" className="text-sm font-medium">Year</label>
            <Input id="att-year" type="number" value={selectedYear} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedYear', value: parseInt(e.target.value) })} min="2020" max="2030" />
          </div>
          {reportType === 'employee-card' && (
            <div>
              <p className="text-sm font-medium">Employee</p>
              <Select value={selectedEmployee} onValueChange={(v) => dispatch({ type: 'SET_FIELD', field: 'selectedEmployee', value: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (<SelectItem key={emp.EMPNO} value={emp.EMPNO}>{emp.EMPNO} - {emp.SNAME}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handlePrint} variant="outline"><Printer className="w-4 h-4 mr-2" />Print</Button>
          <Button onClick={handleExport} variant="outline"><Download className="w-4 h-4 mr-2" />Export Excel</Button>
          <Button onClick={handleDownloadTemplate} variant="outline"><FileSpreadsheet className="w-4 h-4 mr-2" />Download Template</Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline"><Upload className="w-4 h-4 mr-2" />Import Excel</Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileImport} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}

function ImportPreviewCard({ importData, dispatch, importMutation, handleConfirmImport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Preview - {importData.length} Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee No</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importData.slice(0, 50).map((row, index) => (
                <TableRow key={`import-${row.empno}-${row.date || index}`}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.empno}</TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge></TableCell>
                  <TableCell>{row.remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {importData.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Showing first 50 of {importData.length} records
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button onClick={() => dispatch({ type: 'SET_FIELD', field: 'showImportPreview', value: false })} variant="outline">Cancel</Button>
          <Button onClick={handleConfirmImport} disabled={importMutation.isPending}>
            {importMutation.isPending ? 'Importing...' : 'Confirm Import'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function exportAttendanceData({ reportData, reportType, selectedMonth, selectedYear, selectedEmployee }) {
  let wsData = [];
  let filename = '';
  switch (reportType) {
    case 'daily-register':
      wsData = [
        ['Date', 'Employee No', 'Name', 'Designation', 'Category', 'Status', 'Remark'],
        ...reportData.map(row => [new Date(row.ADATE).toLocaleDateString(), row.EMPNO, row.SNAME, row.DESIGNATION, row.Category, row.Status, row.Remark || ''])
      ];
      filename = `daily-attendance-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.xlsx`;
      break;
    case 'monthly-summary':
      wsData = [
        ['Employee No', 'Name', 'Designation', 'Category', 'Present Days', 'Absent Days', 'LOP Days', 'Leave Days', 'Week Offs', 'OD Days', 'Half Days'],
        ...reportData.map(row => [row.EMPNO, row.SNAME, row.DESIGNATION, row.Category, row.PresentDays || 0, row.AbsentDays || 0, row.LOPDays || 0, row.LeaveDays || 0, row.WeekOffs || 0, row.ODDays || 0, row.HalfDays || 0])
      ];
      filename = `monthly-summary-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.xlsx`;
      break;
    case 'employee-card':
      wsData = [
        ['Date', 'Status', 'Remark'],
        ...reportData.map(row => [new Date(row.ADATE).toLocaleDateString(), row.Status, row.Remark || ''])
      ];
      filename = `employee-card-${selectedEmployee}-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.xlsx`;
      break;
  }
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, filename);
}

function downloadImportTemplate(toast) {
  const templateData = [
    ['Date (YYYY-MM-DD)', 'Employee No', 'Status', 'Remark'],
    ['2024-01-01', 'EMP001', 'Present', ''],
    ['2024-01-01', 'EMP002', 'Absent', 'Sick leave'],
    ['2024-01-02', 'EMP001', 'Present', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'attendance-import-template.xlsx');
  toast({ title: 'Template Downloaded', description: 'Fill in the template with attendance data and import it back' });
}

function parseImportFile(event, { dispatch, toast }) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const rows = jsonData.slice(1).filter(row => row.length > 0);
      const validatedData = [];
      const errors = [];
      rows.forEach((row, index) => {
        const [date, empno, status, remark] = row;
        if (!date || !empno || !status) { errors.push(`Row ${index + 2}: Missing required fields`); return; }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) { errors.push(`Row ${index + 2}: Invalid date format`); return; }
        validatedData.push({ date: dateObj.toISOString().split('T')[0], empno: String(empno).trim(), status: String(status).trim(), remark: remark ? String(remark).trim() : '' });
      });
      if (errors.length > 0) {
        toast({ title: 'Validation Errors', description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''), variant: 'destructive' });
        return;
      }
      dispatch({ type: 'SET_FIELD', field: 'importData', value: validatedData });
      dispatch({ type: 'SET_FIELD', field: 'showImportPreview', value: true });
      toast({ title: 'File Loaded', description: `${validatedData.length} records ready for import. Review and confirm.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to read Excel file. Please check the format.', variant: 'destructive' });
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

export default function AttendanceReports() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    (s, a) => a.type === 'SET_FIELD' ? { ...s, [a.field]: a.value } : s,
    {
      reportType: 'monthly-summary',
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      selectedEmployee: '',
      importData: [],
      showImportPreview: false
    }
  );
  const { reportType, selectedMonth, selectedYear, selectedEmployee, importData, showImportPreview } = state;
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch report data
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ['attendance-reports', reportType, selectedMonth, selectedYear, selectedEmployee],
    queryFn: () => fetch(`/api/attendance/reports?type=${reportType}&month=${selectedMonth}&year=${selectedYear}&empno=${selectedEmployee || ''}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    enabled: !!(reportType && selectedMonth && selectedYear)
  });

  // Fetch employees for employee card report
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees'],
    queryFn: () => fetch('/api/employees', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (data) => fetch('/api/attendance/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: `${response.imported || 0} attendance records imported successfully`,
      });
      dispatch({ type: 'SET_FIELD', field: 'showImportPreview', value: false });
      dispatch({ type: 'SET_FIELD', field: 'importData', value: [] });
      queryClient.invalidateQueries(['attendance-reports']);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import attendance data",
        variant: "destructive",
      });
    }
  });

  const reportData = useMemo(() => reportResponse?.data ?? [], [reportResponse]);
  const employees = employeesResponse?.data || [];

  const reportTypes = [
    { value: 'daily-register', label: 'Daily Attendance Register' },
    { value: 'monthly-summary', label: 'Monthly Attendance Summary' },
    { value: 'employee-card', label: 'Employee Attendance Card' }
  ];

  const handlePrint = () => {
    navigate('/print-report', {
      state: {
        data: reportData,
        reportType: reportType === 'daily-register' ? 'ATTENDANCE_DAILY' : 'ATTENDANCE_SUMMARY',
        filters: { month: selectedMonth, year: selectedYear },
        orientation: currentReportConfig.orientation
      }
    });
  };

  const rowsPerPage = useMemo(() => {
    if (reportType === 'monthly-summary') return REPORT_CONFIGS.ATTENDANCE_SUMMARY.rowsPerPage;
    return REPORT_CONFIGS.ATTENDANCE_DAILY.rowsPerPage;
  }, [reportType]);

  const _pages = useMemo(() => {
    return paginateData(reportData, rowsPerPage);
  }, [reportData, rowsPerPage]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const currentReportConfig = useMemo(() => {
    if (reportType === 'monthly-summary') return REPORT_CONFIGS.ATTENDANCE_SUMMARY;
    if (reportType === 'daily-register') return REPORT_CONFIGS.ATTENDANCE_DAILY;
    return { title: 'EMPLOYEE ATTENDANCE CARD', orientation: 'portrait' };
  }, [reportType]);

  // Export to Excel
  const handleExport = () => exportAttendanceData({ reportData, reportType, selectedMonth, selectedYear, selectedEmployee });

  // Download Import Template
  const handleDownloadTemplate = () => downloadImportTemplate(toast);

  // Handle File Import
  const handleFileImport = (event) => parseImportFile(event, { dispatch, toast });

  // Confirm Import
  const handleConfirmImport = () => importMutation.mutate({ records: importData });

  return (
    <DashboardLayout activeRoute="attendance-reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Reports</h1>
            <p className="text-muted-foreground">Generate and view attendance reports</p>
          </div>
        </div>

        {/* Controls */}
        <ReportConfigCard
          reportType={reportType} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedEmployee={selectedEmployee}
          employees={employees} reportTypes={reportTypes}
          dispatch={dispatch}
          handlePrint={handlePrint} handleExport={handleExport} handleDownloadTemplate={handleDownloadTemplate}
          handleFileImport={handleFileImport} fileInputRef={fileInputRef}
        />

        {/* Import Preview */}
        {showImportPreview && (
          <ImportPreviewCard
            importData={importData}
            dispatch={dispatch}
            importMutation={importMutation}
            handleConfirmImport={handleConfirmImport}
          />
        )}

        {/* Report Table */}
        <Card className="no-print">
          <CardHeader>
            <CardTitle>Report Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading report data...</div>
            ) : reportData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data found for the selected criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ReportTable
                  reportType={reportType}
                  reportData={reportData}
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRINTING IS NOW HANDLED VIA THE DEDICATED /print-report ROUTE */}
      </div>
    </DashboardLayout>
  );
}