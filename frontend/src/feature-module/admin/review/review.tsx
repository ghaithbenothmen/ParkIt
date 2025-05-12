import React, { useEffect, useState, useRef } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Modal } from 'bootstrap';

interface Review {
  _id: string;
  parkingId: { nom: string } | null;
  userId: { firstname: string; lastname: string } | null;
  rating: number;
  comment: string;
  createdAt: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const [errors, setErrors] = useState<any>({});
  const [reviewId, setReviewId] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const deleteModalRef = useRef<any>(null);
  const editModalRef = useRef<any>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/reviews');
        console.log('Full API Response:', JSON.stringify(response.data, null, 2));
        const formattedReviews = response.data.map((review: any) => ({
          ...review,
          parkingId: review.parkingId || { nom: 'Unknown' },
          userId: review.userId || { firstname: 'Unknown', lastname: '' },
          rating: typeof review.rating === 'number' && review.rating >= 1 && review.rating <= 5 ? review.rating : 0,
        }));
        console.log('Formatted Reviews:', formattedReviews);
        setReviews(formattedReviews);
        setFilteredReviews(formattedReviews);
      } catch (error) {
        showToast('error', 'Error', 'Failed to load reviews');
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
    deleteModalRef.current = new Modal(document.getElementById('delete-review-modal')!);
    editModalRef.current = new Modal(document.getElementById('edit-review')!);
  }, []);

  useEffect(() => {
    const editModal = document.getElementById('edit-review');
    const handleShow = (event: any) => {
      const review = JSON.parse(event.relatedTarget.getAttribute('data-review'));
      setFormData({
        rating: review.rating || 5,
        comment: review.comment || '',
      });
      setReviewId(review._id);
      setErrors({});
    };

    editModal?.addEventListener('show.bs.modal', handleShow);
    return () => {
      editModal?.removeEventListener('show.bs.modal', handleShow);
    };
  }, []);

  const showToast = (severity: string, summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const applyFilters = (query: string, rating: number | null) => {
    let filtered = [...reviews];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((review) =>
        review.parkingId?.nom?.toLowerCase().includes(lowerQuery) ||
        `${review.userId?.firstname || ''} ${review.userId?.lastname || ''}`.toLowerCase().includes(lowerQuery) ||
        review.comment?.toLowerCase().includes(lowerQuery)
      );
    }

    if (rating !== null) {
      filtered = filtered.filter((review) => review.rating === rating);
    }

    setFilteredReviews(filtered);
  };

  const filterBySearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, ratingFilter);
  };

  const filterByRating = (rating: number) => {
    const newRatingFilter = rating === ratingFilter ? null : rating;
    setRatingFilter(newRatingFilter);
    applyFilters(searchQuery, newRatingFilter);
  };

  const confirmDeleteReview = (review: Review) => {
    setReviewToDelete(review);
    deleteModalRef.current?.show();
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await axios.delete(`http://localhost:4000/api/reviews/${reviewToDelete._id}`);
      const updatedReviews = reviews.filter((review) => review._id !== reviewToDelete._id);
      setReviews(updatedReviews);
      setFilteredReviews(updatedReviews);
      deleteModalRef.current?.hide();
      showToast('success', 'Success', 'Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('error', 'Error', (error as any).response?.data?.message || 'Failed to delete review');
    } finally {
      setReviewToDelete(null);
    }
  };

  const validateForm = (data: any) => {
    const errors: any = {};
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    if (!data.comment || data.comment.trim().length < 5 || data.comment.trim().length > 500) {
      errors.comment = 'Comment must be between 5 and 500 characters';
    }
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'rating' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        await axios.put(`http://localhost:4000/api/reviews/${reviewId}`, formData);
        showToast('success', 'Success', 'Review updated successfully');
        const response = await axios.get('http://localhost:4000/api/reviews');
        const formattedReviews = response.data.map((review: any) => ({
          ...review,
          parkingId: review.parkingId || { nom: 'Unknown' },
          userId: review.userId || { firstname: 'Unknown', lastname: '' },
          rating: typeof review.rating === 'number' && review.rating >= 1 && review.rating <= 5 ? review.rating : 0,
        }));
        setReviews(formattedReviews);
        setFilteredReviews(formattedReviews);
        editModalRef.current?.hide();
        resetForm();
      } catch (error) {
        showToast('error', 'Error', (error as any).response?.data?.message || 'Failed to update review');
        console.error('Error updating review:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ rating: 5, comment: '' });
    setErrors({});
    setReviewId(null);
  };

  const actionButton = (review: Review) => {
    return (
      <div className="table-actions d-flex">
        <Link
          className="delete-table me-2"
          to="#"
          data-bs-toggle="modal"
          data-bs-target="#edit-review"
          data-review={JSON.stringify(review)}
        >
          <Icon.Edit className="react-feather-custom" />
        </Link>
        <Link
          className="delete-table"
          to="#"
          onClick={(e) => {
            e.preventDefault();
            confirmDeleteReview(review);
          }}
        >
          <Icon.Trash2 className="react-feather-custom" />
        </Link>
      </div>
    );
  };

  const formatDate = (rowData: Review) => {
    return new Date(rowData.createdAt).toLocaleDateString();
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="page-wrapper page-settings" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="content" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
          <div className="content-page-header content-page-headersplit">
            <h5>Reviews</h5>
            <div className="list-btn">
              <ul className="d-flex flex-wrap gap-2">
                <li>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Icon.Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by parking, user, or comment..."
                      value={searchQuery}
                      onChange={(e) => filterBySearch(e.target.value)}
                    />
                  </div>
                </li>
                <li>
                  <div className="btn-group" role="group">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        className={`btn ${ratingFilter === rating ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => filterByRating(rating)}
                      >
                        {rating} Star{rating > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="table-responsive">
                <DataTable
                  value={filteredReviews}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  loading={loading}
                  emptyMessage="No reviews found"
                  className="mt-3"
                >
                  <Column sortable field="parkingId.nom" header="Parking" />
                  <Column
                    sortable
                    field="userId"
                    header="User"
                    body={(rowData) =>
                      `${rowData.userId?.firstname || 'Unknown'} ${rowData.userId?.lastname || ''}`
                    }
                  />
                  <Column sortable field="rating" header="Rating" />
                  <Column sortable field="comment" header="Comment" />
                  <Column sortable field="createdAt" header="Created At" body={formatDate} />
                  <Column header="Actions" body={actionButton} />
                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="delete-review-modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4">
              <p>
                Are you sure you want to delete the review for{' '}
                <strong>{reviewToDelete?.parkingId?.nom || 'Unknown'}</strong> by{' '}
                <strong>
                  {reviewToDelete?.userId?.firstname || 'Unknown'}{' '}
                  {reviewToDelete?.userId?.lastname || ''}
                </strong>?
              </p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={deleteReview}>
                Delete Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="edit-review" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Review</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="rating" className="form-label">
                    Rating (1 to 5)
                  </label>
                  <select
                    className={`form-select ${errors.rating ? 'is-invalid' : ''}`}
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                  {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="comment" className="form-label">
                    Comment
                  </label>
                  <textarea
                    className={`form-control ${errors.comment ? 'is-invalid' : ''}`}
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows={4}
                  ></textarea>
                  {errors.comment && <div className="invalid-feedback">{errors.comment}</div>}
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reviews;