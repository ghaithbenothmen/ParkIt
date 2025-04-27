import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import axios from 'axios';

const Review = () => {
  const [reclamations, setReclamations] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<{ name: string; status: string } | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedReclamation, setSelectedReclamation] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [filteredReclamations, setFilteredReclamations] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false); // state for delete modal
  const [reclamationToDelete, setReclamationToDelete] = useState<any | null>(null); // selected reclamation for deletion

  // Values for dropdown filter
  const value = [
    { name: 'Pending Verification', status: 'Pending' },
    { name: 'Archive', status: 'Résolue, Refusée' },
    { name: 'In Progress', status: 'Validée' }
  ];

  // Default the selected value to "In Progress"
  useEffect(() => {
    setSelectedValue(value[2]);
  }, []);

  useEffect(() => {
    fetchReclamations();
  }, []);

  useEffect(() => {
    if (selectedValue) {
      filterReclamations(selectedValue.status);
    } else {
      setFilteredReclamations(reclamations);
    }
  }, [selectedValue, reclamations]);

  const fetchReclamations = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/reclamations');
      setReclamations(response.data);
      setFilteredReclamations(response.data); // Set all data initially
    } catch (error) {
      console.error('Error fetching reclamations', error);
    }
  };

  const filterReclamations = (status: string) => {
    const statuses = status.split(', ');
    setFilteredReclamations(
      reclamations.filter((reclamation) => statuses.includes(reclamation.statut))
    );
  };

  const providerName = (rowData: any) => (
    <div>
      <Link to="#" className="table-profileimage">
        <span>{rowData.utilisateurId?.firstname} {rowData.utilisateurId?.lastname}</span>
      </Link>
    </div>
  );

  const serviceName = (rowData: any) => (
    <div>
      <Link to="#" className="table-imgname">
        <span>{rowData.parkingId?.nom}</span>
      </Link>
    </div>
  );
  const actionButtons = (rowData: any) => (
    <div className="table-actions d-flex">
      <button
        className="delete-table border-none me-2"
        type="button"
        onClick={() => {
          setSelectedReclamation(rowData);
          setFeedback(rowData.feedback || ''); // initialize feedback
          setShowDialog(true);
        }}
      >
        <Icon.MessageSquare className="react-feather-custom" />
      </button>
      <button
        className="delete-table border-none"
        type="button"
        onClick={() => {
          setReclamationToDelete(rowData);
          setShowDeleteModal(true); // Show the delete modal
        }}
      >
        <Icon.Trash2 className="react-feather-custom" />
      </button>
    </div>
  );

  const handleDelete = () => {
    if (!reclamationToDelete) return;

    // Call API or logic to delete the reclamation
    setReclamations((prev) => prev.filter((item) => item._id !== reclamationToDelete._id));
    setShowDeleteModal(false);
  };

  const handleDecision = async (newStatus: string) => {
    if (!selectedReclamation) return;

    try {
      await axios.put(`http://localhost:4000/api/reclamations/${selectedReclamation._id}`, {
        statut: newStatus,
        feedback: feedback.trim(),
      });

      setReclamations((prev) =>
        prev.map((item) =>
          item._id === selectedReclamation._id ? { ...item, statut: newStatus, feedback: feedback.trim() } : item
        )
      );
      setShowDialog(false);
    } catch (error) {
      console.error('Error updating reclamation status', error);
    }
  };

  return (
    <div className="page-wrapper page-settings">
      <div className="content">
        <div className="content-page-header content-page-headersplit">
          <h5>Reclamations</h5>
          <div className="list-btn">
            <ul>
              <li>
                <div className="filter-sorting">
                  <ul>
                    <li>
                      <Link to="#" className="filter-sets">
                        <Icon.Filter className="react-feather-custom me-2" />
                        Filter
                      </Link>
                    </li>
                    <li>
                     
                      <div className="review-sort">
                        <Dropdown
                          value={selectedValue}
                          onChange={(e) => setSelectedValue(e.value)}
                          options={value}
                          optionLabel="name"
                          placeholder="Select Status"
                          className="select admin-select-breadcrumb"
                        />
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <DataTable
                value={filteredReclamations}
                paginator
                rows={10}
                paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                showGridlines
                tableStyle={{ minWidth: '60rem' }}
              >
                <Column sortable field="dateSoumission" header="Date" body={(rowData) => new Date(rowData.dateSoumission).toLocaleDateString()} />
                <Column sortable header="User" body={providerName} />
                <Column sortable header="Parking" body={serviceName} />
                <Column sortable field="typeReclamation" header="Type" />
                <Column sortable field="statut" header="Status" />
                <Column header="Actions" body={actionButtons} />
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <Dialog
  header="Manage Reclamation"
  visible={showDialog}
  style={{ width: '800px', maxWidth: '95vw' }}
  onHide={() => setShowDialog(false)}
  modal
>
  {selectedReclamation && (
    <div className="col-xxl-12 col-lg-12">
    <div className="card shadow-none">
      <div className="card-body">
        <div className="d-md-flex align-items-center">
          <div className="review-widget d-sm-flex flex-fill">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex">
                <span className="review-img me-2">
                  <ImageWithBasePath
                    src="assets/img/providers/provider-14.jpg"
                    className="rounded img-fluid"
                    alt="User Image"
                  />
                </span>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <h6 className="fs-14 me-2">
                      {selectedReclamation.parkingId?.nom}
                      </h6>
                      <span>
                        <i className="ti ti-star-filled text-warning" />
                      </span>
                      <span>
                        <i className="ti ti-star-filled text-warning" />
                      </span>
                      <span>
                        <i className="ti ti-star-filled text-warning" />
                      </span>
                      <span>
                        <i className="ti ti-star-filled text-warning" />
                      </span>
                      <span>
                        <i className="ti ti-star-filled text-warning" />
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <h6 className="fs-13 me-2">{selectedReclamation.utilisateurId?.firstname} {selectedReclamation.utilisateurId?.lastname},</h6>
                    <span className="fs-12">{new Date(selectedReclamation.dateSoumission).toLocaleString()}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div className="user-icon d-inline-flex">
            <Link to="#" className="me-2">
              <i className="ti ti-edit" />
            </Link>
            <Link to="#" className="">
              <i className="ti ti-trash" />
            </Link>
          </div>
        </div>
        <div>
          <p className="fs-14">
          {selectedReclamation.message}

          </p>
        </div>
      </div>
    </div>
  </div>
  )}

  {/* Feedback field for admin */}
  <div className="mb-3">
    <strong>Admin Feedback:</strong>
    <textarea
      className="form-control mt-2"
      value={feedback}
      onChange={(e) => setFeedback(e.target.value)}
      placeholder="Enter feedback here"
      rows={3}
    />
  </div>

  <div className="text-end">
    <button
      type="button"
      className="btn btn-success me-2"
      onClick={() => handleDecision('Résolue')}
    >
      Approve
    </button>
    <button
      type="button"
      className="btn btn-danger"
      onClick={() => handleDecision('Refusée')}
    >
      Reject
    </button>
  </div>
</Dialog>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }} id="delete-item" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body py-4">
                <p>Are you sure you want to delete this reclamation?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
