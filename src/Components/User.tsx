import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./User.css";

type Booking = {
  date: string;
  timeFrom: string;
  timeTo: string;
  status?: string;
};

type UserData = {
  name: string;
  phoneNumber: string;
  totalBookings: number;
  lastBooking: string;
  totalHours: string;
  upcomingBookings: Booking[];
  pastBookings: Booking[];
};

const User = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phone || location.state?.phoneNumber;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!phoneNumber) {
      setError("Phone number not provided.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5125/api/AdminSingleUserDetails/user-details/${phoneNumber}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user data.");
        setLoading(false);
      });
  }, [phoneNumber]);

  const formatDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  const formatTimeRange = (timeFrom?: string, timeTo?: string): string => {
    if (!timeFrom || !timeTo) return "Not Scheduled";

    const parseTime = (t: string) => {
      const formatted = t.includes(":") ? t : `${t.replace(/\s+/g, "")}:00`;
      const date = new Date(`1970-01-01T${formatted}`);

      if (isNaN(date.getTime())) return t;
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    return `${parseTime(timeFrom)} – ${parseTime(timeTo)}`;
  };

  if (loading) return <div className="user-container">Loading user details...</div>;
  if (error) return <div className="user-container">{error}</div>;
  if (!user) return <div className="user-container">No user data available.</div>;

  return (
    <div className="user-container">
      <h2 className="user-header" onClick={() => navigate(-1)}>
        &larr; User Details
      </h2>

      <div className="parent">
        {/* div1 */}
        <div className="user-card div1">
          <div className="user-info-header">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <h2 className="user-name">{user.name}</h2>
          </div>
          <div className="user-info-details">
            <div className="info-row">
              <span className="label">Total Bookings :</span>
              <span className="value">{user.totalBookings}</span>
            </div>
            <div className="info-row">
              <span className="label">Mobile Number :</span>
              <span className="value">{user.phoneNumber}</span>
            </div>
            <div className="info-row">
              <span className="label">Last Booking:</span>
              <span className="value">{formatDate(user.lastBooking)}</span>
            </div>
          </div>
        </div>

        {/* div2 */}
        <div className="user-card div2">
          <div className="card-header green-header">Total Booking Hours</div>
          <div className="booking-hours">
            <p>Total Booking Hours :</p>
            <strong>{user.totalHours}</strong>
          </div>
        </div>

        {/* div3 - Upcoming Bookings */}
        <div className="user-card scrollable div3">
          <div className="card-header green-header">
            Upcoming Booking <div className="badge">{user.upcomingBookings.length}</div>
          </div>
          <div className="booking-scroll">
            {user.upcomingBookings.length > 0 ? (
              user.upcomingBookings.map((item) => (
                <div
                  key={`${item.date}-${item.timeFrom}-${item.timeTo}`}
                  className="booking-entry"
                >
                  <div className="booking-left">
                    <div className="booking-date">{formatDate(item.date)}</div>
                    <div className="booking-time">{formatTimeRange(item.timeFrom, item.timeTo)}</div>
                  </div>
                  <div className={`status-tag ${item.status?.toLowerCase() || "unknown"}`}>
                    {item.status || "Booked"}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "12px" }}>No upcoming bookings</p>
            )}
          </div>
        </div>

        {/* div4 - Past Bookings */}
        <div className="user-card scrollable div4">
          <div className="card-header green-header">
            Past Bookings <div className="badge">{user.pastBookings.length}</div>
          </div>
          <div className="booking-scroll">
            {user.pastBookings.length > 0 ? (
              user.pastBookings.map((item) => (
                <div
                  key={`${item.date}-${item.timeFrom}-${item.timeTo}`}
                  className="booking-entry"
                >
                  <div className="booking-left">
                    <div className="booking-date">{formatDate(item.date)}</div>
                    <div className="booking-time">{formatTimeRange(item.timeFrom, item.timeTo)}</div>
                  </div>
                  <div className={`status-tag ${item.status?.toLowerCase() || "unknown"}`}>
                    {item.status || "Completed"}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "12px" }}>No past bookings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
