import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    isActive: boolean;
    bio?: string;
    createdAt: string;
    _count: {
        articles: number;
    };
}

interface Role {
    id: number;
    name: string;
}

const UsersManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        roleId: '3',
        bio: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isStrongPassword = (pass: string) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/users'),
                api.get('/users/roles')
            ]);
            setUsers(usersRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                password: '', // Don't show hashed password, only if they want to change it
                roleId: String(user.role.id),
                bio: user.bio || ''
            });
        } else {
            setEditingUser(null);
            setFormData({ fullName: '', email: '', password: '', roleId: '3', bio: '' });
        }
        setShowModal(true);
    };

    const handleToggleStatus = async (user: User) => {
        try {
            const newStatus = !user.isActive;
            await api.put(`/users/${user.id}`, { isActive: newStatus });
            setUsers(users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
        } catch (err) {
            console.error('Failed to toggle status:', err);
            alert('Failed to update user status.');
        }
    };

    const handleChangeRole = async (userId: string, roleId: string) => {
        try {
            await api.put(`/users/${userId}`, { roleId: Number(roleId) });
            setUsers(users.map(u => {
                if (u.id === userId) {
                    const role = roles.find(r => r.id === Number(roleId));
                    return { ...u, role: role || u.role };
                }
                return u;
            }));
        } catch (err) {
            console.error('Failed to change role:', err);
            alert('Failed to update user role.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && !isStrongPassword(formData.password)) {
            alert('Password does not meet the complexity requirements.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingUser) {
                // Update existing user
                const payload: any = { ...formData };
                if (!payload.password) delete payload.password; // Only send password if changed

                const response = await api.put(`/users/${editingUser.id}`, payload);
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...response.data } : u));
            } else {
                // Create new user
                const response = await api.post('/users', formData);
                setUsers([response.data, ...users]);
            }
            setShowModal(false);
        } catch (err: any) {
            console.error('Form submission failed:', err);
            alert(err.response?.data?.error || 'Operation failed. Please check the data and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) return;

        try {
            await api.delete(`/users/${user.id}`);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in relative">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                        <p className="text-sm text-gray-500">Manage platform access and roles</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-icons text-sm">person_add</span>
                        Add New User
                    </button>
                </div>

                <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-black/10 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Articles</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {u.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{u.fullName}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            aria-label={`Change role for ${u.fullName}`}
                                            title="Change user role"
                                            className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary text-gray-600 dark:text-gray-400"
                                            value={u.role.id}
                                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                        >
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(u)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${u.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200'
                                                }`}
                                        >
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {u._count.articles}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="text-[10px] text-gray-400 mr-2">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </div>
                                            <button
                                                onClick={() => handleOpenModal(u)}
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                                                title="Edit User"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                                title="Delete User"
                                            >
                                                <span className="material-icons text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-primary">
                            <h3 className="text-white font-bold">{editingUser ? 'Edit Team Member' : 'Add New Team Member'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="user-name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    id="user-name"
                                    required
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300 transition-all font-medium"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="user-email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                <input
                                    id="user-email"
                                    required
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300 transition-all font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="user-role" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                                    <select
                                        id="user-role"
                                        aria-label="Select user role"
                                        title="Select user role"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300 font-medium"
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="user-password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        {editingUser ? 'New Password' : 'Password'}
                                    </label>
                                    <input
                                        id="user-password"
                                        required={!editingUser}
                                        type="password"
                                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border rounded-xl text-sm focus:outline-none text-gray-700 dark:text-gray-300 transition-all font-medium ${formData.password && !isStrongPassword(formData.password)
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                                            }`}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingUser ? 'Leave blank to keep' : 'Required'}
                                    />
                                </div>
                            </div>

                            {formData.password && (
                                <div className={`text-[10px] p-2 rounded-lg border flex items-start gap-2 animate-fade-in ${isStrongPassword(formData.password)
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                    <span className="material-icons text-xs mt-0.5">
                                        {isStrongPassword(formData.password) ? 'check_circle' : 'info'}
                                    </span>
                                    <p>
                                        Password must be 8+ chars, include upper/lowercase, a number, and a symbol.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="user-bio" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brief Bio</label>
                                <textarea
                                    id="user-bio"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-700 dark:text-gray-300 h-20 resize-none font-medium"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about the team member..."
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="material-icons text-sm">{editingUser ? 'save' : 'person_add'}</span>
                                            {editingUser ? 'Update User Details' : 'Create User Account'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
