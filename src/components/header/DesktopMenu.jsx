import { NavLink } from "react-router";
import { SfButton, SfIconChevronRight } from "@storefront-ui/react";

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
  refs,
}) => (
  <nav ref={refs}>
    <ul className="hidden border-b border-rule bg-paper px-6 py-1 md:flex">
      {menuContent.children?.map((menuNode) => (
        <li
          key={menuNode.key}
          className="relative last:[&_.menu-panel]:left-auto last:[&_.menu-panel]:right-0"
          onMouseLeave={closeDropdown}
        >
          <SfButton
            variant="tertiary"
            onClick={handleOpenMenu([menuNode.key])}
            onMouseEnter={handleOpenMenu([menuNode.key])}
            ref={refsByKey[menuNode.key]}
            className="group mr-2 !text-ink hover:!bg-transparent active:!bg-transparent"
          >
            <span className="font-sans text-sm">{menuNode.value.label}</span>
            <SfIconChevronRight className="rotate-90 text-ink/40 group-hover:text-ink" />
          </SfButton>

          {isDropdownOpen &&
            activeNode.length === 1 &&
            activeNode[0] === menuNode.key &&
            activeMenu && (
              <div
                key={activeMenu.key}
                ref={megaMenuRef}
                className="menu-panel absolute left-0 top-full z-30 hidden w-[18rem] border border-t-0 border-rule bg-paper p-4 outline-none md:block"
                tabIndex={0}
              >
                <p className="font-serif text-lg text-ink">
                  {activeMenu.value.label}
                </p>
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
        </li>
      ))}
    </ul>
  </nav>
);

export default DesktopMenu;
