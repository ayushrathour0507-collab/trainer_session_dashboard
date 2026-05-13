// Purpose: Shows skeleton loading states that match the page card layout while data is fetched.
import PropTypes from "prop-types";

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-[var(--surface-field)] ${className}`} />
);

const LoadingSpinner = ({ label = "Loading" }) => (
  <div className="space-y-4" role="status" aria-live="polite">
    <div className="nexus-card p-4">
      <p className="label-tag text-accent">{label}</p>
      <SkeletonLine className="mt-3 h-8 w-72 max-w-full" />
      <SkeletonLine className="mt-3 h-4 w-[520px] max-w-full" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="nexus-card p-4">
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="mt-3 h-8 w-20" />
        </div>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="nexus-card p-4">
          <div className="flex items-center justify-between gap-3">
            <SkeletonLine className="h-5 w-24" />
            <SkeletonLine className="h-7 w-20 rounded-pill" />
          </div>
          <SkeletonLine className="mt-4 h-10 w-full" />
          <SkeletonLine className="mt-3 h-4 w-3/4" />
          <SkeletonLine className="mt-3 h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

SkeletonLine.propTypes = {
  className: PropTypes.string,
};

LoadingSpinner.propTypes = {
  label: PropTypes.string,
};

export default LoadingSpinner;
