/**
 * Purpose: Live poster canvas facade for the enhanced Poster Studio, backed by the existing poster preview renderer.
 */
import PropTypes from "prop-types";
import PosterPreview from "./PosterPreview.jsx";

const PosterCanvas = ({ session, fields }) => <PosterPreview session={session} fields={fields} />;

PosterCanvas.propTypes = {
  session: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};

export default PosterCanvas;
