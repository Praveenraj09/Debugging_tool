import React, { useState } from 'react';

function LogoutModal() {
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
    setShowModal(false);
  };

  return (
    <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} id="logoutModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
            <button className="close" type="button" onClick={() => setShowModal(false)} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
