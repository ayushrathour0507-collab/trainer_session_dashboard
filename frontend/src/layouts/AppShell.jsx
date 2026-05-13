/**
 * Purpose: Centralizes the fixed topbar, icon sidebar, parallax backdrop, and main content layout.
 */
import PropTypes from "prop-types";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import ParallaxBackdrop from "./ParallaxBackdrop.jsx";
import Sidebar from "./Sidebar.jsx";

const AppShell = ({ children }) => (
  <div className="app-shell">
    <ParallaxBackdrop />
    <Sidebar />
    <div className="app-content min-h-screen pt-[60px] md:pl-16">
      <Navbar />
      <main className="page-gutter min-h-[calc(100vh-60px)] pb-16 md:pb-4">{children}</main>
      <Footer />
    </div>
  </div>
);

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppShell;
