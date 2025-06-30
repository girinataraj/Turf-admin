import { useRef, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hedder from "./Components/Hedder";
import Login from "./Login/Login";
import Layout from "./layout";
import Dashboard from "./Components/Dashboard";
import Booking from "./Components/Booking";
import Management from "./Components/Management";
import UserDetail from "./Components/UserDetail";
import User from "./Components/User";
import LoadingPage from "./Components/LoadingPage";

function App() {
  const secondPageRef = useRef<HTMLDivElement>(null);
  const thirdPageRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shouldScrollToThirdPage, setShouldScrollToThirdPage] = useState(false);
  const userTriggeredScroll = useRef(false);

  const [loading, setLoading] = useState(true); // ✅ Loading state

  // ✅ Show loading screen for 2 seconds (simulate load)
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSecondPage = () => {
    secondPageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToThirdPage = (date: Date) => {
    setSelectedDate(date);
    userTriggeredScroll.current = true;
    setShouldScrollToThirdPage(true);
  };

  useEffect(() => {
    if (shouldScrollToThirdPage && userTriggeredScroll.current) {
      const timer = setTimeout(() => {
        thirdPageRef.current?.scrollIntoView({ behavior: "smooth" });
        setShouldScrollToThirdPage(false);
        userTriggeredScroll.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDate, shouldScrollToThirdPage]);

  if (loading) return <LoadingPage />; // ✅ Show loader initially

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <>
              <Hedder />
            </>
          }
        />
        {/* ADMIN LAYOUT */}
        <Route path="/" element={<Layout />}>
          <Route index path="/" element={<Dashboard />} />
          <Route path="/admin/booking" element={<Booking />} />
          <Route path="/admin/userdetail" element={<UserDetail />} />
          <Route path="/admin/management" element={<Management onScrollToThirdPage={scrollToThirdPage} />} />
          <Route path="/admin/userdetail/user" element={<User />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
