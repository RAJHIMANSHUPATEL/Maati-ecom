import { SfBadge, SfButton, SfIconPerson } from "@storefront-ui/react";
import { useNavigate } from "react-router";
import UserDropdown from "./UserDropdown";
import { useCart } from "../../context/CartContext";

const ActionItems = ({ actionItems, user, logout }) => {
  const navigate = useNavigate();
  const { cartItemCount } = useCart();
  const cartItem = actionItems.find((item) => item.role !== "login");

  return (
    <nav className="flex flex-nowrap items-center justify-end gap-x-1 md:ml-6">
      {cartItem && (
        <SfButton
          className="relative !bg-transparent !text-ink hover:!bg-transparent"
          key={cartItem.ariaLabel}
          aria-label={cartItem.ariaLabel}
          variant="tertiary"
          slotPrefix={cartItem.icon}
          onClick={() => navigate(cartItem.link)}
          square
        >
          <span className="hidden pr-1 font-sans text-sm lg:inline">Bag</span>
          <SfBadge content={cartItemCount} className="!bg-chilli text-xs" />
        </SfButton>
      )}

      {user ? (
        <UserDropdown user={user} logout={logout} />
      ) : (
        <SfButton
          className="!bg-transparent !text-ink hover:!bg-transparent"
          aria-label="Log in"
          variant="tertiary"
          slotPrefix={<SfIconPerson />}
          onClick={() => navigate("/login")}
        >
          <span className="hidden font-sans text-sm lg:inline">Account</span>
        </SfButton>
      )}
    </nav>
  );
};

export default ActionItems;
