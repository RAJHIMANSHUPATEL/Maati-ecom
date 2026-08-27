import {
  SfButton,
  SfIconPerson,
  SfDropdown,
  useDisclosure,
  SfListItem,
} from "@storefront-ui/react";
import { NavLink, useNavigate } from "react-router";

const UserDropdown = ({ user, logout }) => {
  const navigate = useNavigate();
  const { isOpen, toggle, close } = useDisclosure();

  const handleLogout = () => {
    logout();
    navigate("/");
    close();
  };

  const dropdownList = [
    {
      name: "Profile",
      link: "/profile",
    },
    {
        name: "Addresses",
        link: "/address",
    },
    {
      name: "Orders",
      link: "/orders",
    },
    {
      name: "Logout",
      click: handleLogout,
    },
  ];

  return (
    <SfDropdown
      open={isOpen}
      onClose={close}
      trigger={
        <SfButton
          variant="tertiary"
          onClick={toggle}
          className="!bg-transparent !text-ink hover:!bg-transparent"
        >
          <SfIconPerson />
          <span className="hidden font-sans text-sm lg:inline">
            Hi, {user.first_name}
          </span>
        </SfButton>
      }
      placement="bottom-end"
    >
      <div className="flex flex-col border border-neutral-200 rounded-md shadow-lg min-w-[120px] z-50 relative bg-white">
        <ul className="py-2">
          {dropdownList.map((item) =>
            item.link ? (
              <SfListItem
                as={NavLink}
                size="sm"
                to={item.link}
                className="px-4 py-2 hover:bg-neutral-100 flex items-center gap-2"
                key={item.name}
              >
                {item.name}
              </SfListItem>
            ) : (
              <SfListItem
                size="sm"
                onClick={item.click}
                className="px-4 py-2 hover:bg-neutral-100 flex items-center gap-2"
                key={item.name}
              >
                {item.name}
              </SfListItem>
            )
          )}
        </ul>
      </div>
    </SfDropdown>
  );
};

export default UserDropdown;
