import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "./Auth";
import { Link, NavLink, useParams, useNavigate } from "react-router-dom";
import { Rating } from "react-simple-star-rating";

function MunchDetail({ backgroundImage }) {
  let { id } = useParams();
  const navigate = useNavigate();
  const [munch, setMunch] = useState([]);
  const { token } = useAuthContext();

  const handleDelete = async () => {
    const munchUrl = `http://localhost:8010/munches/${id}`;
    const fetchConfig = {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(munchUrl, fetchConfig);
    if (response.ok) {
      navigate("/home");
    }
  };

  const getOneMunch = useCallback(async () => {
    const url = `http://localhost:8010/munches/${id}`;
    const fetchConfig = {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(url, fetchConfig);
    console.log("response!!", response);
    console.log("Detail Token:", token);
    if (response.ok) {
      const data = await response.json();
      setMunch(data);
    }
  }, [id, token]);

  useEffect(() => {
    getOneMunch();
  }, [getOneMunch, token, id]);

  return (
    <>
      <div
        className="p-5 bg-image"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0, 0.68), rgba(0,0,0, 0.68)), url('${backgroundImage}')`,
          backgroundColor: "#FFFAEB",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="container mt-5">
          <div className="row">
            <div className="offset-3 col-6">
              <div className="shadow p-2 m-4">
                <form className="card p-3 m-1" id="create-signup-form">
                  {/* HEADER */}

                  {/* PHOTO */}
                  <div className="form-floating mb-2">
                    <img
                      src={munch.photo}
                      alt="preview"
                      style={{ maxWidth: "100%" }}
                    />
                  </div>

                  {/* LOCATION CITY AND STATE*/}
                  <div className="form-floating">
                    <h2
                      style={{
                        color: "black",
                        size: "40px",
                      }}
                    >
                      {munch.location}
                    </h2>
                    <h5>
                      {munch.city}, {munch.state}
                    </h5>
                  </div>

                  {/* RATING */}
                  <div className="mb-4">
                    <Rating
                      rate={munch.rating}
                      size={35}
                      label
                      transition
                      fillColor="#FFE085"
                      emptyColor="gray"
                      className="foo" // Will remove the inline style if applied
                    />
                  </div>

                  {/* REVIEW */}
                  <div className="form-floating mb-3">
                    <p style={{ color: "black" }}>{munch.review}</p>
                  </div>

                  {/* BUTTONS */}
                  <div
                    className="button-container"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Link to={`/munches/edit/${id}`}>
                      <button
                        className="btn btn-md lead text-bold text mx-2"
                        style={{
                          background: "#F8D876",
                          fontWeight: "750",
                          color: "#512b20",
                          width: "150px",
                          height: "40px",
                        }}
                        type="submit"
                        value="Update Munch"
                      >
                        Edit Munch
                      </button>
                    </Link>
                    {"  "}
                    <button
                      onClick={handleDelete}
                      className="btn btn-md lead text-bold text mx-2"
                      style={{
                        background: "#FF4B3E",
                        fontWeight: "750",
                        color: "white",
                        width: "150px",
                        height: "40px",
                      }}
                      type="button"
                      value="Delete Munch"
                    >
                      Delete Munch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MunchDetail;
