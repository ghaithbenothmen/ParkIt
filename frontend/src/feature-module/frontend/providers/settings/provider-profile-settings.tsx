import React, { useState, useEffect } from "react";
import axios from "axios";
import ImageWithBasePath from "../../../../core/img/ImageWithBasePath";

const ProviderProfileSettings: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  useEffect(() => {

    axios
      .get("http://localhost:4000/api/auth/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstname", user.firstname);
    formData.append("lastname", user.lastname);
    formData.append("phone", user.phone);
    formData.append("email", user.email);

    try {
      const res = await axios.put("http://localhost:4000/api/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });


      console.log('Updated Profile:', res.data);


      setUser(res.data);

      axios
        .get("http://localhost:4000/api/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error refetching profile:", err));

      alert("Profile updated successfully!");

    } catch (error) {
      console.error(error);
      alert("Error updating profile.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate preview URL
    }
  };
  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="card-body">
          <h6 className="user-title">Profile Picture</h6>
          <div className="pro-picture">
            <div className="pro-img avatar avatar-xl">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="user"
                  className="img-fluid rounded-circle"
                />
              ) : (
                <ImageWithBasePath
                  src="assets/img/user/user-02.jpg"
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

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileSettings;
