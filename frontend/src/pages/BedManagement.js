import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    BedDouble,
    CheckCircle,
    Building,
    Edit2,
    Trash2,
    ArrowRightLeft,
    Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BedManagement = () => {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();

    // State
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [beds, setBeds] = useState([]);
    const [myBed, setMyBed] = useState(null);
    const [patients, setPatients] = useState([]);
    const [freeBeds, setFreeBeds] = useState([]); // All free beds for move

    // Modals
    const [showCreateWard, setShowCreateWard] = useState(false);
    const [showAddBed, setShowAddBed] = useState(false);
    const [showAllocate, setShowAllocate] = useState(false);
    const [showEditBed, setShowEditBed] = useState(false);
    const [showMoveBed, setShowMoveBed] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Forms
    const [newWard, setNewWard] = useState({ ward_name: '', capacity: '' });
    const [newBedNumber, setNewBedNumber] = useState('');
    const [selectedBed, setSelectedBed] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [targetBedId, setTargetBedId] = useState('');
    const [editBedNumber, setEditBedNumber] = useState('');

    useEffect(() => {
        if (role === 'patient') {
            fetchMyBed();
        } else {
            fetchWards();
        }
    }, [role]);

    const fetchWards = async () => {
        try {
            const res = await api.get('wards/list.php');
            if (res.status === 'success') setWards(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchBeds = async (wardId) => {
        try {
            const res = await api.get(`beds/list.php?ward_id=${wardId}`);
            if (res.status === 'success') setBeds(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchFreeBeds = async () => {
        try {
            const res = await api.get('beds/list_free.php');
            if (res.status === 'success') setFreeBeds(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchMyBed = async () => {
        try {
            const res = await api.get('beds/my_bed.php');
            if (res.status === 'success') setMyBed(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPatients = async () => {
        try {
            const res = await api.get('patients/list.php');
            if (res.status === 'success') setPatients(res.data);
        } catch (e) { console.error(e); }
    };

    const handleWardClick = (ward) => {
        setSelectedWard(ward);
        fetchBeds(ward.ward_id);
    };

    // ... (Create Ward and Add Bed Logic existing code) ...
    const handleCreateWard = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('wards/create.php', newWard);
            if (res.status === 'success') {
                setShowCreateWard(false);
                setNewWard({ ward_name: '', capacity: '' });
                fetchWards();
            } else { alert('Error: ' + res.message); }
        } catch (e) { alert('Failed to create ward'); }
        finally { setIsSubmitting(false); }
    };

    const handleAddBedClick = () => {
        if (!selectedWard) return;
        if (selectedWard.total_beds >= selectedWard.capacity) {
            alert(`Cannot add more beds. Ward capacity (${selectedWard.capacity}) reached!`);
            return;
        }
        setShowAddBed(true);
    };

    const handleAddBedSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('beds/create.php', { ward_id: selectedWard.ward_id, bed_number: newBedNumber });
            if (res.status === 'success') {
                setShowAddBed(false);
                setNewBedNumber('');
                fetchBeds(selectedWard.ward_id);
                fetchWards();
            } else { alert(res.message); }
        } catch (e) { alert('Error adding bed'); }
        finally { setIsSubmitting(false); }
    };

    // Actions
    const openAllocateModal = (bed) => {
        setSelectedBed(bed);
        fetchPatients();
        setShowAllocate(true);
    };

    const openEditModal = (e, bed) => {
        e.stopPropagation();
        setSelectedBed(bed);
        setEditBedNumber(bed.bed_number);
        setShowEditBed(true);
    };

    const openMoveModal = (e, bed) => {
        e.stopPropagation();
        setSelectedBed(bed);
        fetchFreeBeds();
        setShowMoveBed(true);
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('beds/allocate.php', { bed_id: selectedBed.bed_id, patient_id: selectedPatient });
            if (res.status === 'success') {
                setShowAllocate(false);
                setSelectedPatient('');
                fetchBeds(selectedWard.ward_id);
                fetchWards();
            } else { alert(res.message); }
        } catch (e) { alert('Allocation failed'); }
        finally { setIsSubmitting(false); }
    };

    const handleRelease = async (e, bed) => {
        e.stopPropagation();
        if (!window.confirm("Discharge patient and release bed?")) return;
        try {
            const res = await api.post('beds/release.php', { bed_id: bed.bed_id });
            if (res.status === 'success') {
                fetchBeds(selectedWard.ward_id);
                fetchWards();
            } else { alert(res.message); }
        } catch (e) { alert('Release failed'); }
    };

    const handleDelete = async (e, bed) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this bed?")) return;
        try {
            const res = await api.post('beds/delete.php', { bed_id: bed.bed_id });
            if (res.status === 'success') {
                fetchBeds(selectedWard.ward_id);
                fetchWards();
            } else { alert(res.message); }
        } catch (e) { alert("Delete failed"); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('beds/update.php', { bed_id: selectedBed.bed_id, bed_number: editBedNumber });
            if (res.status === 'success') {
                setShowEditBed(false);
                fetchBeds(selectedWard.ward_id);
            } else { alert(res.message); }
        } catch (e) { alert("Update failed"); }
        finally { setIsSubmitting(false); }
    };

    const handleMove = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('beds/move.php', { source_bed_id: selectedBed.bed_id, target_bed_id: targetBedId });
            if (res.status === 'success') {
                alert("Patient moved successfully!");
                setShowMoveBed(false);
                setTargetBedId('');
                fetchBeds(selectedWard.ward_id);
                fetchWards();
            } else { alert(res.message); }
        } catch (e) { alert("Move failed"); }
        finally { setIsSubmitting(false); }
    };

    // Patient View
    if (role === 'patient') {
        // ... (existing patient view code)
        return (
            <div className="container py-5 fade-in">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card-enterprise border-0 shadow-lg p-5 text-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-4">
                                <BedDouble size={48} className="text-primary" />
                            </div>
                            <h2 className="fw-bold text-dark mb-4">Admission Status</h2>
                            {myBed ? (
                                <div className="bg-light rounded-4 p-4 border border-light-subtle">
                                    <h4 className="text-success fw-bold d-flex align-items-center justify-content-center gap-2 mb-4">
                                        <CheckCircle size={24} /> Currently Admitted
                                    </h4>
                                    <div className="row g-4">
                                        <div className="col-6 border-end">
                                            <small className="text-muted text-uppercase fw-bold">Ward</small>
                                            <div className="fs-3 fw-bold text-dark">{myBed.ward_name}</div>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted text-uppercase fw-bold">Bed Number</small>
                                            <div className="fs-3 fw-bold text-dark">{myBed.bed_number}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-top">
                                        <small className="text-muted">Admission Date: {new Date(myBed.allocation_date).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <p className="text-muted fs-5">You are not currently admitted to any ward.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const canEdit = role === 'admin';
    const canOperate = ['admin', 'staff', 'receptionist', 'doctor'].includes(role);

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark">Ward & Bed Management</h2>
                    <p className="text-muted mb-0">Monitor occupancy, manage wards, and move patients</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowCreateWard(true)}>
                        <Plus size={18} /> New Ward
                    </button>
                )}
            </div>

            {/* Wards Grid */}
            <div className="row g-4 mb-5">
                {wards.map(ward => {
                    const setupPercent = (ward.total_beds / ward.capacity) * 100;
                    const occupancyPercent = ward.total_beds > 0 ? (ward.occupied_beds / ward.total_beds) * 100 : 0;
                    const isSelected = selectedWard?.ward_id === ward.ward_id;

                    return (
                        <div className="col-md-6 col-lg-4 col-xl-3" key={ward.ward_id}>
                            <div
                                className={`card-enterprise h-100 border-0 shadow-sm cursor-pointer position-relative overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                                onClick={() => handleWardClick(ward)}
                                style={{ transform: isSelected ? 'translateY(-5px)' : 'none' }}
                            >
                                {isSelected && <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{ height: '4px' }}></div>}
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="bg-light p-3 rounded-circle">
                                            <Building size={24} className="text-primary" />
                                        </div>
                                        <span className={`badge ${ward.occupied_beds >= ward.capacity ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-${ward.occupied_beds >= ward.capacity ? 'danger' : 'success'}`}>
                                            {ward.occupied_beds >= ward.capacity ? 'Full' : 'Available'}
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-1">{ward.ward_name}</h5>
                                    <div className="text-muted small mb-4">Capacity: {ward.capacity} Beds</div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between text-muted small mb-1">
                                            <span>Setup Progress</span>
                                            <span className="fw-bold">{ward.total_beds}/{ward.capacity}</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar bg-info" style={{ width: `${setupPercent}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex justify-content-between text-muted small mb-1">
                                            <span>Occupancy</span>
                                            <span className="fw-bold">{ward.occupied_beds} Occupied</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar bg-success" style={{ width: `${occupancyPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bed Grid & Tools */}
            <AnimatePresence mode="wait">
                {selectedWard && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-enterprise border-0 shadow-sm rounded-4 overflow-hidden"
                    >
                        <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="fw-bold mb-1">{selectedWard.ward_name} Overview</h4>
                                <p className="text-muted small mb-0">
                                    Total Beds: {selectedWard.total_beds} / {selectedWard.capacity}
                                    <span className="mx-2">•</span>
                                    Available: {selectedWard.total_beds - selectedWard.occupied_beds}
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                {canEdit && (
                                    <button
                                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                        onClick={handleAddBedClick}
                                    >
                                        <Plus size={16} /> Add Bed
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-light bg-opacity-25">
                            <div className="row g-3">
                                {beds.length > 0 ? beds.map(bed => (
                                    <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={bed.bed_id}>
                                        <div
                                            className={`p-3 rounded-4 border text-center position-relative transition-all hover-lift ${bed.status === 'Occupied'
                                                    ? 'bg-danger bg-opacity-10 border-danger border-opacity-25'
                                                    : 'bg-white border-light shadow-sm'
                                                }`}
                                            // Make Only Free beds clickable for allocation on card body, or handle in action buttons
                                            onClick={() => {
                                                if (!canOperate) return;
                                                if (bed.status === 'Free') openAllocateModal(bed);
                                            }}
                                        >
                                            <div className="mb-2">
                                                <BedDouble size={24} className={bed.status === 'Occupied' ? 'text-danger' : 'text-success'} />
                                            </div>
                                            <h6 className="fw-bold mb-1 text-dark">Bed {bed.bed_number}</h6>
                                            <span className={`badge ${bed.status === 'Occupied' ? 'bg-danger' : 'bg-success'} bg-opacity-25 text-${bed.status === 'Occupied' ? 'danger' : 'success'} border border-${bed.status === 'Occupied' ? 'danger' : 'success'} border-opacity-25 rounded-pill px-2 py-0 small`}>
                                                {bed.status}
                                            </span>

                                            {bed.status === 'Occupied' && (
                                                <div className="mt-2 text-dark small fw-bold text-truncate">
                                                    {bed.first_name} {bed.last_name}
                                                </div>
                                            )}

                                            {/* Action Overlay / Buttons */}
                                            {canOperate && (
                                                <div className="mt-3 pt-2 border-top d-flex justify-content-center gap-2">
                                                    {bed.status === 'Occupied' ? (
                                                        <>
                                                            <button className="btn btn-sm btn-light text-primary p-1" title="Move Patient" onClick={(e) => openMoveModal(e, bed)}>
                                                                <ArrowRightLeft size={14} />
                                                            </button>
                                                            <button className="btn btn-sm btn-light text-success p-1" title="Discharge" onClick={(e) => handleRelease(e, bed)}>
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="small text-muted py-1" style={{ fontSize: '0.75rem' }}>Click to allocate</span>
                                                    )}

                                                    {canEdit && (
                                                        <>
                                                            <button className="btn btn-sm btn-light text-secondary p-1" title="Edit" onClick={(e) => openEditModal(e, bed)}>
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button className="btn btn-sm btn-light text-danger p-1" title="Delete" onClick={(e) => handleDelete(e, bed)}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-12 py-5 text-center text-muted">No beds configured.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Existing Modals (Create Ward, Add Bed, Allocate) ... */}
            {/* Create Ward Modal */}
            <AnimatePresence>
                {showCreateWard && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold">Create New Ward</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreateWard(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
                                    <form onSubmit={handleCreateWard}>
                                        <div className="mb-3"><label className="form-label small fw-bold text-muted">Ward Name</label><input className="form-control bg-light border-0" value={newWard.ward_name} onChange={(e) => setNewWard({ ...newWard, ward_name: e.target.value })} required /></div>
                                        <div className="mb-4"><label className="form-label small fw-bold text-muted">Capacity</label><input type="number" className="form-control bg-light border-0" value={newWard.capacity} onChange={(e) => setNewWard({ ...newWard, capacity: e.target.value })} required /></div>
                                        <div className="d-grid"><button type="submit" className="btn btn-primary" disabled={isSubmitting}>Create Ward</button></div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Add Bed Modal */}
            <AnimatePresence>
                {showAddBed && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold">Add Bed</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddBed(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
                                    <form onSubmit={handleAddBedSubmit}>
                                        <div className="mb-4"><label className="form-label small fw-bold text-muted">Bed Label</label><input className="form-control bg-light border-0" value={newBedNumber} onChange={(e) => setNewBedNumber(e.target.value)} required autoFocus /></div>
                                        <div className="d-grid"><button type="submit" className="btn btn-primary" disabled={isSubmitting}>Add Bed</button></div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Allocate Modal */}
            <AnimatePresence>
                {showAllocate && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold">Allocate Bed</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAllocate(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
                                    <form onSubmit={handleAllocate}>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Select Patient</label>
                                            <select className="form-select bg-light border-0" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                                                <option value="">-- Choose Patient --</option>
                                                {patients.map(p => (<option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>))}
                                            </select>
                                        </div>
                                        <div className="d-grid"><button type="submit" className="btn btn-success" disabled={isSubmitting}>Allocate</button></div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Bed Modal */}
            <AnimatePresence>
                {showEditBed && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold">Edit Bed</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditBed(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
                                    <form onSubmit={handleEdit}>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Bed Label</label>
                                            <input className="form-control bg-light border-0" value={editBedNumber} onChange={(e) => setEditBedNumber(e.target.value)} required autoFocus />
                                        </div>
                                        <div className="d-grid"><button type="submit" className="btn btn-primary" disabled={isSubmitting}>Save Changes</button></div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Move Patient Modal */}
            <AnimatePresence>
                {showMoveBed && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold text-primary"><ArrowRightLeft className="me-2" />Move Patient</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowMoveBed(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
                                    <div className="alert alert-light border mb-4">
                                        <small className="text-muted d-block uppercase fw-bold">Moving From</small>
                                        <div className="fw-bold fs-5 text-dark">{selectedWard?.ward_name} - Bed {selectedBed?.bed_number}</div>
                                        <div className="small text-primary">{selectedBed?.first_name} {selectedBed?.last_name}</div>
                                    </div>

                                    <form onSubmit={handleMove}>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Select New Bed (Any Ward)</label>
                                            <select className="form-select bg-light border-0" value={targetBedId} onChange={(e) => setTargetBedId(e.target.value)} required>
                                                <option value="">-- Available Beds --</option>
                                                {freeBeds.map(bed => (
                                                    <option key={bed.bed_id} value={bed.bed_id}>
                                                        {bed.ward_name} - Bed {bed.bed_number}
                                                    </option>
                                                ))}
                                            </select>
                                            {freeBeds.length === 0 && <small className="text-danger">No free beds available.</small>}
                                        </div>
                                        <div className="d-grid"><button type="submit" className="btn btn-primary" disabled={isSubmitting}>Confirm Move</button></div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BedManagement;
