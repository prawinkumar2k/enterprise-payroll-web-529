import { useState, useEffect } from "react";
import {
    Plus, Search, Edit, Trash, Eye,
    ChevronLeft, ChevronRight, X, User as UserIcon
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // For Edit/View
    const [viewMode, setViewMode] = useState(false); // Read-only mode

    // Form State
    const [formData, setFormData] = useState({
        UserID: "",
        UserName: "",
        Password: "",
        Role: "",
        Department: "",
        Qualification: "",
        Contact: "",
        Remark: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handeSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const method = currentUser && !viewMode ? "PUT" : "POST";
        const url = currentUser && !viewMode ? `/api/users/${currentUser.id}` : "/api/users";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
                closeModal();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        const token = localStorage.getItem("token");
        try {
            await fetch(`/api/users/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const openModal = (user = null, view = false) => {
        setCurrentUser(user);
        setViewMode(view);
        if (user) {
            setFormData({ ...user, Password: "" }); // Password empty on edit
        } else {
            setFormData({
                UserID: "", UserName: "", Password: "", Role: "",
                Department: "", Qualification: "", Contact: "", Remark: ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setViewMode(false);
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.UserID.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? u.Role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    return (
        <DashboardLayout activeRoute="users">
            <div className="grid gap-4 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Details</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Manage system access and roles</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-sm shadow-primary/20 font-medium active:scale-95"
                    >
                        <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                        Create User
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Username or UserID..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm sm:text-base"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row gap-3 sm:gap-4">
                        <select
                            className="flex-1 lg:w-48 px-4 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm cursor-pointer"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="employee">Employee</option>
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 lg:hidden flex items-center justify-center shadow-sm"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Adaptive User Display */}
                <div className="space-y-4">
                    {/* Desktop/Tablet Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4">User Info</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-gray-400">Loading users...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-gray-400">No records found.</td></tr>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {user.UserName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{user.UserName}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">ID: {user.UserID}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.Role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {user.Role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 font-medium">{user.Department || '-'}</td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">{user.Contact || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openModal(user, true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="View">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => openModal(user)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                        {loading ? (
                            <div className="col-span-full p-8 text-center text-gray-400">Loading records...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="col-span-full p-8 text-center text-gray-400">No records found.</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div key={user.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.UserName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.UserName}</div>
                                                <div className="text-[10px] text-gray-400 font-mono tracking-tight">{user.UserID}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.Role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.Role}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Department</p>
                                            <p className="font-medium text-gray-700 truncate">{user.Department || '-'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Contact</p>
                                            <p className="font-medium text-gray-700 truncate">{user.Contact || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => openModal(user, true)}
                                            className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button
                                            onClick={() => openModal(user)}
                                            className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="w-12 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center active:scale-95 transition-transform"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] sm:p-4 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
                    <div
                        className="bg-white w-full sm:max-w-xl lg:max-w-2xl sm:rounded-3xl shadow-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300"
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                                    {viewMode ? "User Details" : currentUser ? "Edit User Record" : "Create New User"}
                                </h2>
                                <p className="text-xs text-gray-400 font-medium tracking-tight">Enterprise Access Management</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-thin">
                            <form id="user-form" onSubmit={handeSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">User ID *</label>
                                    <input
                                        type="text"
                                        disabled={viewMode || currentUser}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                                        value={formData.UserID}
                                        onChange={e => setFormData({ ...formData, UserID: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username *</label>
                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                                        value={formData.UserName}
                                        onChange={e => setFormData({ ...formData, UserName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        Password {!currentUser && "*"}
                                    </label>
                                    <input
                                        type="password"
                                        disabled={viewMode}
                                        placeholder={currentUser ? "Leave empty to keep current" : "Secure Password"}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                                        value={formData.Password}
                                        onChange={e => setFormData({ ...formData, Password: e.target.value })}
                                        required={!currentUser}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Role *</label>
                                    <select
                                        disabled={viewMode}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium disabled:opacity-60 cursor-pointer"
                                        value={formData.Role}
                                        onChange={e => setFormData({ ...formData, Role: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="employee">Employee</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Department</label>
                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                                        value={formData.Department}
                                        onChange={e => setFormData({ ...formData, Department: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Contact No.</label>
                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                                        value={formData.Contact}
                                        onChange={e => setFormData({ ...formData, Contact: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-full space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Qualification</label>
                                    <input
                                        type="text"
                                        disabled={viewMode}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                                        value={formData.Qualification}
                                        onChange={e => setFormData({ ...formData, Qualification: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-full space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Remark</label>
                                    <textarea
                                        disabled={viewMode}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium h-28 sm:h-32 resize-none disabled:opacity-60"
                                        value={formData.Remark}
                                        onChange={e => setFormData({ ...formData, Remark: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        {!viewMode && (
                            <div className="p-5 sm:p-6 bg-gray-50 sm:bg-white border-t border-gray-100 flex gap-3 sm:justify-end flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="user-form"
                                    type="submit"
                                    className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-700 transition-all active:scale-95"
                                >
                                    {currentUser ? "Update User" : "Save Record"}
                                </button>
                            </div>
                        )}
                        {viewMode && (
                            <div className="p-5 sm:p-6 bg-gray-50 sm:bg-white border-t border-gray-100 flex flex-shrink-0">
                                <button
                                    onClick={closeModal}
                                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
