import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import KPICard from '../components/KPICard';
import Skeleton from '../components/Skeleton';
import {
    Users,
    Stethoscope,
    Activity,
    Calendar,
    CreditCard,
    UserCheck,
    Clock,
    FileText,
    BedDouble
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
    Bar
} from 'recharts';

// Mock data for charts
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
            <div className="row g-4 mb-5">
                {role === 'admin' && (
                    <>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Total Revenue" value={`$${stats?.total_revenue || 0}`} icon={CreditCard} color="success" trend={12.5} />
                        </div>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Total Appointments" value={stats?.total_appointments} icon={Calendar} color="primary" trend={8.2} />
                        </div>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Total Patients" value={stats?.total_patients} icon={Activity} color="info" trend={5.4} />
                        </div>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Active Doctors" value={stats?.total_doctors} icon={Stethoscope} color="warning" subtext={`${stats?.attendance || '0'} staff online`} />
                        </div>
                    </>
                )}
                {role === 'doctor' && (
                    <>
                        <div className="col-md-4">
                            <KPICard loading={loading} title="My Appointments" value={stats?.my_appointments} icon={Calendar} color="primary" />
                        </div>
                        <div className="col-md-4">
                            <KPICard loading={loading} title="Pending Requests" value={stats?.pending_appointments} icon={Clock} color="warning" />
                        </div>
                        <div className="col-md-4">
                            <KPICard loading={loading} title="Todays Schedule" value={stats?.today_appointments} icon={UserCheck} color="success" />
                        </div>
                    </>
                )}
                {role === 'patient' && (
                    <>
                        <div className="col-md-6">
                            <KPICard loading={loading} title="Upcoming Appointments" value={stats?.upcoming_appointments} icon={Calendar} color="primary" subtext="Check your schedule" />
                        </div>
                        <div className="col-md-6">
                            <KPICard loading={loading} title="Medical Records" value={stats?.my_appointments} icon={FileText} color="info" subtext="Total history" />
                        </div>
                    </>
                )}
                {role === 'staff' && (
                    <>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Ward Occupancy" value={`${stats?.occupied_beds || 0}%`} icon={BedDouble} color="danger" subtext="Capacity used" />
                        </div>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Available Beds" value={stats?.available_beds || 0} icon={BedDouble} color="success" subtext="Ready for admission" />
                        </div>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="Active Visitors" value={stats?.active_visitors || 0} icon={UserCheck} color="info" subtext="Currently in facility" />
                        </div>
                        <div className="col-md-3">
                            <KPICard loading={loading} title="My Attendance" value={stats?.my_attendance_count || 0} icon={Clock} color="warning" subtext="Logs this month" />
                        </div>
                    </>
                )}
            </div>

            {/* Logistics & Alerts Section */}
            <div className="row g-4 mb-4">
                <div className={`${role === 'admin' ? 'col-lg-12' : 'col-lg-8'}`}>
                    <div className="card-enterprise border-0 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Recent Logistics Activity</h5>
                            <button className="btn btn-sm btn-light rounded-pill px-3">View All</button>
                        </div>
                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4">
                                <div className="bg-success bg-opacity-10 p-2 rounded-circle text-success"><Activity size={18} /></div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark small">Ward 4B - Bed 12 Cleaned</div>
                                    <div className="text-muted small">Sanitization completed by housekeeping.</div>
                                </div>
                                <div className="text-muted small">10m ago</div>
                            </div>
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary"><UserCheck size={18} /></div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark small">Security Alert: New Visitor Enrolled</div>
                                    <div className="text-muted small">Visitor logged for Patient: Dhairya Shah.</div>
                                </div>
                                <div className="text-muted small">25m ago</div>
                            </div>
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4">
                                <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning"><Clock size={18} /></div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark small">Shift Change Handover</div>
                                    <div className="text-muted small">Morning shift staff successfully logged out.</div>
                                </div>
                                <div className="text-muted small">1h ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section (Admin Only) */}
            {role === 'admin' && (
                <div className="row g-4 mb-4">
                    <div className="col-lg-8">
                        <div className="card-enterprise border-0 shadow-sm p-4 h-100">
                            <h5 className="fw-bold mb-4">Revenue Analytics</h5>
                            {loading ? (
                                <Skeleton className="skeleton-rect" style={{ height: '300px' }} />
                            ) : (
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
                            )}
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card-enterprise border-0 shadow-sm p-4 h-100">
                            <h5 className="fw-bold mb-4">Patient Visits</h5>
                            {loading ? (
                                <Skeleton className="skeleton-rect" style={{ height: '300px' }} />
                            ) : (
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
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
