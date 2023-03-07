import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "./Auth";

function MunchesColumn(props) {
  return (
    <div className="col">
      {props.list.map((munch) => (
        <div key={munch.id}>
          <Link to={`/munches/${munch.id}`} className="card-link">
            <div className="card mb-3 shadow" style={{ height: "415px" }}>
              <img
                src={munch.photo}
                className="card-img-top"
                alt={`${munch.location}`}
                style={{ maxWidth: "100%", maxHeight: "250px" }}
              />
              <div
                className="card-body"
                style={{
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <h5 className="card-location">{munch.location}</h5>
                <p className="card-review">{munch.review}</p>
              </div>
              <div
                className="card-footer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: "40px",
                }}
              >
                <div className="location-info">
                  <small className="text-muted">
                    {munch.city}, {munch.state}
                  </small>
                </div>
                <div className="rating-info">
                  <small className="text-muted">
                    Rating: {munch.rating}
                    <img
                      src="/star.png"
                      alt="star"
                      style={{
                        width: "0.9em",
                        height: "0.9em",
                        marginTop: "-0.25em",
                      }}
                    ></img>
                  </small>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
      ;
    </div>
  );
}
const UserPage = ({ backgroundImage }) => {
  const { userName } = useParams();
  const [munchColumns, setMunchColumns] = useState([[], [], []]);
  const { token } = useAuthContext();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const getUserId = async () => {
      const userUrl = `http://localhost:8010/accounts`;
      const fetchConfig = {
        method: "get",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(userUrl, fetchConfig);
      if (response.ok) {
        const users = await response.json();
        const current_user = users.filter((user) => user.username === userName);
        const current_user_id = current_user[0].id;
        setUserId(current_user_id);
        fetchFilterMunches(current_user[0].id);
      }
    };

    const fetchFilterMunches = async (userId) => {
      try {
        const url = `http://localhost:8010/munches`;
        const fetchConfig = {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await fetch(url, fetchConfig);

        if (response.ok) {
          const munches = await response.json();
          const filteredMunches = munches.filter((munch) =>
            munch.user_id.includes(userId)
          );
          const munchColumns = [[], [], []];
          filteredMunches.forEach((munch, index) =>
            munchColumns[index % 3].push(munch)
          );
          setMunchColumns(munchColumns);
        }
      } catch (e) {
        console.error(e);
      }
    };
    getUserId();
  }, [token, userId, userName]);

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
        <Link to="/feed">
          <div className="px-4 py-5 mt-0 text-center bg-transparent">
            <img src="/munch_bunch.png" alt="Munch Bunch" width="450" />
          </div>
        </Link>
        <div className="container text-center">
          <div className="row">
            <div className="offset-3 col-6">
              <div className="col d-flex justify-content-center">
                <div
                  className="card"
                  style={{ height: "65px", width: "280px", display: "flex" }}
                >
                  <div
                    className="card-body"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div className="label-value">
                      <h5
                        className="card-title mx-3"
                        style={{
                          fontSize: "24px",
                        }}
                      >
                        User:
                      </h5>
                      <h5 className="card-text">{userName}</h5>
                    </div>
                    <p className="add-friend mx-4">
                      <img
                        src="/add-friend.png"
                        alt="Friend Photo"
                        style={{
                          maxWidth: "100%",
                          width: "35px",
                          alignItems: "end",
                        }}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-5">
          <div className="row">
            {munchColumns.map((munchList, index) => (
              <MunchesColumn key={index} list={munchList} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPage;
