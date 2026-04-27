import React from 'react';
import './Footer.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
    <div className="footer">
      <div className="footer_socials">
        <FaFacebookF className="social_icon" />
        <FaInstagram className="social_icon" />
        <FaTwitter className="social_icon" />
        <FaYoutube className="social_icon" />
      </div>
      
      <div className="footer_links">
        <ul>
          <li>Audio Description</li>
          <li>Help Centre</li>
          <li>Gift Cards</li>
          <li>Media Centre</li>
          <li>Investor Relations</li>
          <li>Jobs</li>
          <li>Terms of Use</li>
          <li>Privacy</li>
          <li>Legal Notices</li>
          <li>Cookie Preferences</li>
          <li>Corporate Information</li>
          <li>Contact Us</li>
        </ul>
      </div>
      
      <button className="footer_serviceCode">Service Code</button>
      
      <p className="footer_copyright">© 1997-2026 Netflix, Inc.</p>
    </div>
  );
}

export default Footer;
