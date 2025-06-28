import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Dashboard.css';

type BookingItem = {
  month: string;
  bookings: number;
  color: string;
};

function Dashboard() {
  const [bookingData, setBookingData] = useState<BookingItem[]>([]);
  const [today, setToday] = useState({ bookings: 0, hours: 0 });
  const [upcoming, setUpcoming] = useState({ bookings: 0, hours: 0 });
  const [past, setPast] = useState({ bookings: 0, hours: 0 });

  const [filter, setFilter] = useState<'Month' | 'Year'>('Year');
  const [currentDate, setCurrentDate] = useState(dayjs());

  const isNextMonthDisabled = filter === "Month" && currentDate.isSame(dayjs(), 'month');
  const isNextYearDisabled = filter === "Year" && currentDate.isSame(dayjs(), 'year');

  const totalBookings = today.bookings + past.bookings + upcoming.bookings;
  const totalHours = today.hours + past.hours + upcoming.hours;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:5125/api/AdminDashboard/dashboard");
        const data = await response.json();
        setBookingData(data.bookingData); // {month, bookings, color}
        setToday({ bookings: data.today, hours: data.todayHours });
        setUpcoming({ bookings: data.upcoming, hours: data.upcomingHours });
        setPast({ bookings: data.past, hours: data.pastHours });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [filter, currentDate]);

  return (
    <div className="dashboard-wrapper">
      <button className="back">Dashboard</button>

      <div className="filter-bar">
        <div className="navigator">
          <ChevronLeft
            className="nav-icon"
            onClick={() =>
              setCurrentDate(prev =>
                filter === "Month" ? prev.subtract(1, "month") : prev.subtract(1, "year")
              )
            }
          />
          <span className="date-display">
            {filter === "Month"
              ? currentDate.format("MMM YYYY").toUpperCase()
              : currentDate.format("YYYY")}
          </span>
          <ChevronRight
            className="nav-icon"
            onClick={() => {
              if (filter === "Month" && !isNextMonthDisabled) {
                setCurrentDate(prev => prev.add(1, "month"));
              } else if (filter === "Year" && !isNextYearDisabled) {
                setCurrentDate(prev => prev.add(1, "year"));
              }
            }}
            style={{
              opacity:
                (filter === "Month" && isNextMonthDisabled) ||
                (filter === "Year" && isNextYearDisabled)
                  ? 0.3
                  : 1,
              pointerEvents:
                (filter === "Month" && isNextMonthDisabled) ||
                (filter === "Year" && isNextYearDisabled)
                  ? "none"
                  : "auto"
            }}
          />
        </div>

        <div className="dropdown-container">
          <label>Filter By</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'Month' | 'Year')}
            className="filter-select"
          >
            <option value="Month">Month</option>
            <option value="Year">Year</option>
          </select>
        </div>
      </div>

      {/* Total summary above the chart */}
      <div className="total-info">
        <strong>{totalHours} Hr</strong>
        <strong>{totalBookings} Bookings</strong>
      </div>

      <div className="dashboard-container">
        <div className="graph-content">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                formatter={(value) => [`${value} bookings`, "Bookings"]}
              />
              <Line
                type="linear"
                dataKey="bookings"
                stroke="#000"
                strokeWidth={2}
                dot={({ cx, cy, payload }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    stroke="#000"
                    strokeWidth={1}
                    fill={payload.color}
                  />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <span>Today</span>
            <span>Bookings: {today.bookings} &nbsp; Hours: {today.hours}</span>
          </div>
          <div className="summary-card">
            <span>Upcoming</span>
            <span>Bookings: {upcoming.bookings} &nbsp; Hours: {upcoming.hours}</span>
          </div>
          <div className="summary-card">
            <span>Past</span>
            <span>Bookings: {past.bookings} &nbsp; Hours: {past.hours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
