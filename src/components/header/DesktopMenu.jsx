import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { SfButton, SfIconChevronRight } from "@storefront-ui/react";

const PANEL_WIDTH = 288;

const DesktopMenu = ({
  menuContent,
  activeNode,
  activeMenu,
  bannerNode,
  refsByKey,
  handleOpenMenu,
  closeDropdown,
  isDropdownOpen,
  megaMenuRef,
}) => {
  const navRef = useRef(null);
  const [panelLeft, setPanelLeft] = useState(16);

  useEffect(() => {
    if (!isDropdownOpen || !activeNode[0]) return;
    const nav = navRef.current;
    const btn = refsByKey[activeNode[0]]?.current;
    if (!nav || !btn) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const maxLeft = Math.max(16, navRect.width - PANEL_WIDTH - 16);
    const next = Math.min(Math.max(16, btnRect.left - navRect.left), maxLeft);
    setPanelLeft(next);
  }, [isDropdownOpen, activeNode, refsByKey]);

  return (
    <nav
      ref={navRef}
      className="relative hidden min-w-0 border-b border-rule md:block"
      onMouseLeave={closeDropdown}
    >
      <ul
        className="flex min-w-0 gap-0 overflow-x-auto overscroll-x-contain px-4 py-1 md:px-8 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-rule"
        onScroll={closeDropdown}
      >
        {menuContent.children?.map((menuNode) => (
          <li key={menuNode.key} className="shrink-0">
            <SfButton
              variant="tertiary"
              onClick={handleOpenMenu([menuNode.key])}
              onMouseEnter={handleOpenMenu([menuNode.key])}
              ref={refsByKey[menuNode.key]}
              className="group !px-3 !text-ink hover:!bg-transparent active:!bg-transparent"
            >
              <span className="whitespace-nowrap font-sans text-sm">
                {menuNode.value.label}
              </span>
              <SfIconChevronRight className="rotate-90 text-ink/40 group-hover:text-ink" />
            </SfButton>
          </li>
        ))}
      </ul>

      {isDropdownOpen && activeMenu && (
        <div
          key={activeMenu.key}
          ref={megaMenuRef}
          tabIndex={0}
          className="absolute top-full z-40 hidden w-[min(18rem,calc(100vw-2rem))] border border-t-0 border-rule bg-paper p-4 outline-none md:block"
          style={{ left: panelLeft }}
          onMouseLeave={closeDropdown}
        >
          <p className="font-serif text-lg text-ink">{activeMenu.value.label}</p>
          <ul className="mt-3">
            {activeMenu.children?.map((node) => (
              <li key={node.key}>
                <NavLink
                  to={node.value.link}
                  onClick={closeDropdown}
                  className="block border-b border-rule py-2 text-sm text-ink no-underline hover:italic"
                >
                  {node.value.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {activeMenu.value.link && (
            <NavLink
              to={activeMenu.value.link}
              onClick={closeDropdown}
              className="mt-3 inline-block text-sm text-ink/70 no-underline hover:text-ink"
            >
              All {activeMenu.value.label.toLowerCase()}
            </NavLink>
          )}
          {bannerNode?.value?.banner && (
            <img
              src={bannerNode.value.banner}
              alt=""
              className="mt-4 h-24 w-full object-cover"
            />
          )}
        </div>
      )}
    </nav>
  );
};

export default DesktopMenu;
