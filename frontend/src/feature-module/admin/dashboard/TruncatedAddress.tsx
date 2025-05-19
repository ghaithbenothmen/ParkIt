import React, { useState } from 'react';

interface TruncatedAddressProps {
  address: string;
  maxLength?: number;
}

const TruncatedAddress: React.FC<TruncatedAddressProps> = ({ address, maxLength = 20 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!address) return <span>—</span>;

  const isLongAddress = address.length > maxLength;
  const truncatedAddress = isLongAddress ? `${address.slice(0, maxLength)}...` : address;

  return (
    <span>
      {isExpanded || !isLongAddress ? address : truncatedAddress}
      {isLongAddress && (
        <span
          className="text-primary cursor-pointer ms-1"
          style={{ color: '#007bff' }} // Fallback to ensure blue color
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          aria-label={isExpanded ? 'Collapse address' : 'Expand address'}
        >
          {isExpanded ? '[-]' : '[...]'}
        </span>
      )}
    </span>
  );
};

export default TruncatedAddress;