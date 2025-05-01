import React, { useEffect, useState } from 'react';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

interface Parking {
  _id: string;
  nom: string;
  adresse: string;
  nbr_place: number;
  tarif_horaire: number;
  disponibilite: boolean;
  averageRating: number;
  reviewCount: number;
  images?: string[];
}

const PopularSection = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [filteredParkings, setFilteredParkings] = useState<Parking[]>([]);
  const [activeRating, setActiveRating] = useState<number>(0);

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/parking');
      setParkings(response.data);
      setFilteredParkings(response.data);
    } catch (error) {
      console.error('Error fetching parkings:', error);
    }
  };

  const filterByRating = (rating: number) => {
    setActiveRating(rating);
    if (rating === 0) {
      setFilteredParkings(parkings);
    } else {
      const filtered = parkings.filter(parking => 
        Math.floor(parking.averageRating) === rating
      );
      setFilteredParkings(filtered);
    }
  };

  const imgslideroption = {
    dots: false,
    arrows: true, // Ajout des flèches de navigation
    infinite: false, // Changé à false pour éviter la duplication
    speed: 500,
    swipe: true,
    slidesToShow: 4,
    slidesToScroll: 4, // Modifié pour défiler par groupe de 4
    responsive: [
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Ajouter cette fonction pour le rendu des étoiles
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${index < rating ? 'text-warning' : 'text-muted'}`}
        style={{ fontSize: '12px' }}
      />
    ));
  };

  return (
    <section className="section popular-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header text-center mb-4">
              <h2 className="mb-1">
                Our Popular <span className="text-linear-primary">Parkings</span>
              </h2>
              <p className="sub-title">
                Find the best rated parking spots in your area
              </p>
            </div>
          </div>
        </div>

        {/* Rating Filter Tabs */}
        <div className="filter-buttons-container mb-4">
          <button
            className={`filter-button ${activeRating === 0 ? 'active' : ''}`}
            onClick={() => filterByRating(0)}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              className={`filter-button ${activeRating === rating ? 'active' : ''}`}
              onClick={() => filterByRating(rating)}
            >
              <span className="stars-container">
                {renderStars(rating)}
              </span>
              <span className="rating-count">({rating}.0)</span>
            </button>
          ))}
        </div>

        {/* Parkings Display */}
        <div className="tab-content">
          <div className="tab-pane fade active show">
            {filteredParkings.length > 0 ? (
              <Slider {...imgslideroption} className="main-slider">
                {filteredParkings.map((parking) => (
                  <div key={parking._id} className="p-2">
                    <div className="service-item wow fadeInUp" data-wow-delay="0.2s">
                      <div className="service-img">
                        <Link to={`/parkings/parking-details/${parking._id}`}> {/* Modifié ici */}
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt={parking.nom}
                          />
                        </Link>
                        <div className="fav-item d-flex align-items-center justify-content-between w-100">
                          <span className="fs-14 text-white bg-dark px-2 py-1 rounded">
                            {parking.nbr_place} spots
                          </span>
                          <Link to="#" className="fav-icon">
                            <i className="ti ti-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="service-content">
                        <h6 className="mb-1 text-truncate">
                          <Link to={`/parkings/parking-details/${parking._id}`}> {/* Modifié ici aussi */}
                            {parking.nom}
                          </Link>
                        </h6>
                        <div className="d-flex align-items-center justify-content-between">
                          <p className="fs-14 mb-0">
                            <i className="ti ti-star-filled text-warning me-1" />
                            {parking.averageRating.toFixed(1)} ({parking.reviewCount} reviews)
                          </p>
                          <small>{parking.tarif_horaire}DT/hour</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="text-center py-4">
                <p>No parkings found with {activeRating} star rating.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularSection;
