import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="text-center">
        <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
          <span className="sr-only">{text}</span>
        </div>
        {text && (
          <div className="mt-2">
            <small className="text-muted">{text}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
