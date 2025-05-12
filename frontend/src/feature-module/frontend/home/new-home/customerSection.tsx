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
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleShowMore = (comment: string) => {
    setSelectedComment(comment);
    setShowModal(true);
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
            <div key={review._id} className={`testimonial-item`}>
              <div className="ratings-row">
                <div>{renderStars(review.rating)}</div>
                <h5 className="parking-name">{review.parkingId.nom}</h5>
              </div>
              <div className="comment-text-container">
                <p className={`comment-text ${!expandedReviews.includes(review._id) ? 'collapsed' : 'expanded'}`}>
                  {review.comment}
                  {!expandedReviews.includes(review._id) && review.comment.length > 100 && (
                    <span 
                      className="show-more-dots"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReviewExpansion(review._id);
                      }}
                    >
                      ...
                    </span>
                  )}
                  {expandedReviews.includes(review._id) && (
                    <span 
                      className="show-less-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReviewExpansion(review._id);
                      }}
                    >
                      Show less
                    </span>
                  )}
                </p>
              </div>
              <div className="user-info">
                <div className="user-details">
                  <img
                    src={review.userId?.image || "assets/img/user.jpg"}
                    alt="User"
                    className="user-image"
                    onError={(e) => (e.currentTarget.src = "assets/img/user.jpg")}
                  />
                  <h6 className="user-name">
                    {`${review.userId?.firstname || "Unknown"} ${review.userId?.lastname || ""}`}
                  </h6>
                </div>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
            </div>
          ))}
        </Slider>

        {/* Modal pour afficher le commentaire complet */}
        {showModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog comment-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Full Comment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="full-comment">{selectedComment}</p>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
          </div>
        )}

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