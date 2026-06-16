import { Suspense, lazy, useState, useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const RoomsPage = lazy(() =>
  import("./pages/RoomsPage").then((m) => ({ default: m.RoomsPage })),
);
const RoomDetailPage = lazy(() =>
  import("./pages/RoomDetailPage").then((m) => ({ default: m.RoomDetailPage })),
);
const BookingPage = lazy(() =>
  import("./pages/BookingPage").then((m) => ({ default: m.BookingPage })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);

function parseRoute() {
  const { pathname, search } = window.location;
  return { path: pathname || "/", search };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const handleNavigation = (e) => {
      const link = e.target.closest?.("a");
      if (!link?.href?.startsWith(window.location.origin)) return;
      e.preventDefault();
      const url = new URL(link.href);
      window.history.pushState({}, "", url.pathname + url.search);
      setRoute({ path: url.pathname, search: url.search });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onPopState = () => setRoute(parseRoute());

    document.addEventListener("click", handleNavigation);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", handleNavigation);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const { path, search } = route;

  const renderPage = () => {
    switch (path) {
      case "/":
        return (
          <MainLayout>
            <LandingPage search={search} />
          </MainLayout>
        );
      case "/rooms":
        return (
          <MainLayout>
            <RoomsPage />
          </MainLayout>
        );
      case "/room-detail":
        return (
          <MainLayout>
            <RoomDetailPage search={search} />
          </MainLayout>
        );
      case "/booking":
        return (
          <MainLayout>
            <BookingPage search={search} />
          </MainLayout>
        );
      case "/login":
        return (
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        );
      case "/register":
        return (
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        );
      case "/dashboard":
        return (
          <ProtectedRoute requireAdmin>
            <DashboardPage search={search} />
          </ProtectedRoute>
        );
      default:
        return (
          <MainLayout>
            <LandingPage search={search} />
          </MainLayout>
        );
    }
  };

  return <Suspense fallback={<LoadingSpinner />}>{renderPage()}</Suspense>;
}
