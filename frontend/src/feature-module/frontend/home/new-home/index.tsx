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
import { MapPin, Search } from 'react-feather'
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

  const fetchCounts = async () => {
    try {
      const [parkingsRes, reservationsRes, reviewsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/parking/count'),
        axios.get('http://localhost:4000/api/reservations/count'),
        axios.get('http://localhost:4000/api/reviews')
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
      alert('Please enter a location or use your current location')
      return
    }

    navigate('/map', {
      state: {
        location: location === 'Your Location' ? currentPosition : location,
        currentPosition,
        distanceFilter
      }
    })
  }

  return (
    <>
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
                    <div className="banner-form bg-white border mb-3">
                      <form>
                        <div className="d-md-flex align-items-center">
                          {/* Address input field */}
                          <div className="input-group mb-2" style={{ position: 'relative' }}>
                            <span className="input-group-text px-1">
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
                              style={{ paddingRight: '120px' }}
                            />
                            
                            {/* Distance filter dropdown */}
                            <div style={{
                              position: 'absolute',
                              right: '100px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '120px',
                              zIndex: 5
                            }}>
                              <Dropdown
                                value={distanceFilter}
                                options={distanceOptions}
                                onChange={(e) => setDistanceFilter(e.value)}
                                placeholder="Distance"
                                className="border-0"
                                disabled={!currentPosition}
                                tooltip={!currentPosition ? "Select a location first to filter by distance" : ""}
                              />
                            </div>
                            
                           
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSearch();
                            }} 
                            className="btn btn-linear-primary"
                            style={{ zIndex: 5, marginLeft: '-50px' }}
                          >
                            <Search style={{ fontSize: '15px', marginRight: '0px' }} /> Search
                          </button>

                          {/* Display suggestions below input */}
                          {suggestions.length > 0 && (
                            <ul
                              style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                position: 'absolute',
                                background: '#fff',
                                border: '1px solid #ccc',
                                width: 'calc(100% - 30px)',
                                zIndex: 10,
                                top: '100%',
                                left: '15px',
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
                      </form>
                      <ImageWithBasePath
                        src="assets/img/bg/bg-06.svg"
                        alt="img"
                        className="shape-06 round-animate"
                      />
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
                  <i className="ti ti-star-filled" />
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
        {/* Category Section */}
        <section className="section category-section">
          <div className="container">
            <div className="row justify-content-center">
              <div
                className="col-lg-6 text-center wow fadeInUp"
                data-wow-delay="0.2s"
              >
                <div className="section-header text-center">
                  <h2 className="mb-1">
                    Explore our{" "}
                    <span className="text-linear-primary">Parkings</span>
                  </h2>
                  <p className="sub-title">
                    Parking categories help organize and structure the available parking options on the app,
                    making it easier for users to find a spot that suits their needs.
                  </p>
                </div>
              </div>
            </div>
            <div className="row g-4 row-cols-xxl-6 row-cols-xl-6 row-cols-md-4 row-cols-sm-2 row-cols-1 justify-content-center">
              <div className="col d-flex">
                <div
                  className="category-item text-center flex-fill wow fadeInUp"
                  data-wow-delay="0.2s"
                >
                  <div className="mx-auto mb-3">
                    <ImageWithBasePath
                      src="assets/img/icons/category-01.svg"
                      className="img-fluid"
                      alt="img"
                    />
                  </div>
                  <h6 className="fs-14 mb-1">Street Parking</h6>
                  <p className="fs-14 mb-0">900+</p>
                  <Link
                    to={routes.categories}
                    className="link-primary text-decoration-underline fs-14"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="col d-flex">
                <div
                  className="category-item text-center flex-fill wow fadeInUp"
                  data-wow-delay="0.2s"
                >
                  <div className="mx-auto mb-3">
                    <ImageWithBasePath
                      src="assets/img/icons/category-02.svg"
                      className="img-fluid"
                      alt="img"
                    />
                  </div>
                  <h6 className="fs-14 mb-1">Covered Parking</h6>
                  <p className="fs-14 mb-0">787+</p>
                  <Link
                    to={routes.categories}
                    className="link-primary text-decoration-underline fs-14"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="col d-flex">
                <div
                  className="category-item text-center flex-fill wow fadeInUp"
                  data-wow-delay="0.2s"
                >
                  <div className="mx-auto mb-3">
                    <ImageWithBasePath
                      src="assets/img/icons/category-13.svg"
                      className="img-fluid"
                      alt="img"
                    />
                  </div>
                  <h6 className="fs-14 mb-1">VIP Parking</h6>
                  <p className="fs-14 mb-0">235</p>
                  <Link
                    to={routes.categories}
                    className="link-primary text-decoration-underline fs-14"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="col d-flex">
                <div
                  className="category-item text-center flex-fill wow fadeInUp"
                  data-wow-delay="0.2s"
                >
                  <div className="mx-auto mb-3">
                    <ImageWithBasePath
                      src="assets/img/icons/category-04.svg"
                      className="img-fluid"
                      alt="img"
                    />
                  </div>
                  <h6 className="fs-14 mb-1">Handicap Accessible Parking</h6>
                  <p className="fs-14 mb-0">1260</p>
                  <Link
                    to={routes.categories}
                    className="link-primary text-decoration-underline fs-14"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="col d-flex">
                <div
                  className="category-item text-center flex-fill wow fadeInUp"
                  data-wow-delay="0.2s"
                >
                  <div className="mx-auto mb-3">
                    <ImageWithBasePath
                      src="assets/img/icons/category-06.svg"
                      className="img-fluid"
                      alt="img"
                    />
                  </div>
                  <h6 className="fs-14 mb-1">Monthly Parking</h6>
                  <p className="fs-14 mb-0">2546</p>
                  <Link
                    to={routes.categories}
                    className="link-primary text-decoration-underline fs-14"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="col d-flex">
                <div
                  className="category-item text-center flex-fill wow fadeInUp"
                  data-wow-delay="0.2s"
                >
                  <div className="mx-auto mb-3">
                    <ImageWithBasePath
                      src="assets/img/icons/category-07.svg"
                      className="img-fluid"
                      alt="img"
                    />
                  </div>
                  <h6 className="fs-14 mb-1">Hourly Parking</h6>
                  <p className="fs-14 mb-0">4547</p>
                  <Link
                    to={routes.categories}
                    className="link-primary text-decoration-underline fs-14"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* /Category Section */}
        <FeatureSection />
        <PopularSection />
        <WorkSection />
        <CustomerSection />
        <BussinessWithUs />
        <NewFooter />
      </>
      <AuthModals />
    </>
  )
}

export default NewHome