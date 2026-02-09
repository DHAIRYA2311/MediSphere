import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Eye, UserPlus, Activity } from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';

const PatientsList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const res = await api.get('patients/list.php');
                if (res.status === 'success') {
                    setPatients(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const columns = [
        {
            key: 'first_name',
            label: 'Patient',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="avatar avatar-primary">
                        {row.first_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <div className="fw-semibold" style={{ color: 'var(--text-main)' }}>
                            {row.first_name} {row.last_name}
                        </div>
                        <div className="small" style={{ color: 'var(--text-muted)' }}>{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            render: (row) => (
                <div>
                    <div style={{ color: 'var(--text-main)' }}>{row.phone}</div>
                    {row.emergency_contact && row.emergency_contact !== 'N/A' && (
                        <div className="small" style={{ color: 'var(--danger)' }}>
                            Emergency: {row.emergency_contact}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'gender',
            label: 'Gender / DOB',
            render: (row) => (
                <div>
                    <span className="text-capitalize" style={{ color: 'var(--text-main)' }}>{row.gender}</span>
                    <div className="small" style={{ color: 'var(--text-muted)' }}>{row.dob}</div>
                </div>
            )
        },
        {
            key: 'blood_group',
            label: 'Blood Type',
            sortable: true,
            render: (row) => (
                <span className="badge badge-danger">
                    {row.blood_group || 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            label: 'View Profile',
            icon: Eye,
            onClick: (row) => navigate(`/patients/${row.patient_id}`)
        }
    ];

    return (
        <div className="fade-in">
            {/* Page Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                        Patient Management
                    </h2>
                    <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                        View records, history, and contact information
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                    <div className="kpi-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="kpi-card-icon primary">
                                <Activity size={22} />
                            </div>
                            <div>
                                <p className="mb-0 small fw-semibold" style={{ color: 'var(--text-muted)' }}>Total Patients</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{patients.length}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <TableSkeleton rows={10} cols={4} />
            ) : (
                <DataTable
                    title="All Patients"
                    subtitle={`${patients.length} patients registered`}
                    columns={columns}
                    data={patients}
                    actions={actions}
                    keyField="patient_id"
                />
            )}
        </div>
    );
};

export default PatientsList;
