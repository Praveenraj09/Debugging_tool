import React from 'react';

function Footer() {
  return (
    <footer className="sticky-footer bg-white">
      <div className="container my-auto">
        <div className="copyright text-center my-auto">
          <span>Copyright &copy; Ocient 2024</span>
        </div>
      </div>
      <style jsx>{`
        .sticky-footer {
          position: fixed;
          left: 0;
          bottom: 0;
          width: 100%;
          background-color: #f8f9fc; /* Set your desired background color */
          color: black; /* Set your desired text color */
          padding: 2px 0;
          text-align: center;
        }
      `}</style>
    </footer>
  );
}

export default Footer;
