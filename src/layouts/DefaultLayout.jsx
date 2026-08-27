import AppContent from "../components/AppContent";
import AppFooter from "../components/footer/AppFooter";
import AppHeader from "../components/header/AppHeader";

const DefaultLayout = () => {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-paper font-sans text-ink">
      <div className="flex min-w-0 flex-col">
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
