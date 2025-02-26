import React from 'react';

interface QRCodeModalProps {
  qrCodeUrl: string; // qrCodeUrl must be a string
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ qrCodeUrl, onClose }) => {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3>Scan the QR Code</h3>
        <img
          src={qrCodeUrl} // Utilisez l'URL du code QR
          alt="QR Code"
          style={{ width: '200px', height: '200px' }} // Ajustez la taille si nécessaire
        />
        <p>{qrCodeUrl}</p>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  qrCodeImage: {
    width: '200px',
    height: '200px',
    margin: '20px 0',
  },
  closeButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default QRCodeModal;