import React, { useEffect, useState } from "react";
import { useRef as reactUseRef } from "react";
import { useNavigate } from "react-router-dom";
import back from "../assets/back.svg";
import "./Management.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = new Date();
today.setHours(0, 0, 0, 0);

type SlotStatus = "available" | "booked" | "disabled" | "maintenance";

type Slot = {
  time: string;
  status: SlotStatus;
  startTime?: string;
};

type APISlot = {
  slotId: number;
  slotDate: string;
  slotTime: string;
  status: "Unavailable" | "Maintenance";
};

const formatTime = (hour: number): string => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
};

const formatToApiTime = (time: string): string => {
  const [hourStr, period] = time.trim().split(" ");
  const hour = hourStr.padStart(2, "0");
  return `${hour}:00 ${period}`;
};

const getAllSlots = (): Slot[] => {
  const slots: Slot[] = [];
  for (let i = 0; i < 24; i++) {
    const from = formatTime(i);
    const to = formatTime((i + 1) % 24);
    slots.push({
      time: `${from} to ${to}`,
      status: "available",
      startTime: from.toUpperCase().trim(),
    });
  }
  return slots;
};

const Management = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>(getAllSlots());
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [popupSlotIndex, setPopupSlotIndex] = useState<number | null>(null);
  const [showMarkPopup, setShowMarkPopup] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const slotRefs = reactUseRef<(HTMLDivElement | null)[]>([]);

  const nextWeek = () =>
    setSelectedDate((prev) => new Date(prev.getTime() + 7 * 86400000));
  const prevWeek = () => {
    const newDate = new Date(selectedDate.getTime() - 7 * 86400000);
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
        const year = clickedDate.getFullYear();
        const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
        const day = String(clickedDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        const response = await fetch(
          `http://localhost:5125/api/Slots/${dateString}`
        );
        const apiSlots: APISlot[] = await response.json();

        const unavailableSet = new Set(
          apiSlots
            .filter((slot) => slot.status === "Unavailable")
            .map((slot) =>
              slot.slotTime.replace(/\s+/g, " ").trim().toUpperCase()
            )
        );

        const maintenanceSet = new Set(
          apiSlots
            .filter((slot) => slot.status === "Maintenance")
            .map((slot) =>
              slot.slotTime.replace(/\s+/g, " ").trim().toUpperCase()
            )
        );

        const updatedSlots: Slot[] = getAllSlots().map((slot) => {
          const startTimeNormalized = slot.startTime!
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
          if (unavailableSet.has(startTimeNormalized)) {
            return { ...slot, status: "disabled" };
          } else if (maintenanceSet.has(startTimeNormalized)) {
            return { ...slot, status: "maintenance" };
          } else {
            return { ...slot, status: "available" };
          }
        });

        setSlots(updatedSlots);
        setSelectedSlots([]);
        setSelectAll(false);
      } catch (error) {
        console.error("❌ Failed to fetch slot data:", error);
      }
    };

    fetchSlots();
  }, [clickedDate]);

  const formatDate = (date: Date) => `${date.getDate()}`;
  const isPastDate = (date: Date) => date < today;

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    setClickedDate(date);
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
      selectedSlots.includes(index) ? { ...slot, status: "maintenance" } : slot
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
            className={`slot-box ${slot.status} ${
              selectedSlots.includes(index) ? "selected" : ""
            }`}
            onClick={() => handleSlotClick(index)}
            ref={(el) => (slotRefs.current[index] = el)}
          >
            <div>{slot.time.split(" to ")[0]}</div>
            <div className="slot-to">to</div>
            <div>{slot.time.split(" to ")[1]}</div>
          </div>
        ))}
      </div>

      <div className="end-buttons">
        <button className="Cancel-maintanance">Cancel</button>
        <button
          className="mark-maintanance"
          onClick={() => setShowMarkPopup(true)}
        >
          Mark as Maintenance
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
                  onClick={async () => {
  if (!clickedDate || popupSlotIndex === null) return;

  const year = clickedDate.getFullYear();
  const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
  const day = String(clickedDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  const rawTime = slots[popupSlotIndex].startTime || "";
  const timeSlot = formatToApiTime(rawTime);

  try {
    const response = await fetch(
      "http://localhost:5125/api/AdminSlotManagement/delete-maintenance",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          timeSlots: [timeSlot],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete maintenance slot");
    }

    // Refresh the slots after successful deletion
    setSlots((prevSlots) =>
      prevSlots.map((slot, idx) =>
        idx === popupSlotIndex ? { ...slot, status: "available" } : slot
      )
    );
    setPopupSlotIndex(null);
  } catch (err) {
    console.error("❌ Failed to delete maintenance:", err);
    alert("Failed to remove maintenance. Try again.");
  }
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

      {showMarkPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-content-inner">
              <h2>Mark as Maintenance</h2>
              <p>
                Are you sure you want to mark{" "}
                <strong>{selectedSlots.length}</strong> slot
                {selectedSlots.length !== 1 && "s"} as maintenance?
              </p>
              <div className="modal-actions">
                <button
                  className="remove-maintanance-button"
                  onClick={async () => {
                    if (!clickedDate) return;

                    const year = clickedDate.getFullYear();
                    const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
                    const day = String(clickedDate.getDate()).padStart(2, "0");
                    const formattedDate = `${year}-${month}-${day}`;

                    const timeSlots = selectedSlots.map((index) =>
                      formatToApiTime(slots[index].startTime || "")
                    );

                    try {
                      const response = await fetch(
                        "http://localhost:5125/api/AdminSlotManagement/mark-maintenance",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            date: formattedDate,
                            timeSlots,
                          }),
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Failed to mark maintenance");
                      }

                      handleMarkAsMaintenance();
                      setShowMarkPopup(false);
                    } catch (error) {
                      console.error("❌ Error marking maintenance:", error);
                      alert("Failed to mark maintenance. Try again.");
                    }
                  }}
                >
                  Yes, Confirm
                </button>
                <button
                  className="cancel-popup-button"
                  onClick={() => setShowMarkPopup(false)}
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

export default Management;
