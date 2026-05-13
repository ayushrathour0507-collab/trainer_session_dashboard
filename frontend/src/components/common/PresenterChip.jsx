// Purpose: Renders a trainer avatar initial and name block.
import PropTypes from "prop-types";

const initials = (name = "TBD") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "TD";

const PresenterChip = ({ name = "TBD", role = "Trainer", avatar = "" }) => (
  <div className="flex min-w-0 items-center gap-2">
    {avatar ? (
      <img src={avatar} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
    ) : (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-black text-accent">
        {initials(name)}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-black text-light-text dark:text-dark-text">{name}</p>
      <p className="truncate text-xs font-bold text-light-subtext dark:text-dark-subtext">{role}</p>
    </div>
  </div>
);

PresenterChip.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
  avatar: PropTypes.string,
};

export default PresenterChip;
