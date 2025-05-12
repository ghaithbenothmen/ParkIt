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
      const normalizedParkings = response.data.map(parking => ({
        ...parking,
        images: parking.images ? parking.images.map(img => 
          img.startsWith('/uploads/parkings/') ? img : `/uploads/parkings/${img}`
        ) : []
      }));
      setParkings(normalizedParkings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
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

        <Slider {...sliderSettings} className="mt-4">
          {parkings.map((parking) => (
            <div className="service-item h-100" key={parking._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <Link 
                to={`/parkings/parking-details/${parking._id}`}
                style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div className="service-img" style={{ height: '200px', overflow: 'hidden' }}>
                  {parking.images && parking.images.length > 0 ? (
                    <img
                      src={`http://localhost:4000${parking.images[0]}`}
                      className="img-fluid w-100 h-100"
                      alt={`Parking ${parking.nom}`}
                      style={{ 
                        objectFit: 'cover',
                        borderRadius: '8px 8px 0 0'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'http://localhost:4000/uploads/parkings/default.jpg';
                        target.style.objectFit = 'cover';
                      }}
                    />
                  ) : (
                    <ImageWithBasePath
                      src="assets/img/parking.jpg"
                      className="img-fluid w-100 h-100"
                      alt={`Parking ${parking.nom}`}
                      style={{ 
                        objectFit: 'cover',
                        borderRadius: '8px 8px 0 0'
                      }}
                    />
                  )}
                </div>
                <div className="service-content p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <h6 className="mb-1">{parking.nom}</h6>
                    <p className="text-muted mb-2">{parking.adresse}</p>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">
                        {parking.nbr_place} places disponibles
                      </span>
                      <span className="text-primary fw-bold">
                        {parking.tarif_horaire} DT/h
                      </span>
                    </div>
                  </div>
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