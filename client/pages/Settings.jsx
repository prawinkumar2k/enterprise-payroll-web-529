import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import {
  Save,
  Building2,
  CreditCard,
  Percent,
  Lock,
  HardDrive,
  AlertCircle,
  CheckCircle } from
"lucide-react";






























export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [orgSettings, setOrgSettings] = useState({
    name: "Institute of Excellence",
    email: "admin@institution.edu",
    phone: "+91-9876543210",
    address: "123 Education Lane",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    gstNumber: "07AABCT1234H1Z0"
  });

  const [bankSettings, setBankSettings] = useState({
    bankName: "State Bank of India",
    accountNumber: "12345678901234",
    ifscCode: "SBIN0001234",
    accountHolder: "Institute of Excellence"
  });

  const [financialSettings, setFinancialSettings] = useState({
    financialYear: "2024-2025",
    pfRate: 12,
    esiRate: 3.25,
    ptSlabA: 100,
    ptSlabB: 500,
    ptSlabC: 1000
  });

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
  { id: "organization", label: "Organization", icon: <Building2 className="w-5 h-5" /> },
  { id: "bank", label: "Bank Details", icon: <CreditCard className="w-5 h-5" /> },
  { id: "financial", label: "Financial", icon: <Percent className="w-5 h-5" /> },
  { id: "roles", label: "Roles & Permissions", icon: <Lock className="w-5 h-5" /> },
  { id: "backup", label: "Backup & Restore", icon: <HardDrive className="w-5 h-5" /> }];


  return (
    <DashboardLayout activeRoute="settings">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure system parameters and settings
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess &&
      <div className="mb-6 p-4 bg-accent/20 border border-accent rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" />
          <p className="text-sm text-accent font-medium">
            Settings saved successfully
          </p>
        </div>
      }

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
          activeTab === tab.id ?
          "bg-primary text-white" :
          "bg-card border border-border text-foreground hover:border-primary"}`
          }>
          
            {tab.icon}
            {tab.label}
          </button>
        )}
      </div>

      {/* Organization Settings */}
      {activeTab === "organization" &&
      <div className="card-base p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Organization Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Organization Name
              </label>
              <input
              type="text"
              className="input-field"
              value={orgSettings.name}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, name: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
              type="email"
              className="input-field"
              value={orgSettings.email}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, email: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <input
              type="tel"
              className="input-field"
              value={orgSettings.phone}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, phone: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                GST Number
              </label>
              <input
              type="text"
              className="input-field"
              value={orgSettings.gstNumber}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, gstNumber: e.target.value })
              } />
            
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <input
              type="text"
              className="input-field"
              value={orgSettings.address}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, address: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                City
              </label>
              <input
              type="text"
              className="input-field"
              value={orgSettings.city}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, city: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                State
              </label>
              <input
              type="text"
              className="input-field"
              value={orgSettings.state}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, state: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Pincode
              </label>
              <input
              type="text"
              className="input-field"
              value={orgSettings.pincode}
              onChange={(e) =>
              setOrgSettings({ ...orgSettings, pincode: e.target.value })
              } />
            
            </div>
          </div>

          <button
          onClick={handleSaveSettings}
          className="btn-primary flex items-center gap-2">
          
            <Save className="w-5 h-5" />
            Save Organization Details
          </button>
        </div>
      }

      {/* Bank Settings */}
      {activeTab === "bank" &&
      <div className="card-base p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Bank Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bank Name
              </label>
              <input
              type="text"
              className="input-field"
              value={bankSettings.bankName}
              onChange={(e) =>
              setBankSettings({ ...bankSettings, bankName: e.target.value })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Number
              </label>
              <input
              type="text"
              className="input-field"
              value={bankSettings.accountNumber}
              onChange={(e) =>
              setBankSettings({
                ...bankSettings,
                accountNumber: e.target.value
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                IFSC Code
              </label>
              <input
              type="text"
              className="input-field"
              value={bankSettings.ifscCode}
              onChange={(e) =>
              setBankSettings({
                ...bankSettings,
                ifscCode: e.target.value
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Holder Name
              </label>
              <input
              type="text"
              className="input-field"
              value={bankSettings.accountHolder}
              onChange={(e) =>
              setBankSettings({
                ...bankSettings,
                accountHolder: e.target.value
              })
              } />
            
            </div>
          </div>

          <button
          onClick={handleSaveSettings}
          className="btn-primary flex items-center gap-2">
          
            <Save className="w-5 h-5" />
            Save Bank Details
          </button>
        </div>
      }

      {/* Financial Settings */}
      {activeTab === "financial" &&
      <div className="card-base p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Financial Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Financial Year
              </label>
              <input
              type="text"
              className="input-field"
              placeholder="2024-2025"
              value={financialSettings.financialYear}
              onChange={(e) =>
              setFinancialSettings({
                ...financialSettings,
                financialYear: e.target.value
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                PF Rate (%)
              </label>
              <input
              type="number"
              step="0.1"
              className="input-field"
              value={financialSettings.pfRate}
              onChange={(e) =>
              setFinancialSettings({
                ...financialSettings,
                pfRate: parseFloat(e.target.value)
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ESI Rate (%)
              </label>
              <input
              type="number"
              step="0.01"
              className="input-field"
              value={financialSettings.esiRate}
              onChange={(e) =>
              setFinancialSettings({
                ...financialSettings,
                esiRate: parseFloat(e.target.value)
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                PT Slab A (₹)
              </label>
              <input
              type="number"
              className="input-field"
              value={financialSettings.ptSlabA}
              onChange={(e) =>
              setFinancialSettings({
                ...financialSettings,
                ptSlabA: parseInt(e.target.value)
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                PT Slab B (₹)
              </label>
              <input
              type="number"
              className="input-field"
              value={financialSettings.ptSlabB}
              onChange={(e) =>
              setFinancialSettings({
                ...financialSettings,
                ptSlabB: parseInt(e.target.value)
              })
              } />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                PT Slab C (₹)
              </label>
              <input
              type="number"
              className="input-field"
              value={financialSettings.ptSlabC}
              onChange={(e) =>
              setFinancialSettings({
                ...financialSettings,
                ptSlabC: parseInt(e.target.value)
              })
              } />
            
            </div>
          </div>

          <button
          onClick={handleSaveSettings}
          className="btn-primary flex items-center gap-2">
          
            <Save className="w-5 h-5" />
            Save Financial Settings
          </button>
        </div>
      }

      {/* Roles & Permissions */}
      {activeTab === "roles" &&
      <div className="card-base p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Role-Based Permissions
          </h3>

          <div className="space-y-6">
            {[
          {
            role: "Super Admin",
            desc: "Full system control",
            permissions: ["All"]
          },
          {
            role: "Admin",
            desc: "User, Payroll & Reports management",
            permissions: [
            "Manage Users",
            "Payroll Processing",
            "View Reports"]

          },
          {
            role: "HR Officer",
            desc: "Employee & Salary management",
            permissions: [
            "Manage Employees",
            "View Salary",
            "Generate Payslips"]

          },
          {
            role: "Accountant",
            desc: "Payroll, Bank & Reports",
            permissions: [
            "Payroll Processing",
            "Bank Statements",
            "View Reports"]

          },
          {
            role: "Auditor",
            desc: "Read-only access to logs",
            permissions: ["View Reports", "View Audit Logs"]
          },
          {
            role: "Employee",
            desc: "Self-service payslip access",
            permissions: ["View Payslip", "Download Payslip"]
          }].
          map((item) =>
          <div
            key={item.role}
            className="border border-border rounded-lg p-4">
            
                <h4 className="font-semibold text-foreground mb-2">
                  {item.role}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.permissions.map((perm) =>
              <span
                key={perm}
                className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                
                      {perm}
                    </span>
              )}
                </div>
              </div>
          )}
          </div>

          <div className="mt-8 p-4 bg-warning/20 border border-warning rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning mb-1">Role Configuration</p>
              <p className="text-sm text-warning/80">
                Custom role permissions require Super Admin access. Contact system
                administrator to modify permissions.
              </p>
            </div>
          </div>
        </div>
      }

      {/* Backup & Restore */}
      {activeTab === "backup" &&
      <div className="card-base p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Data Backup & Restore
          </h3>

          <div className="space-y-6">
            {/* Backup Section */}
            <div className="border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">
                Create Backup
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create a complete backup of all system data including employees,
                payroll, and configurations.
              </p>
              <button className="btn-primary">Create Backup Now</button>
            </div>

            {/* Recent Backups */}
            <div className="border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-4">
                Recent Backups
              </h4>
              <div className="space-y-3">
                {[
              { date: "2024-06-15", size: "125 MB", status: "Complete" },
              { date: "2024-06-08", size: "124 MB", status: "Complete" },
              { date: "2024-06-01", size: "123 MB", status: "Complete" }].
              map((backup, idx) =>
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary rounded">
                
                    <div>
                      <p className="font-medium text-foreground">
                        Backup {backup.date}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {backup.size} • {backup.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-sm py-1 px-3">
                        Restore
                      </button>
                      <button className="btn-secondary text-sm py-1 px-3">
                        Download
                      </button>
                    </div>
                  </div>
              )}
              </div>
            </div>

            {/* Automated Backups */}
            <div className="border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-4">
                Automated Backups
              </h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border" />
              
                <div>
                  <p className="font-medium text-foreground">
                    Enable Daily Backups
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatic backup every day at 2:00 AM
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      }
    </DashboardLayout>);

}