import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Plus, Trash2, RefreshCw, X, Save, ArrowUpDown, AlertCircle, Download, Upload, FileSpreadsheet } from "lucide-react";
import { getApiUrl } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const ALL_FIELDS = [
  "id", "SLNO", "EMPNO", "SNAME", "DESIGNATION", "AbsGroup", "DGroup", "PAY",
  "GradePay", "Category", "PANCARD", "AccountNo", "BankName", "IFSCCode",
  "OtherAccNo", "DOB", "JDATE", "RDATE", "LDATE", "CheckStatus", "DA",
  "EPF", "ESI", "MPHIL", "PHD", "HATA", "Allowance", "SPECIAL", "INTERIM",
  "OD", "CL", "ML", "MaL", "RH", "SL", "LOP", "LopDate"
];

const FORM_FIELDS = ALL_FIELDS;

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTrash, setViewTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [errorState, setErrorState] = useState(null);
  const [importData, setImportData] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    setErrorState(null);
    setEmployees([]);

    try {
      const endpoint = viewTrash ? '/employees/trash' : '/employees';
      const response = await fetch(getApiUrl(endpoint), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error("Data is not array:", data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorState(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [viewTrash]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = [...employees]
    .filter(emp => {
      if (!emp) return false;
      const searchLower = searchTerm.toLowerCase();
      const sname = emp.SNAME ? String(emp.SNAME).toLowerCase() : "";
      const empno = emp.EMPNO ? String(emp.EMPNO) : "";
      const desig = emp.DESIGNATION ? String(emp.DESIGNATION).toLowerCase() : "";

      return (
        sname.includes(searchLower) ||
        empno.includes(searchLower) ||
        desig.includes(searchLower)
      );
    })
    .sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      const isNum = !isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB));

      if (isNum) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      let url = getApiUrl('/employees');
      let method = 'POST';

      if (currentEmployee && currentEmployee.id) {
        url = getApiUrl(`/employees/${currentEmployee.id}`);
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Operation failed");

      setModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Error saving record: " + error.message);
    }
  };

  const moveToTrash = async (id) => {
    if (!confirm("Are you sure you want to move this employee to trash?")) return;
    try {
      const response = await fetch(getApiUrl(`/employees/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error("Delete failed");
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Error moving to trash");
    }
  };

  const restoreFromTrash = async (id) => {
    if (!confirm("Restore this employee?")) return;
    try {
      const response = await fetch(getApiUrl(`/employees/${id}/restore`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error("Restore failed");
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Error restoring employee");
    }
  };

  const openEdit = (emp) => {
    setCurrentEmployee(emp);
    setModalOpen(true);
  };

  const openCreate = () => {
    setCurrentEmployee({});
    setModalOpen(true);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = sortedEmployees.map(emp => {
      const row = {};
      ALL_FIELDS.forEach(field => {
        row[field] = emp[field] || '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `employees-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: `${exportData.length} employee records exported to Excel`,
    });
  };

  // Download Import Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        EMPNO: 'EMP001',
        SNAME: 'John Doe',
        DESIGNATION: 'Professor',
        AbsGroup: 'Teaching Staff',
        DGroup: 'A',
        PAY: '50000',
        GradePay: '10000',
        Category: 'Teaching',
        PANCARD: 'ABCDE1234F',
        AccountNo: '1234567890',
        BankName: 'State Bank',
        IFSCCode: 'SBIN0001234',
        DOB: '1980-01-01',
        JDATE: '2010-06-01',
        CheckStatus: 'Active'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'employee-import-template.xlsx');

    toast({
      title: "Template Downloaded",
      description: "Fill in the template with employee data and import it back",
    });
  };

  // Handle File Import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({
            title: "No Data Found",
            description: "The Excel file appears to be empty",
            variant: "destructive",
          });
          return;
        }

        // Validate required fields
        const errors = [];
        const validatedData = jsonData.map((row, index) => {
          if (!row.EMPNO || !row.SNAME) {
            errors.push(`Row ${index + 2}: Missing EMPNO or SNAME`);
          }
          return row;
        });

        if (errors.length > 0) {
          toast({
            title: "Validation Errors",
            description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''),
            variant: "destructive",
          });
          return;
        }

        setImportData(validatedData);
        setShowImportPreview(true);
        toast({
          title: "File Loaded",
          description: `${validatedData.length} records ready for import. Review and confirm.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const empData of importData) {
        try {
          const response = await fetch(getApiUrl('/employees'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(empData),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} records. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });

      setShowImportPreview(false);
      setImportData([]);
      fetchEmployees();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import employee data",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout activeRoute="employees" disableContentWrapper={true}>
      <div className="p-4 bg-white h-full grid grid-rows-[auto_1fr] gap-4 overflow-hidden">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold uppercase text-gray-800 tracking-tight">
              {viewTrash ? "Employee Trash" : "Master Employee Roll"}
            </h1>
            <button
              onClick={() => setViewTrash(!viewTrash)}
              className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 border ${viewTrash ? 'bg-gray-800 text-white' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
            >
              <Trash2 size={16} />
              {viewTrash ? "View Active Employees" : "View Trash"}
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search NAME, EMPNO..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none w-full md:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {!viewTrash && (
              <>
                <button
                  onClick={openCreate}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-bold flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Add Employee
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 shadow-sm"
                  title="Export to Excel"
                >
                  <Download size={16} /> Export
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 shadow-sm"
                  title="Download Import Template"
                >
                  <FileSpreadsheet size={16} /> Template
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 shadow-sm"
                  title="Import from Excel"
                >
                  <Upload size={16} /> Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </>
            )}
            <button
              onClick={fetchEmployees}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {errorState && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>Error: {errorState}</span>
            <button onClick={fetchEmployees} className="ml-auto text-sm underline font-bold">Retry</button>
          </div>
        )}

        {/* Dense Data Table Container */}
        <div className="flex-grow overflow-auto border border-gray-300 shadow-sm relative bg-white">
          <table className="w-full border-collapse text-xs whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-20 shadow-sm">
              <tr>
                {ALL_FIELDS.map(field => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="p-2 border font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  >
                    <div className="flex items-center gap-1">
                      {field}
                      {sortConfig.key === field && (
                        <ArrowUpDown size={12} className="text-gray-500" />
                      )}
                    </div>
                  </th>
                ))}
                {/* Actions Column - Sticky Right */}
                <th className="p-2 border text-center font-bold sticky right-0 bg-gray-100 z-30 min-w-[100px] shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={ALL_FIELDS.length + 1} className="p-8 text-center text-lg">Loading Data...</td></tr>
              ) : sortedEmployees.length === 0 ? (
                <tr><td colSpan={ALL_FIELDS.length + 1} className="p-8 text-center text-lg text-gray-500">
                  {errorState ? "Data unavailable due to error" : "No Records Found"}
                </td></tr>
              ) : (
                sortedEmployees.map((emp, idx) => (
                  <tr key={emp.id || idx} className="hover:bg-blue-50 odd:bg-white even:bg-gray-50 transition-colors">
                    {ALL_FIELDS.map(field => (
                      <td key={field} className="p-1.5 border align-middle text-gray-700">
                        {emp[field]}
                      </td>
                    ))}

                    {/* Actions Cells - Sticky Right */}
                    <td className="p-1 border text-center sticky right-0 bg-white group-hover:bg-blue-50 z-10 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex justify-center gap-1 px-2">
                        {viewTrash ? (
                          <button
                            onClick={() => restoreFromTrash(emp.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Restore"
                          >
                            <RefreshCw size={14} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(emp)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => moveToTrash(emp.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Trash"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-800">
                {currentEmployee?.id ? "Edit Employee Record" : "New Employee Entry"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FORM_FIELDS.map(field => (
                  <div key={field} className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{field}</label>
                    <input
                      name={field}
                      defaultValue={currentEmployee?.[field] || ""}
                      readOnly={field === 'id'}
                      className={`border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${field === 'id' ? 'bg-gray-100' : ''}`}
                      type={['DOB', 'JDATE', 'RDATE', 'LDATE', 'LopDate'].includes(field) ? "date" : "text"}
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 shadow-lg shadow-blue-700/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  {currentEmployee?.id ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-800">
                Import Preview - {importData.length} Records
              </h2>
              <button
                onClick={() => setShowImportPreview(false)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 border text-left font-bold">EMPNO</th>
                      <th className="p-2 border text-left font-bold">SNAME</th>
                      <th className="p-2 border text-left font-bold">DESIGNATION</th>
                      <th className="p-2 border text-left font-bold">Category</th>
                      <th className="p-2 border text-left font-bold">PAY</th>
                      <th className="p-2 border text-left font-bold">AccountNo</th>
                      <th className="p-2 border text-left font-bold">BankName</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 100).map((row, index) => (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="p-2 border">{row.EMPNO}</td>
                        <td className="p-2 border">{row.SNAME}</td>
                        <td className="p-2 border">{row.DESIGNATION}</td>
                        <td className="p-2 border">{row.Category}</td>
                        <td className="p-2 border">{row.PAY}</td>
                        <td className="p-2 border">{row.AccountNo}</td>
                        <td className="p-2 border">{row.BankName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importData.length > 100 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Showing first 100 of {importData.length} records
                </p>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowImportPreview(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 shadow-lg shadow-blue-700/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Upload size={18} />
                Confirm Import ({importData.length} records)
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}