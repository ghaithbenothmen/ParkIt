import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import axios from 'axios';

const FeatureSection = () => {
  const [parkings, setParkings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  const fetchParkings = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/parking');
      setParkings(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="text-center py-5">Error: {error}</div>;
  if (parkings.length === 0) return <div className="text-center py-5">No parkings available</div>;

  return (
    <section className="section service-section" id="parkings">
      <div className="container">
        {/* Nouvelle section d'en-tête intégrée */}
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header text-center">
              <h2 className="mb-1">
                Our Featured <span className="text-linear-primary">Parkings</span>
              </h2>
              <p className="sub-title">
                Each parking spot is designed to be clear and concise,
                providing users with all the necessary details to make an informed decision.
              </p>
            </div>
          </div>
        </div>
        {/* Fin de la section d'en-tête */}

        <Slider {...sliderSettings} className="mt-4"> {/* Ajout de marge en haut */}
          {parkings.map((parking) => (
            <div className="service-item" key={parking._id}>
              <Link 
                to={`/parkings/parking-details/${parking._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="service-img">
                  <ImageWithBasePath
                    src="assets/img/parking.jpg"
                    className="img-fluid"
                    alt={`Parking ${parking.nom}`}
                  />
                </div>
                <div className="service-content">
                  <h6>{parking.nom}</h6>
                  <p>{parking.adresse}</p>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default FeatureSection;