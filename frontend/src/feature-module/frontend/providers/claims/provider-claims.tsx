import React, { useEffect, useState, useMemo} from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BookingModals from '../../customers/common/bookingModals';
import { customerOption, serviceOption, staffOption } from '../../../../core/data/json/dropDownData';
import CustomDropdown from '../../common/dropdown/commonSelect';
import CommonDatePicker from '../../../../core/hooks/commonDatePicker';
import PaymentButton from '../../home/new-home/PaymentButton';
import { jwtDecode } from 'jwt-decode';

// adjust as needed
import axios from "axios";

interface Claim {
    _id: string;
    userId: string; // Reference to the user ID
    parkingId: {
        _id: string;
        nom: string; // Name of the parking
        adresse: string; // Address of the parking
      };    
    claimType: 'Occupied Space' | 'Payment Issue' | 'Security' | 'Other'; // Enum values for the claim type
    image?: string; // Optional URL for photo evidence
    status: 'Valid' | 'Pending' | 'Resolved' | 'Rejected'; // Enum values for the status
    submissionDate: string; // Date of submission (ISO string)
    priority: number; // Priority score
    message?: string; // Optional message from the user
    feedback?: string; // Optional feedback for the claim
  }
  
const ProviderClaims = () => {
  const routes = all_routes;
  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index]; 
      return updatedSelectedItems;
    });
  };
  const [parkings, setParkings] = useState<Record<string, { name: string; image: string; adresse: string }>>({});
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });
   const CLAIMS_PER_PAGE = 5;
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
    const [currentPage, setCurrentPage] = useState(1);
  
    // Calculate total pages
  
  
    // Get paginated CLAIMSs
    const filteredClaims = useMemo(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  
      return claims.filter(claim => {
        const resDate = new Date(claim.submissionDate);
        const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
        const matchesDate =
          dateFilter === 'all' ||
          (dateFilter === 'today' && resDate.toDateString() === today.toDateString()) ||
          (dateFilter === 'tomorrow' && resDate.toDateString() === tomorrow.toDateString()) ||
          (dateFilter === 'week' && resDate >= startOfWeek && resDate <= endOfWeek);
  
        return matchesStatus && matchesDate;
      });
    }, [claims, filterStatus, dateFilter]);
  
  
    const paginatedClaims = useMemo(() => {
      const startIndex = (currentPage - 1) * CLAIMS_PER_PAGE;
      return filteredClaims.slice(startIndex, startIndex + CLAIMS_PER_PAGE);
    }, [currentPage, filteredClaims]);
  
    const totalPages = Math.ceil(filteredClaims.length / CLAIMS_PER_PAGE);
  
  
    // Pagination click handler
    const handlePageChange = (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    };
  

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // Is it a JWT token or JSON object?
        if (storedUser.startsWith('{')) {
          // It's a JSON string (not a token)
          const user = JSON.parse(storedUser);
          console.log("Loaded user object from localStorage:", user);
          setUserInfo({
            _id: user._id || '',
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        } else {
          // It's probably a JWT token
          const decoded: any = jwtDecode(storedUser);
          console.log("Decoded user from JWT token:", decoded);
          setUserInfo({
            _id: decoded._id || '',
            firstname: decoded.firstname || '',
            lastname: decoded.lastname || '',
            email: decoded.email || '',
            phone: decoded.phone || ''
          });
        }
      } catch (err) {
        console.error('Error processing stored user:', err);
      }
    }
  }, []);
  
  useEffect(() => {
    const fetchClaims = async () => {
      if (userInfo._id) {
      try {
        const res = await axios.get(`http://localhost:4000/api/claims/by-user/${userInfo._id}`);
        console.log("Fetched claims:", res.data);

        setClaims(res.data);  // Access the array inside 'data'
      } catch (error) {
        console.error("Failed to fetch claims:", error);
      }
    }
    };

    fetchClaims();
  }, [userInfo._id]);

  const countClaimsByStatus = (claims: Claim[]) => {
    const counts = {
      Valid: 0,
      Resolved: 0,
      Rejected: 0
    };

    claims.forEach((claim) => {

       if (claim.status === 'Valid') {
        counts.Valid += 1;
      } else if (claim.status === 'Resolved') {
        counts.Resolved += 1;
      }else if (claim.status === 'Rejected') {
        counts.Rejected += 1;
      }
    });
    return counts;
  };
  const [claimCount, setClaimCount] = useState({
      Valid: 0,
      Resolved: 0,
      Rejected: 0
  });

   useEffect(() => {
      // Calculate counts whenever claims change
      if (claims.length > 0) {
        const counts = countClaimsByStatus(claims);
        setClaimCount(counts);
      }
    }, [claims]); // Only rerun when claims change
    const percentageValid = Math.round((claimCount.Valid / (claimCount.Resolved + claimCount.Valid + claimCount.Rejected)) * 100);
    const percentageResolved = Math.round((claimCount.Resolved / (claimCount.Resolved + claimCount.Valid + claimCount.Rejected)) * 100);
    const percentageRejected = Math.round((claimCount.Rejected / (claimCount.Resolved + claimCount.Valid + claimCount.Rejected)) * 100);

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="row">
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                        <h5></h5>
                        <div className="d-flex align-items-center">
                          <Link
                            to={routes.createClaim}
                            className="btn btn-dark d-flex align-items-center"
                          >
                            <i className="ti ti-circle-plus me-2" />
                            New Claim
                          </Link>
                        </div>
                      </div>
                    </div>
          <div className="col-12">
            <div className="row flex-wrap">
              <div className="col-xxl-3 col-md-4 col-sm-6 mb-3">
                <div className="card prov-widget">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-2">
                        <p className="mb-1">Resolved claims</p>
                        <h5>
                          <span className="counter">{claimCount.Resolved}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-success d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-success me-2">
                        {percentageResolved}% <i className="ti ti-arrow-badge-up-filled" />
                      </span>
                      from all claims
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-xxl-3 col-md-4 col-sm-6 mb-3">
                <div className="card prov-widget">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-2">
                        <p className="mb-1">Valid Claim</p>
                        <h5>
                          <span className="counter">{claimCount.Valid}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-info d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-info me-2">
                        {percentageValid}% <i className="ti ti-arrow-badge-down-filled" />
                      </span>
                      from all claims
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-xxl-3 col-md-4 col-sm-6 mb-3">
                <div className="card prov-widget">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-2">
                        <p className="mb-1">Rejected claims</p>
                        <h5>
                          <span className="counter">{claimCount.Rejected}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-danger d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-danger me-2">{percentageRejected}%</span> from all claims
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
          <h4>Claim List</h4>
          <div className="d-flex align-items-center flex-wrap row-gap-3">
                <div className="btn-group me-2">
                  <button
                    className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'all' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'all' ? '#ff6f61' : '', color: dateFilter === 'all' ? 'white' : '' }}
                    onClick={() => setDateFilter('all')}
                  >
                    All Dates
                  </button>
                  <button
                    className={`btn ${dateFilter === 'today' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'today' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'today' ? '#ff6f61' : '', color: dateFilter === 'today' ? 'white' : '' }}
                    onClick={() => setDateFilter('today')}
                  >
                    Today
                  </button>
                  <button
                    className={`btn ${dateFilter === 'tomorrow' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'tomorrow' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'tomorrow' ? '#ff6f61' : '', color: dateFilter === 'tomorrow' ? 'white' : '' }}
                    onClick={() => setDateFilter('tomorrow')}
                  >
                    Tomorrow
                  </button>
                  <button
                    className={`btn ${dateFilter === 'week' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'week' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'week' ? '#ff6f61' : '', color: dateFilter === 'week' ? 'white' : '' }}
                    onClick={() => setDateFilter('week')}
                  >
                    This Week
                  </button>
                </div>
              </div>
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <span className="fs-14 me-2">Sort With Status</span>
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </Link>
                  <div className="dropdown-menu">
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('all')}>
                      All
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('Resolved')}>
                      Resolved
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('Rejected')}>
                      Rejected
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('Valid')}>
                      Valid
                    </Link>
                  </div>
                </div>
              </div>
        </div>
      </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xxl-12 col-lg-12">
            {paginatedClaims.length > 0 ? (
              paginatedClaims.map((claim) => (
                <div key={claim._id} className="card shadow-none booking-list">
                  <div className="card-body d-md-flex align-items-center">
                    <div className="booking-widget d-sm-flex align-items-center row-gap-3 flex-fill mb-3 mb-md-0">
                      <div className="booking-img me-sm-3 mb-3 mb-sm-0">
                        <Link to={routes.map2} className="avatar">
                        <img src={claim.image} alt="Image" />

                        </Link>
                      </div>

                      <div className="booking-det-info">
                        <h6 className="mb-3">
                                                <Link to={`${routes.providerClaims}/${claim._id}`}>
                                                    {claim.claimType || "Other"}
                                                  </Link>
                                                  <span className={`badge ms-2 ${claim?.status === 'Resolved' ? 'badge-soft-success' :
                            claim?.status === 'Pending' ? 'badge-soft-warning' :
                            claim?.status === 'Valid' ? 'badge-soft-warning' :
                              claim?.status === 'Rejected' ? 'badge-soft-danger' :
                                'badge-soft-secondary'
                            }`}>
                            {claim?.status}
                          </span>
                                              
                                                </h6>
                       

                        <ul className="booking-details">
                          
                          <li className="d-flex align-items-center mb-2">
                          </li>

                          <li className="d-flex align-items-center mb-2">
                            <span className="book-item">Location</span>
                            <small className="me-2">: </small>
                            {claim.parkingId.nom || "Unknown"}
                          </li>
                          <li className="d-flex align-items-center mb-2">
                            <span className="book-item">Submission Date</span>
                            <small className="me-2">: </small>
                            {new Date(claim.submissionDate).toLocaleDateString()}{" "}
                            {new Date(claim.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                          </li>
                        </ul>
                      </div>
                    </div>
                </div>
              </div>
              ))
            ) : (
              <p>No claims available.</p>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3 mt-4">
          <div className="value d-flex align-items-center">
            <span>Show</span>
            <select value={CLAIMS_PER_PAGE} disabled>
              <option>{CLAIMS_PER_PAGE}</option>
            </select>
            <span>entries</span>
          </div>

          <div className="d-flex align-items-center justify-content-center">
            <span className="me-2 text-gray-9">
              {((currentPage - 1) * CLAIMS_PER_PAGE) + 1} -{" "}
              {Math.min(currentPage * CLAIMS_PER_PAGE, claims.length)} of {claims.length}
            </span>
            <nav aria-label="Page navigation">
              <ul className="paginations d-flex justify-content-center align-items-center">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <li className="page-item me-2" key={pageNum}>
                    <button
                      className={`page-link-1 d-flex justify-content-center align-items-center ${pageNum === currentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        </div>
    </>
  );
};

export default ProviderClaims;
