import React from "react";
import { useNavigate } from "react-router-dom";
import "./User.css";

const User = () => {
  const navigate = useNavigate();

  const user = {
    id: "P1",
    name: "Player 1",
    mobile: "9487756649",
    totalBookings: 3,
    lastBooking: "27/05/2024",
    totalBookingHours: "6Hrs",
    upcoming: [
      {
        date: "30/06/2024",
        time: "6:00 AM – 8:00 AM",
        status: "Upcoming",
      },
    ],
    history: [
      {
        date: "25/05/2024",
        time: "6:00 AM – 8:00 AM",
        status: "Completed",
      },
      {
        date: "27/05/2024",
        time: "6:00 AM – 8:00 AM",
        status: "Completed",
      },      {
        date: "27/05/2024",
        time: "6:00 AM – 8:00 AM",
        status: "Completed",
      },
    ],
  };

  return (
    <div className="user-container">
      <h2 className="user-header" onClick={() => navigate(-1)}>
        &larr; User Details
      </h2>

      <div className="user-grid">
        {/* Info */}
        <div className="user-card info-card">
          <div className="user-avatar">{user.id}</div>
          <div className="user-details">
            <h2>{user.name}</h2>
            <p><strong>Total Bookings :</strong> {user.totalBookings}</p>
            <p><strong>Mobile Number :</strong> {user.mobile}</p>
            <p><strong>Last Booking:</strong> {user.lastBooking}</p>
          </div>
        </div>


{/* Upcoming Bookings */}
<div className="user-card scrollable">
  <div className="card-header green-header">
    Upcoming Booking <div className="badge">{user.upcoming.length}</div>
  </div>
  <div className="booking-scroll">
    {user.upcoming.map((item, index) => (
      <div key={index} className="booking-entry">
        <div className="booking-left">
          <div className="booking-date">{item.date}</div>
          <div className="booking-time">{item.time}</div>
        </div>
        <div className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</div>
      </div>
    ))}
  </div>
</div>

        {/* Total Booking Hours */}
        <div className="user-card">
          <div className="card-header green-header">Total Booking Hours</div>
          <div className="booking-hours">
            <p>Total Booking Hours :</p>
            <strong>{user.totalBookingHours}</strong>
          </div>
        </div>

{/* Past Bookings */}
<div className="user-card scrollable">
  <div className="card-header green-header">
    Past Bookings <div className="badge">{user.history.length}</div>
  </div>
  <div className="booking-scroll">
    {user.history.map((item, index) => (
      <div key={index} className="booking-entry">
        <div className="booking-left">
          <div className="booking-date">{item.date}</div>
          <div className="booking-time">{item.time}</div>
        </div>
        <div className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</div>
      </div>
    ))}
  </div>
</div>


        </div>
      </div>
  );
};

export default User;
