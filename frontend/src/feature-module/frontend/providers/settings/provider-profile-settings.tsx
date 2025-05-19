import React, { useState, useEffect } from "react";
import axios from "axios";
import ImageWithBasePath from "../../../../core/img/ImageWithBasePath";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';



const ProviderProfileSettings: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    image: "",
  });
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = 'assets/img/user.jpg'; // Set your default avatar path
  };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setUser(res.data);
        if (res.data.image) {
          setImagePreview(res.data.image);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("firstname", user.firstname);
    formData.append("lastname", user.lastname);
    formData.append("phone", user.phone);
    formData.append("email", user.email);

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/auth/profile`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data);
      if (res.data.image) {
        setImagePreview(res.data.image);
      }

      setAlert({ type: "success", message: "Profile updated successfully!" });

      const profileRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(profileRes.data);
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Error updating profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: response.data.message });
      }
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to change password.' });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        {alert && (
          <div className={`alert alert-${alert.type === "success" ? "success" : "danger"}`}>
            {alert.message}
            <button
              type="button"
              className="close"
              onClick={() => setAlert(null)}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <div className="card-body">
          <h6 className="user-title">Profile Picture</h6>
          <div className="pro-picture">
          <div className="pro-img avatar avatar-xl">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="user"
            className="img-fluid rounded-circle"
            onError={handleImageError}
            referrerPolicy="no-referrer" // Important for Google images
          />
        ) : (
          <ImageWithBasePath
            src="assets/img/user.jpg"
            alt="user"
            className="img-fluid rounded-circle"
          />
        )}
      </div>
            <div className="pro-info">
              <div className="d-flex mb-2">
                <label
                  htmlFor="image-upload"
                  className="btn btn-dark btn-sm d-flex align-items-center me-3"
                >
                  <i className="ti ti-cloud-upload me-1" />
                  Upload
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <button
                  className="btn btn-light btn-sm d-flex align-items-center"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
              <p className="fs-14">
                *image size should be at least 320px big, and less than 500kb. Allowed files .png and .jpg.
              </p>
            </div>
          </div>
        </div>
        <h5>Account Settings</h5>
        <div className="card">
          <div className="card-body">
            <h6 className="user-title">General Information</h6>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstname"
                  value={user.firstname}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastname"
                  value={user.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={user.email}
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileSettings;