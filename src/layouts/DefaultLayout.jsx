import AppContent from "../components/AppContent";
import AppFooter from "../components/footer/AppFooter";
import AppHeader from "../components/header/AppHeader";

const DefaultLayout = () => {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex-grow">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DefaultLayout;
