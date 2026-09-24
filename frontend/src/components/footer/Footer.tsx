import {Link} from "react-router-dom";
import {Instagram} from "lucide-react";
import Brand from "../brand/Brand";

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link to="/" className="brand"><Brand/></Link>
          <p>Premium yoga for a more present life.</p>
        </div>
        <div className="footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/#services">Services</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>
        <div className="footer-contact">
          <strong>Contact</strong>
          <a href="tel:998761459">Khushi Khandar</a>
          <a href="tel:998761459">998761459</a>
          <a href="https://www.instagram.com/aarogyam_space_studio/" target="_blank" rel="noreferrer" className="instagram-link"><Instagram size={16}/> @aarogyam_space_studio</a>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Aarogyam Space Studio. All rights reserved.</div>
    </footer>
  );
}
