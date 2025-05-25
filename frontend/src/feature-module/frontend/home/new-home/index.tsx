import React, { useEffect, useState } from 'react'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'
import { Link, useNavigate } from 'react-router-dom'
import { all_routes } from '../../../../core/data/routes/all_routes'
import FeatureSection from './feature-section'
import PopularSection from './popular-section'
import WorkSection from './workSection'
import CustomerSection from './customerSection'
import BussinessWithUs from './bussinessWithUs'
import HomeHeader from '../header/home-header'
import NewFooter from '../footer/newFooter'
import AuthModals from './authModals'
import axios from 'axios'
import { MapPin, Search, Sliders } from 'react-feather'
import { Dropdown } from 'primereact/dropdown'

const NewHome = () => {
  const routes = all_routes
  const navigate = useNavigate()
  const [location, setLocation] = useState('') // Location entered by user
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([]) // Search suggestions
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null) // Distance filter in km
  const [parkingCount, setParkingCount] = useState<number>(0);
  const [reservationCount, setReservationCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [showFilter, setShowFilter] = useState(false);
  const [priceFilter, setPriceFilter] = useState<number>(0);

  // Toast state for search error
  const [showSearchError, setShowSearchError] = useState(false);

  // Ref for the search input
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearchError && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (showSearchError) {
      const timer = setTimeout(() => setShowSearchError(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showSearchError]);

  const fetchCounts = async () => {
    try {
      const [parkingsRes, reservationsRes, reviewsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/count`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/count`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/reviews`)
      ]);
      
      setParkingCount(parkingsRes.data?.count || 215);
      setReservationCount(reservationsRes.data?.count || 90000);
      
      // Calculate average rating and count from reviews
      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const totalRating = reviewsRes.data.reduce((sum: number, review: any) => sum + review.rating, 0);
        setAverageRating(parseFloat((totalRating / reviewsRes.data.length).toFixed(1)));
        setReviewCount(reviewsRes.data.length);
      }
      
    } catch (error) {
      console.error('Error fetching counts:', error);
      setParkingCount(215);
      setReservationCount(90000);
      setAverageRating(4.9);
      setReviewCount(255);
    }
  };

useEffect(() => {
  fetchCounts();
}, []);



  // Distance filter options
  const distanceOptions = [
    
    { label: 'radius of 10 km', value: 10 },
    { label: 'radius of 20 km', value: 20 },
    { label: 'radius of 30 km', value: 30 },
    { label: 'radius of 40 km', value: 40 },
    { label: 'radius of 50 km', value: 50 },
    { label: 'All car parks', value: 1000 }
  ]

  // Helper function to calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in km
  }

  // Fetch location suggestions from Nominatim API
  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocation(query)
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`
        )
        setSuggestions(response.data)
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
      }
    } else {
      setSuggestions([])
    }
  }

  // Handle the selection of a location from suggestions
  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    setLocation(name) // Set the input field to the selected location name
    setSuggestions([]) // Clear suggestions
    setCurrentPosition([lat, lon]) // Set the selected position
  }

  // Get user's current location if they click the button
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition([position.coords.latitude, position.coords.longitude])
          setLocation('Your Location') // Set input to "Your Location"
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to retrieve location.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  // Search button click handler
  const handleSearch = () => {
    if (!location) {
      setShowSearchError(true);
      return;
    }
    navigate('/map', {
      state: {
        location: location === 'Your Location' ? currentPosition : location,
        currentPosition,
        distanceFilter,
        priceFilter
      }
    });
  };

  // Handler for "View results" in filter
  const handleViewResults = () => {
    setShowFilter(false);
    setTimeout(() => {
      if (!location && searchInputRef.current) {
        searchInputRef.current.focus();
        setShowSearchError(true);
      } else {
        handleSearch();
      }
    }, 100);
  };

  // Price filter options
  const priceOptions = [
    { label: 'Up to 5 DT', value: 5 },
    { label: 'Up to 10 DT', value: 10 },
    { label: 'Up to 15 DT', value: 15 },
  ]

  return (
    <>
      {/* Custom Toast for search error */}
      <div
        style={{
          position: 'fixed',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3000,
          minWidth: 320,
          maxWidth: 400,
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid #ffbdbd',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: '1rem 1.5rem',
          fontWeight: 500,
          color: '#b71c1c',
          display: showSearchError ? 'flex' : 'none',
          alignItems: 'center',
          gap: 14,
          pointerEvents: 'auto'
        }}
        role="alert"
        aria-live="assertive"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
          <circle cx="12" cy="12" r="12" fill="#ffebee"/>
          <path d="M12 7v5m0 4h.01" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>
          Please enter a location or use your current location.
        </span>
      </div>
      <HomeHeader type={1} />
      <>
        {/* Hero Section */}
        <section className="hero-section" id="home">
          <div className="hero-content position-relative overflow-hidden">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div
                    className="wow fadeInUp"
                    data-wow-duration="1s"
                    data-wow-delay=".25s"
                  >
                    <h1 className="mb-2">
                      Find the perfect parking{" "}
                      <span className="typed" data-type-text="Carpenters">spot</span>
                    </h1>
                    <p className="mb-3 sub-title">
                      We can help you find the right spot, fast , effortless, save your
                      time.
                    </p>
                    {/* Search bar aligned just below the title/description */}
                    <div
                      className="d-flex justify-content-start"
                      style={{ width: '100%' }}
                    >
                      <div
                        className="banner-form border mb-3"
                        style={{
                          background: '#f8f8fa',
                          borderRadius: '18px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          border: '1px solid #ececec',
                          padding: '18px 0px 12px 0px',
                          marginBottom: '1.5rem',
                          maxWidth: 490,
                          width: '100%',
                          marginLeft: 0,
                          marginRight: 0
                        }}
                      >
                        <form>
                          <div className="row g-2 flex-nowrap" style={{ flexWrap: 'nowrap' }}>
                            {/* Location input */}
                            <div className="col-12 col-md-8" style={{ flex: '1 1 0', minWidth: 0 }}>
                              <div style={{ position: 'relative' }}>
                                <div className="input-group" style={{ background: 'transparent' }}>
                                  <span className="input-group-text px-1" style={{ background: 'transparent', border: 'none' }}>
                                    <MapPin
                                      style={{ cursor: 'pointer', color: '#9b0e16', fontSize: '24px' }}
                                      onClick={handleUseCurrentLocation}
                                    />
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Location"
                                    value={location}
                                    onChange={handleLocationChange}
                                    ref={searchInputRef}
                                    style={{
                                      height: '38px',
                                      fontSize: '0.95rem',
                                      paddingTop: '4px',
                                      paddingBottom: '4px',
                                      background: 'transparent',
                                      border: 'none',
                                      boxShadow: 'none'
                                    }}
                                  />
                                </div>
                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                  <ul
                                    style={{
                                      maxHeight: '200px',
                                      overflowY: 'auto',
                                      position: 'absolute',
                                      background: '#fff',
                                      border: '1px solid #ccc',
                                      width: '100%',
                                      zIndex: 10,
                                      top: '100%',
                                      left: 0,
                                      marginTop: '-5px',
                                      borderRadius: '0 0 5px 5px',
                                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }}
                                  >
                                    {suggestions.map((suggestion) => (
                                      <li
                                        key={suggestion.place_id}
                                        onClick={() =>
                                          handleSelectLocation(suggestion.lat, suggestion.lon, suggestion.display_name)
                                        }
                                        style={{
                                          cursor: 'pointer',
                                          padding: '8px 15px',
                                          borderBottom: '1px solid #eee',
                                          transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                      >
                                        {suggestion.display_name}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                            {/* Search & Filter buttons */}
                            <div className="col-auto d-flex gap-2 align-items-center" style={{ flex: '0 0 auto' }}>
                              <button
                                type="button"
                                className="btn btn-light d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '50%', width: 44, height: 44, padding: 0 }}
                                onClick={() => setShowFilter(true)}
                                aria-label="Open filters"
                              >
                                <Sliders color="#9b0e16" size={22} />
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSearch();
                                }} 
                                className="btn btn-linear-primary d-flex align-items-center justify-content-center"
                                style={{
                                  borderRadius: '50%',
                                  width: 44,
                                  height: 44,
                                  padding: 0,
                                  
                                  marginRight: '8px' // Ajoute un espace à droite du bouton
                                }}
                                aria-label="Search"
                              >
                                <Search style={{ fontSize: '15px' }} />
                              </button>
                            </div>
                          </div>
                        </form>
                        <ImageWithBasePath
                          src="assets/img/bg/bg-06.svg"
                          alt="img"
                          className="shape-06 round-animate"
                        />
                      </div>
                    </div>
                    <div className="d-flex align-items-center flex-wrap banner-info">
                    <div className="d-flex align-items-center me-4 mt-4">
                      <ImageWithBasePath src="assets/img/icons/success-01.svg" alt="icon" />
                      <div className="ms-2">
                        <h6>{parkingCount.toLocaleString()}+</h6>
                        <p>Verified Parkings</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center me-4 mt-4">
                      <ImageWithBasePath src="assets/img/icons/success-02.svg" alt="icon" />
                      <div className="ms-2">
                        <h6>{reservationCount.toLocaleString()}+</h6>
                        <p>Reservations Completed</p>
                      </div>
                    </div>
                      <div className="d-flex align-items-center me-4 mt-4">
                        <ImageWithBasePath src="assets/img/icons/success-03.svg" alt="icon" />
                        <div className="ms-2">
                          <h6>{reviewCount.toLocaleString()} </h6>
                          <p>Reviews Globally</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="banner-img wow fadeInUp"
                  data-wow-duration="1s"
                  data-wow-delay=".25s"
                >
                  <ImageWithBasePath
                    src="assets/img/home-home.png"
                    alt="img"
                    className="img-fluid animation-float"
                  />
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="d-inline-flex bg-white p-2 rounded align-items-center shape-01 floating-x">
                <span className="avatar avatar-md bg-warning rounded-circle me-2">
                  {/* Replace <i className="ti ti-star-filled" /> with a Unicode star */}
                  <span style={{ color: '#00000', fontSize: 20, lineHeight: 1 }}>★</span>
                </span>
                <span>
                  {averageRating} / 5<small className="d-block">({reviewCount} reviews)</small>
                </span>
                <i className="border-edge" />
              </div>
              <div className="d-inline-flex bg-white p-2 rounded align-items-center shape-02 floating-x">
                <span className="me-2">
                  <ImageWithBasePath src="assets/img/icons/tick-banner.svg" alt="Reservation Icon" />
                </span>
                <p className="fs-12 text-dark mb-0">
                  {reservationCount.toLocaleString()} Reservations Completed
                </p>
                <i className="border-edge" />
              </div>
              <ImageWithBasePath src="assets/img/bg/bg-03.svg" alt="img" className="shape-03" />
              <ImageWithBasePath src="assets/img/bg/bg-04.svg" alt="img" className="shape-04" />
              <ImageWithBasePath src="assets/img/bg/bg-05.svg" alt="img" className="shape-05" />
            </div>
          </div>
        </section>
        {/* /Hero Section */}
        
        <FeatureSection />
        <PopularSection />
        <WorkSection />
        <CustomerSection />
        <BussinessWithUs />
        <NewFooter />
      </>
      <AuthModals />
      {/* Filter Drawer/Modal */}
      {showFilter && (
        <>
          {/* Overlay noir comme les modals Bootstrap */}
          <div
            className="modal-backdrop fade show"
            style={{
              zIndex: 1999,
              background: 'rgba(33, 37, 41, 0.7)' // noir Bootstrap avec opacité
            }}
          ></div>
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: 420,
              height: '100%',
              background: '#fff',
              zIndex: 2000,
              boxShadow: '-2px 0 16px rgba(0,0,0,0.15)',
              transition: 'right 0.3s',
              overflowY: 'auto',
            }}
          >
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Filter</h4>
                <button
                  className="btn btn-light"
                  style={{ borderRadius: '50%' }}
                  onClick={() => setShowFilter(false)}
                >
                  <span style={{ fontSize: 22, fontWeight: 'bold' }}>&times;</span>
                </button>
              </div>
              {/* Total price */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Price Hr</span>
                  <span>
                    {priceFilter > 0
                      ? `Up to ${priceFilter} DT`
                      : 'Any'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={priceFilter}
                  onChange={e => setPriceFilter(Number(e.target.value))}
                  className="form-range"
                  style={{
                    accentColor: '#282B8B'
                  }}
                />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {[0, 5, 10, 15].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`btn ${priceFilter === val ? '' : 'btn-outline-secondary'}`}
                      style={{
                        borderRadius: 16,
                        minWidth: 110,
                        background: priceFilter === val ? '#9b0e16' : '',
                        color: priceFilter === val ? '#fff' : '',
                        border: priceFilter === val ? '1px solid #9b0e16' : ''
                      }}
                      onClick={() => setPriceFilter(val)}
                    >
                      {val === 0 ? 'Any' : `Up to ${val} DT`}
                    </button>
                  ))}
                </div>
              </div>
              {/* Distance */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Distance</span>
                  <span>Up to {distanceFilter || 0} km</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={distanceFilter || 0}
                  onChange={e => setDistanceFilter(Number(e.target.value))}
                  className="form-range"
                  style={{
                    accentColor: '#2563eb'
                  }}
                />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {[1, 3, 5, 10, 20, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`btn ${distanceFilter === val ? '' : 'btn-outline-secondary'}`}
                      style={{
                        borderRadius: 16,
                        minWidth: 110,
                        background: distanceFilter === val ? '#9b0e16' : '',
                        color: distanceFilter === val ? '#fff' : '',
                        border: distanceFilter === val ? '1px solid #9b0e16' : ''
                      }}
                      onClick={() => setDistanceFilter(val)}
                    >
                      Up to {val} km
                    </button>
                  ))}
                </div>
              </div>
              {/* Footer actions */}
              <div className="d-flex justify-content-between align-items-center mt-5 gap-2">
                <button
                  className="btn btn-outline-secondary w-50"
                  onClick={() => {
                    setPriceFilter(0);
                    setDistanceFilter(null);
                  }}
                >
                  Clear filters
                </button>
                <button
                  className="btn w-50"
                  style={{ background: '#9b0e16', color: '#fff', border: 'none' }}
                  onClick={handleViewResults}
                >
                  View results
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default NewHome