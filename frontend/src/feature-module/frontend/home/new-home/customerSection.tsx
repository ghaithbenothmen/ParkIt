import React, { useEffect, useState } from 'react'
import Slider from 'react-slick';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

interface Review {
  _id: string;
  parkingId: {
    nom: string;
  };
  userId: {
    firstname: string;
    lastname: string;
    image: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const CustomerSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsRes = await axios.get('http://localhost:4000/api/reviews');
      const sortedReviews = reviewsRes.data.sort((a: Review, b: Review) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sortedReviews);

      // Calculer les statistiques
      const total = sortedReviews.length;
      const avg = sortedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / total;
      
      setTotalReviews(total);
      setAverageRating(Number(avg.toFixed(1)));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star ${
          index < rating ? 'text-warning' : 'text-muted'
        } me-1`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Days Ago`;
  };

  const imgslideroption = {
    dots: false,
    nav: false,
    infinite: true,
    speed: 500,
    swipe:true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="section service-section white-section testimonial-section" id="reviews">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header text-center">
              <h2 className="mb-1">
                Genuine reviews from{" "}
                <span className="text-linear-primary">Customers</span>
              </h2>
              <p className="sub-title">
                Read what our customers have to say about their parking experiences
              </p>
            </div>
          </div>
        </div>

        <Slider {...imgslideroption} className="service-slider owl-carousel nav-center">
          {reviews.map((review) => (
            <div key={review._id} className="testimonial-item wow fadeInUp" data-wow-delay="0.2s">
              <div className="d-flex align-items-center mb-3">
                {renderStars(review.rating)}
              </div>
              <h5 className="mb-2">{review.parkingId.nom}</h5>
              <p className="mb-4">
                &ldquo;{review.comment}&rdquo;
              </p>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center overflow-hidden">
                  <span className="avatar avatar-lg flex-shrink-0">
                    <ImageWithBasePath
                      src={review.userId.image || "assets/img/user.jpg"}
                      className="img-fluid rounded-circle"
                      alt={review.userId.firstname}
                    />
                  </span>
                  <h6 className="text-truncate ms-2">
                    {`${review.userId.firstname} ${review.userId.lastname}`}
                  </h6>
                </div>
                <p>{formatDate(review.createdAt)}</p>
              </div>
            </div>
          ))}
        </Slider>

        <div className="text-center wow fadeInUp" data-wow-delay="0.2s">
          <h6 className="mb-2">
            Average rating based on customer reviews
          </h6>
          <p>
            <span className="text-dark fw-medium">
              {averageRating === 5 ? "Excellent" : 
               averageRating >= 4 ? "Very Good" :
               averageRating >= 3 ? "Good" :
               averageRating >= 2 ? "Fair" : "Poor"}
            </span>
            {renderStars(Math.round(averageRating))}
            <span className="fs-14">Based on {totalReviews} reviews</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;