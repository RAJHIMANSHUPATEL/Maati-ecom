import React, { useRef, useState, useMemo, createRef, useEffect } from "react";
import {
  SfButton,
  SfIconMenu,
  useDropdown,
  useTrapFocus,
  useDisclosure,
  SfIconShoppingCart,
} from "@storefront-ui/react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { selectStore } from "../../redux/storeSlice";
import useApi from "../../hooks/useApi";
import { menuAPI } from "../../api";
import DesktopMenu from "./DesktopMenu";
import MobileDrawer from "./MobileDrawer";
import StoreSelector from "./StoreSelector";
import SearchBar from "./SearchBar";
import ActionItems from "./ActionItems";
import { transformMenuData, findNode } from "./helpers";
import { useAuth } from "../../context/AuthContext";
import Wordmark from "../Wordmark";
import { BRAND } from "../../brand";

const actionItems = [
  {
    icon: <SfIconShoppingCart />,
    label: "",
    ariaLabel: "Cart",
    role: "button",
    link: "/cart",
  },
];

const AppHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedStore, stores } = useSelector((state) => state.store);
  const { user, logout } = useAuth();

  const drawerRef = useRef(null);
  const megaMenuRef = useRef(null);

  const [activeNode, setActiveNode] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [menuContent, setMenuContent] = useState(null);

  const { callApi, error } = useApi();

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    const storeObj = stores.find((s) => s._id === storeId);
    if (storeObj) {
      dispatch(selectStore(storeObj));
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (!selectedStore?._id) return;
        const res = await callApi(
          menuAPI.getMenu({ store: selectedStore._id })
        );
        if (res?.data) {
          setMenuContent(transformMenuData(res.data));
        }
      } catch (err) {
        console.error("ERROR FROM API HOOK ", error);
        console.error("ERROR in component", err);
      }
    };
    fetchMenu();
  }, [selectedStore?._id]);

  const refsByKey = useMemo(() => {
    const buttonRefs = {};
    menuContent?.children?.forEach((item) => {
      buttonRefs[item.key] = createRef();
    });
    return buttonRefs;
  }, [menuContent]);

  const {
    close: closeMobileDrawerOriginal,
    open: openMobileDrawer,
    isOpen: isMobileDrawerOpen,
  } = useDisclosure();

  const {
    close: closeDropdown,
    open: openDropdown,
    isOpen: isDropdownOpen,
  } = useDisclosure();

  const { refs, style } = useDropdown({
    isDropdownOpen,
    placement: "bottom-start",
    middleware: [],
    onCloseDeps: [activeNode],
  });

  const trapFocusOptions = {
    activeState: isDropdownOpen,
    arrowKeysUpDown: true,
    initialFocus: "container",
  };
  useTrapFocus(megaMenuRef, {
    ...trapFocusOptions,
    activeState: isDropdownOpen,
  });
  useTrapFocus(drawerRef, {
    ...trapFocusOptions,
    activeState: isMobileDrawerOpen,
  });

  const activeMenu = menuContent ? findNode(activeNode, menuContent) : null;
  const bannerNode = menuContent
    ? findNode(activeNode.slice(0, 1), menuContent)
    : null;

  const closeMobileDrawer = () => {
    setActiveNode([]);
    closeMobileDrawerOriginal();
  };

  const handleOpenMenu = (menuType) => () => {
    setActiveNode(menuType);
    openDropdown();
  };
  const handleBack = () => setActiveNode((menu) => menu.slice(0, -1));
  const handleNext = (key) => () => setActiveNode((menu) => [...menu, key]);

  const search = (e) => {
    e.preventDefault();
    const q = (inputValue || "").trim();
    if (!q) {
      navigate("/products");
      return;
    }
    navigate(`/products?q=${encodeURIComponent(q)}`);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="w-full">
      <header className="relative overflow-visible border-b border-rule bg-paper" ref={refs.setReference}>
        <p className="hidden border-b border-rule px-4 py-1.5 text-center text-[11px] uppercase tracking-[0.22em] text-ink/60 md:block">
          {today} · {BRAND.cities} · pay when it arrives
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-4 md:grid-cols-[auto_minmax(220px,1fr)_auto] md:px-8 md:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <SfButton
              onClick={openMobileDrawer}
              variant="tertiary"
              square
              aria-label="Open menu"
              className="!text-ink md:hidden"
            >
              <SfIconMenu />
            </SfButton>
            <div className="leading-none">
              <Wordmark className="text-[2rem] md:text-[2.35rem]" />
              <p className="mt-0.5 hidden text-[11px] uppercase tracking-[0.18em] text-ink/50 md:block">
                {BRAND.tagline}
              </p>
            </div>
            <div className="ml-2 hidden min-w-[9rem] md:block">
              <StoreSelector
                stores={stores}
                selectedStore={selectedStore}
                onChange={handleStoreChange}
                className="min-w-[160px] border-0 border-b border-rule bg-transparent px-0 py-1 text-sm text-ink"
              />
            </div>
          </div>

          <SearchBar
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={search}
            className="col-span-2 flex w-full md:col-span-1 md:col-start-2 md:row-start-1"
          />

          <div className="col-start-2 row-start-1 md:col-start-3">
            <ActionItems actionItems={actionItems} user={user} logout={logout} />
          </div>
        </div>

        {menuContent && (
          <DesktopMenu
            menuContent={menuContent}
            activeNode={activeNode}
            activeMenu={activeMenu}
            bannerNode={bannerNode}
            refsByKey={refsByKey}
            handleOpenMenu={handleOpenMenu}
            closeDropdown={closeDropdown}
            isDropdownOpen={isDropdownOpen}
            megaMenuRef={megaMenuRef}
            style={style}
            refs={refs.setFloating}
          />
        )}

        {isMobileDrawerOpen && (
          <MobileDrawer
            drawerRef={drawerRef}
            isMobileDrawerOpen={isMobileDrawerOpen}
            closeMobileDrawer={closeMobileDrawer}
            stores={stores}
            selectedStore={selectedStore}
            handleStoreChange={handleStoreChange}
            activeMenu={activeMenu}
            handleBack={handleBack}
            handleNext={handleNext}
            bannerNode={bannerNode}
          />
        )}
      </header>
    </div>
  );
};

export default React.memo(AppHeader);
