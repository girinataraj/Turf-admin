import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import back from "../assets/back.svg";
import print from "../assets/print.svg";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type BookingItem = {
  no: number;
  date: string;
  name: string;
  phone: string;
  time: string;
  price: number;
  status: string;
};

const views: ("past" | "today" | "upcoming")[] = ["past", "today", "upcoming"];

const Booking = () => {
  const navigate = useNavigate();
  const [viewIndex, setViewIndex] = useState(1);
  const [bookingData, setBookingData] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentView = views[viewIndex];

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get<BookingItem[]>(
          `http://localhost:5125/api/AdminBooking?status=${currentView}`
        );
        setBookingData(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentView]);

  const handlePrevView = () => {
    setViewIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const handleNextView = () => {
    setViewIndex((prev) => (prev === views.length - 1 ? prev : prev + 1));
  };

  const handleExport = () => {
    const data = [
      ["No", "Date", "Name", "Phone No.", "Time", "Price in ₹", "Status"],
      ...bookingData.map((item) => [
        item.no,
        item.date,
        item.name,
        item.phone,
        item.time,
        item.price,
        item.status,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `Booking_${currentView}.xlsx`);
  };

  return (
    <div className="booking-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        <img src={back} alt="Back" />
        Booking
      </button>

      <div className="booking-content">
        <div></div>
        <div className="date">
          <img
            src={back}
            alt="Previous"
            className="back-icon"
            onClick={handlePrevView}
            style={{ opacity: viewIndex === 0 ? 0.3 : 1 }}
          />
          {currentView.toUpperCase()}
          <img
            src={back}
            alt="Next"
            className="next-icon"
            onClick={handleNextView}
            style={{ opacity: viewIndex === views.length - 1 ? 0.3 : 1 }}
          />
        </div>
        <button className="expert-button" onClick={handleExport}>
          <img src={print} alt="print" className="print-icon" />
          Export table
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Date</th>
              <th>Name</th>
              <th>Phone No.</th>
              <th>Time</th>
              <th>Price in ₹</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ color: "red" }}>{error}</td>
              </tr>
            ) : bookingData.length === 0 ? (
              <tr>
                <td colSpan={7}>No bookings found.</td>
              </tr>
            ) : (
              bookingData.map((item) => (
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.date}</td>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.time}</td>
                  <td>{item.price}</td>
                  <td className="status">{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .booking-wrapper {
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow: hidden;
        }

        .back-button {
          background: transparent;
          border: none;
          font-weight: 700;
          font-size: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
        }

        .back-button:hover {
          color: rgb(118, 123, 123);
          cursor: pointer;
        }

        .back-button img {
          width: 30px;
          height: 30px;
        }

        .date {
          font-weight: 700;
          font-size: 40px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-icon,
        .next-icon {
          width: 30px;
          height: 30px;
          cursor: pointer;
        }

        .next-icon {
          transform: rotate(180deg);
        }

        .booking-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 10px;
        }

        .expert-button {
          width: 180px;
          height: 40px;
          background: black;
          color: white;
          border-radius: 5px;
          font-size: 20px;
          font-weight: 700;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .print-icon {
          width: 30px;
          height: 30px;
        }

        .table-container {
          flex-grow: 1;
          overflow-y: auto;
          margin-top: 20px;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
          min-width: 800px;
        }

        th, td {
          padding: 12px;
          text-align: center;
        }

        th {
          background-color: #006400;
          color: white;
          border: 3px solid white;
        }

        td {
          background-color: #D6D6D6;
          border-right: 3px solid black;
        }

        td:last-child {
          border-right: none;
        }

        tr {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        td.status {
          font-weight: bold;
        }

        .table-container::-webkit-scrollbar {
          width: 8px;
        }

        .table-container::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .back-button {
            font-size: 28px;
          }

          .back-button img {
            width: 24px;
            height: 24px;
          }

          .expert-button {
            width: 160px;
            font-size: 18px;
          }

          .date {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .back-button {
            font-size: 22px;
          }

          .back-button img {
            width: 20px;
            height: 20px;
          }

          .expert-button {
            width: 100%;
            justify-content: center;
            font-size: 16px;
          }

          .date {
            font-size: 22px;
          }

          table {
            font-size: 12px;
            min-width: 600px;
          }

          .table-container {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Booking;
