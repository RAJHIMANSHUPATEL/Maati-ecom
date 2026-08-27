import { BRAND } from "../brand";
import { NavLink } from "react-router";

const Wordmark = ({ className = "" }) => (
  <NavLink
    to="/"
    aria-label={`${BRAND.name} home`}
    className={`font-serif italic text-ink no-underline tracking-tight ${className}`}
  >
    {BRAND.name}
  </NavLink>
);

export default Wordmark;
