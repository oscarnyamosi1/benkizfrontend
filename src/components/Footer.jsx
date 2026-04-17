import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="grid-3" style={{ gap: 40 }}>
          <div>
            <h6>Working Hours</h6>
            <ul>
              <li>Monday - Friday: 08:00 am - 08:30 pm</li>
              <li>Saturday: 10:00 am - 04:30 pm</li>
              <li>Sunday: 10:00 am - 04:30 pm</li>
            </ul>
            <a href="tel:+254795404843" className="btn btn-primary btn-sm" style={{ marginTop: 20 }}>
              <i className="fa fa-phone" /> 0795404843
            </a>
          </div>

          <div style={{ textAlign: 'center' }}>
            <img
              src="../src/assets/logo.webp"
              alt="Benkiz Bakers"
              style={{height: 80, margin: '0 auto 16px' }}
            />
            <p style={{ fontSize: 14 }}>
              Benkiz Bakers is a trusted Kenyan Brand that started as a small family business.
              The owners are Mr. Kizito and Areri Jr, supported by a staff of 12 employees.
            </p>
            <div className="footer__social" style={{ justifyContent: 'center', marginTop: 20 }}>
              <a href="https://www.facebook.com/61578599433460/" title="Facebook" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="https://wa.me/254707091550" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp" />
              </a>
              <a href="https://www.tiktok.com/@benkizbakers" title="TikTok" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-tiktok" />
              </a>
            </div>
          </div>

          <div>
            <h6>Quick Links</h6>
            <ul>
              <li><Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link></li>
              <li><Link to="/shop" style={{ color: 'rgba(255,255,255,0.7)' }}>Shop</Link></li>
              <li><Link to="/gallery" style={{ color: 'rgba(255,255,255,0.7)' }}>Gallery</Link></li>
              <li><Link to="/classes" style={{ color: 'rgba(255,255,255,0.7)' }}>Baking Classes</Link></li>
              <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.7)' }}>Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>Copyright &copy; {year} Benkiz Bakers. All rights reserved.</span>
        <a href="https://wa.me/254795404843" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-whatsapp" /> WhatsApp Us
        </a>
      </div>
    </footer>
  )
}
