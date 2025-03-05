import React from 'react';
import { Link } from 'react-router-dom';

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => {
  return (
    <div className="modal fade show" id="success-modal" tabIndex={-1} style={{ display: 'block' }} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
            <Link to="#" onClick={onClose} aria-label="Close">
              <i className="ti ti-circle-x-filled fs-20" />
            </Link>
          </div>
          <div className="modal-body p-4">
            <div className="text-center">
              <span className="success-check mb-3 mx-auto" style={{
                display: 'inline-block',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#28a745',
                color: 'white',
                fontSize: '24px',
                lineHeight: '50px',
                textAlign: 'center'
              }}>
                <i className="ti ti-check" />
              </span>
              <h4 className="mb-2">Success</h4>
              <p>{message}</p>
              <div>
                <button
                  type="button"
                  className="btn btn-lg btn-linear-primary w-100"
                  onClick={onClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;