import { useEffect, useState } from "react";
import { useRef as reactUseRef } from "react";
import { useNavigate } from "react-router-dom";
import back from "../assets/back.svg";
import "./Management.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Secondpage = ({
  onScrollToThirdPage,
}: {
  onScrollToThirdPage: (date: Date) => void;
}) => {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(today);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [popupSlotIndex, setPopupSlotIndex] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const slotRefs = reactUseRef<(HTMLDivElement | null)[]>([]);

  const nextWeek = () =>
    setSelectedDate(
      (prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000)
    );

  const prevWeek = () => {
    const newDate = new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (newDate >= today) setSelectedDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= today) setSelectedDate(newDate);
  };

  const getWeekDates = () => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  useEffect(() => {
    setClickedDate(today);
  }, []);

  useEffect(() => {
    if (!clickedDate) return;

    const fetchSlots = async () => {
      try {
        const dateString = clickedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        const response = await fetch(`http://localhost:5125/api/Slots/${dateString}`);
        const data: APISlot[] = await response.json();

        const updatedSlots: Slot[] = defaultSlots.map((slot) => ({
          ...slot,
          status: "available",
        }));

        data.forEach((apiSlot) => {
          const index = updatedSlots.findIndex((s) =>
            s.time.startsWith(apiSlot.slotTime)
          );
          if (index !== -1) {
            updatedSlots[index].status =
              apiSlot.status === "Unavailable" ? "disabled" : "maintenance";
          }
        });

        setSlots(updatedSlots);
        setSelectedSlots([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Failed to fetch slot data:", error);
      }
    };

    fetchSlots();
  }, [clickedDate]);

  const formatDate = (date: Date) => `${date.getDate()}`;
  const isPastDate = (date: Date) => date < today;

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    setClickedDate(date);
    onScrollToThirdPage(date);
  };

  const handleSlotClick = (index: number) => {
    const slot = slots[index];
    if (slot.status === "maintenance") {
      setPopupSlotIndex(index);
      return;
    }
    if (slot.status === "disabled" || slot.status === "booked") return;

    setSelectedSlots((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      const allAvailable = slots
        .map((slot, index) => (slot.status === "available" ? index : -1))
        .filter((i) => i !== -1);
      setSelectedSlots(allAvailable);
    } else {
      setSelectedSlots([]);
    }
  };

  const handleMarkAsMaintenance = () => {
    const updatedSlots = slots.map((slot, index) =>
      selectedSlots.includes(index)
        ? { ...slot, status: "maintenance" as SlotStatus }
        : slot
    );
    setSlots(updatedSlots);
    setSelectedSlots([]);
    setSelectAll(false);
  };

  const weekDates = getWeekDates();

  return (
    <div className="main-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <img src={back} alt="Back" />
        Management
      </button>

      {/* Month Navigation */}
      <div className="calendar-nav">
        <button className="left-calendar" onClick={prevMonth}>
          &#x276E;
        </button>
        <span>
          {selectedDate.toLocaleString("default", { month: "long" })}{" "}
          {selectedDate.getFullYear()}
        </span>
        <button className="right-calendar" onClick={nextMonth}>
          &#x276F;
        </button>
      </div>

      {/* Week Navigation + Dates */}
      <div className="calendar-nav weekdays-inside-nav">
        <button className="left-calendar" onClick={prevWeek}>
          &#x276E;
        </button>

        <div className="weekdays">
          {weekDates.map((date, index) => {
            const isPast = isPastDate(date);
            const isSelected =
              clickedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                className={`day ${isSelected ? "selected" : ""} ${
                  isPast ? "disabled" : ""
                }`}
                onClick={() => handleDateClick(date)}
              >
                <span>{formatDate(date)}</span>
                <span>
                  {weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                </span>
              </div>
            );
          })}
        </div>

        <button className="right-calendar" onClick={nextWeek}>
          &#x276F;
        </button>
      </div>

      <h1 className="slot-title">Time Slots</h1>
      <section className="select-container">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
        <h3>Select all</h3>
      </section>

      <div className="slot-grid">
        {slots.map((slot, index) => (
          <div
            key={index}
            ref={(el) => {
              slotRefs.current[index] = el;
            }}
            onClick={() => handleSlotClick(index)}
            className={`slot-box ${slot.status} ${
              selectedSlots.includes(index) ? "selected" : ""
            }`}
          >
            <>
              <div>{slot.time.split(" to ")[0]}</div>
              <div className="slot-to">to</div>
              <div>{slot.time.split(" to ")[1]}</div>
            </>
          </div>
        ))}
      </div>

      <div className="end-buttons">
        <button className="Cancel-maintanance">Cancel</button>
        <button
          className="mark-maintanance"
          onClick={handleMarkAsMaintenance}
        >
          Mark as Maintanance
        </button>
      </div>

      {popupSlotIndex !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-content-inner">
              <h2>Remove Maintenance</h2>
              <p>
                Do you want to remove maintenance for slot:{" "}
                <strong>{slots[popupSlotIndex].time}</strong>?
              </p>
              <div className="modal-actions">
                <button
                  className="remove-maintanance-button"
                  onClick={() => {
                    setSlots((prevSlots) =>
                      prevSlots.map((slot, idx) =>
                        idx === popupSlotIndex
                          ? { ...slot, status: "available" }
                          : slot
                      )
                    );
                    setPopupSlotIndex(null);
                  }}
                >
                  Yes, Remove
                </button>
                <button
                  className="cancel-popup-button"
                  onClick={() => setPopupSlotIndex(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Secondpage;

// --- Types ---
type SlotStatus = "available" | "booked" | "disabled" | "maintenance";

type Slot = {
  time: string;
  status: SlotStatus;
};

type APISlot = {
  slotId: number;
  slotDate: string;
  slotTime: string;
  status: "Unavailable" | "Maintenance";
};

const defaultSlots: Slot[] = [
  { time: "6 AM to 7 AM", status: "disabled" },
  { time: "7 AM to 8 AM", status: "available" },
  { time: "8 AM to 9 AM", status: "available" },
  { time: "9 AM to 10 AM", status: "available" },
  { time: "10 AM to 11 AM", status: "available" },
  { time: "11 AM to 12 PM", status: "available" },
  { time: "12 PM to 1 PM", status: "available" },
  { time: "1 PM to 2 PM", status: "available" },
  { time: "2 PM to 3 PM", status: "available" },
  { time: "3 PM to 4 PM", status: "available" },
  { time: "4 PM to 5 PM", status: "available" },
  { time: "5 PM to 6 PM", status: "available" },
  { time: "6 PM to 7 PM", status: "available" },
  { time: "7 PM to 8 PM", status: "available" },
  { time: "8 PM to 9 PM", status: "available" },
  { time: "9 PM to 10 PM", status: "available" },
  { time: "10 PM to 11 PM", status: "available" },
  { time: "11 PM to 12 AM", status: "available" },
];
