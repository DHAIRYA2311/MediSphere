import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import KPICard from '../components/KPICard';
import {
    Users,
    Stethoscope,
    Activity,
    Calendar,
    CreditCard,
    UserCheck,
    Clock,
    FileText
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

// Mock data for charts (replace with real API data later)
const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
    { name: 'Jul', revenue: 7000 },
];

const patientTrendsData = [
    { name: 'Mon', patients: 20 },
    { name: 'Tue', patients: 35 },
    { name: 'Wed', patients: 25 },
    { name: 'Thu', patients: 40 },
    { name: 'Fri', patients: 30 },
    { name: 'Sat', patients: 15 },
    { name: 'Sun', patients: 10 },
];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = user?.role?.toLowerCase();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('dashboard/stats.php');
                if (res.status === 'success') {
                    setStats(res.data);
                }
            } catch (error) {
                console.error("Fetch Stats Failed:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStats();
    }, [user]);

    if (loading) {
        return <div className="p-5 text-center text-muted">Loading dashboard...</div>;
    }

    // Helper to extract numeric value from string (e.g. "$1200" -> 1200) or keep as is
    const formatVal = (val) => val;

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Overview</h2>
                    <p className="text-muted mb-0">
                        Welcome back, {user?.name}. Here's what's happening today.
                    </p>
                </div>
                <div className="mt-3 mt-md-0 d-flex gap-2">
                    <button className="btn btn-white border shadow-sm fw-medium" onClick={() => window.location.reload()}>
                        <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                    </button>
                    <button className="btn btn-primary fw-medium">
                        <i className="bi bi-download me-2"></i> Download Report
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            {stats && (
                <div className="row g-4 mb-5">
                    {role === 'admin' && (
                        <>
                            <div className="col-md-3">
                                <KPICard title="Total Revenue" value={`$${stats.total_revenue || 0}`} icon={CreditCard} color="success" trend={12.5} />
                            </div>
                            <div className="col-md-3">
                                <KPICard title="Total Appointments" value={stats.total_appointments} icon={Calendar} color="primary" trend={8.2} />
                            </div>
                            <div className="col-md-3">
                                <KPICard title="Total Patients" value={stats.total_patients} icon={Activity} color="info" trend={5.4} />
                            </div>
                            <div className="col-md-3">
                                <KPICard title="Active Doctors" value={stats.total_doctors} icon={Stethoscope} color="warning" subtext={`${stats.attendance || '0'} staff online`} />
                            </div>
                        </>
                    )}
                    {role === 'doctor' && (
                        <>
                            <div className="col-md-4">
                                <KPICard title="My Appointments" value={stats.my_appointments} icon={Calendar} color="primary" />
                            </div>
                            <div className="col-md-4">
                                <KPICard title="Pending Requests" value={stats.pending_appointments} icon={Clock} color="warning" />
                            </div>
                            <div className="col-md-4">
                                <KPICard title="Todays Schedule" value={stats.today_appointments} icon={UserCheck} color="success" />
                            </div>
                        </>
                    )}
                    {role === 'patient' && (
                        <>
                            <div className="col-md-6">
                                <KPICard title="Upcoming Appointments" value={stats.upcoming_appointments} icon={Calendar} color="primary" subtext="Check your schedule" />
                            </div>
                            <div className="col-md-6">
                                <KPICard title="Medical Records" value={stats.my_appointments} icon={FileText} color="info" subtext="Total history" />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Charts Section (Admin Only for now, customizable) */}
            {role === 'admin' && (
                <div className="row g-4 mb-4">
                    <div className="col-lg-8">
                        <div className="card-enterprise border-0 shadow-sm p-4 h-100">
                            <h5 className="fw-bold mb-4">Revenue Analytics</h5>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card-enterprise border-0 shadow-sm p-4 h-100">
                            <h5 className="fw-bold mb-4">Patient Visits</h5>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={patientTrendsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
