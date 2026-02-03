import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Eye, FileText } from 'lucide-react';

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
            label: 'Patient Name',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                        {row.first_name.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-semibold text-dark">{row.first_name} {row.last_name}</div>
                        <div className="small text-muted">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            render: (row) => (
                <div>
                    <div className="text-dark">{row.phone}</div>
                    {row.emergency_contact && row.emergency_contact !== 'N/A' && (
                        <div className="small text-danger">Emerg: {row.emergency_contact}</div>
                    )}
                </div>
            )
        },
        {
            key: 'gender',
            label: 'Gender / Age',
            render: (row) => (
                <div>
                    <span className="text-capitalize">{row.gender}</span>
                    <div className="small text-muted">{row.dob}</div>
                </div>
            )
        },
        {
            key: 'blood_group',
            label: 'Blood Group',
            sortable: true,
            render: (row) => (
                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3">
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
        },
        // Placeholder for future actions like 'Quick Appointment'
        // { label: 'History', icon: FileText, onClick: ... }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Patient Management</h2>
                    <p className="text-muted">View records, history, and contact info</p>
                </div>
                {/* Add Patient Button could go here if needed via Modal like UsersList */}
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading patients...</div>
            ) : (
                <DataTable
                    title="All Patients"
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
