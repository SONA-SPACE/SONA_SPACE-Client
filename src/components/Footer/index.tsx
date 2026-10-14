import { Link } from "react-router-dom";
import { ArrowRight } from "../SectionHeading";

// Shortcuts to the service and help pages, shown above the footer links
const TIP_LINKS = [
  {
    to: "/dich-vu-thiet-ke",
    image: "/images/tip-1.jpg",
    title: "Thiết kế cá nhân hóa",
    note: "Liên hệ ngay để được tư vấn",
  },
  {
    to: "/ho-so-kien-truc",
    image: "/images/tip-2.jpg",
    title: "Mẫu vật liệu",
    note: "Xem hồ sơ kiến trúc",
  },
  {
    to: "/lien-he",
    image: "/images/tip-3.jpg",
    title: "Liên hệ hỗ trợ",
    note: "Thứ 2 - Chủ nhật, 9h00 - 20h00",
  },
];

const Footer = () => {
  return (
    <>
      {/* Footer */}
      <footer className="footer">

        <nav className="design-tips" aria-label="Dịch vụ và hỗ trợ">
          <div className="container">
            <ul className="tips-strip">
              {TIP_LINKS.map((tip) => (
                <li key={tip.to}>
                  <Link to={tip.to} className="tip-link" data-reveal>
                    <img src={tip.image} alt="" width={72} height={72} loading="lazy" decoding="async" />
                    <span className="tip-link__text">
                      <span className="tip-link__title">{tip.title}</span>
                      <span className="tip-link__note">{tip.note}</span>
                    </span>
                    <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <ul>
                <li>
                  <Link to="/lien-he">Dịch vụ khách hàng</Link>
                </li>
                <li>
                  <Link to="/lien-he">Tìm cửa hàng gần bạn</Link>
                </li>
                <li>
                  <a href="#">Mua thẻ quà tặng</a>
                </li>
                <li>
                  <Link to="/lien-he">Về Sona Space</Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <ul>
                <li>
                  <Link to="/khong-gian">Phong cách</Link>
                </li>
                <li>
                  <Link to="/lien-he">Trung tâm hỗ trợ</Link>
                </li>
                <li>
                  <Link to="/lien-he">Câu chuyện thương hiệu</Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <ul>
                <li>
                  <a href="#">Câu hỏi thường gặp</a>
                </li>
                <li>
                  <Link to="/tai-khoan/don-hang">Theo dõi đơn hàng</Link>
                </li>
                <li>
                  <a href="#">Chính sách đổi trả</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <ul>
                <li>
                  <a href="#">Thông tin vận chuyển</a>
                </li>
                <li>
                  <a href="#">Chương trình thành viên</a>
                </li>
                <li>
                  <a href="#">Ưu đãi độc quyền</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Theo dõi chúng tôi</h3>
              <div className="social-icons">
                <a href="#" className="social-icon facebook" aria-label="Facebook">
                  <img src="/images/icons/facebook.svg" alt="" />
                </a>
                <a href="#" className="social-icon instagram" aria-label="Instagram">
                  <img src="/images/icons/ins.svg" alt="" />
                </a>
                <a href="#" className="social-icon pinterest" aria-label="Pinterest">
                  <img src="/images/icons/pint.svg" alt="" />
                </a>
                <a href="#" className="social-icon phone" aria-label="Gọi cho chúng tôi">
                  <img src="/images/icons/phone.svg" alt="" />
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h3>Xem thêm ưu đãi</h3>
              <Link to="/dang-ky" className="btn btn-primary">
                Đăng ký ngay
              </Link>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              Tất cả giá đều là giá bán lẻ đề xuất bằng Việt Nam Đồng (₫) và đã
              bao gồm VAT.
            </p>
            <p>
              <Link to="/dieu-khoan-su-dung">Thông tin cookie</Link>
            </p>
            <p>
              <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
            </p>
            <div className="payment-icons">
              <img src="/images/payment-icons.png" alt="Phương thức thanh toán: Mastercard, Visa, MoMo" loading="lazy" />
            </div>
            <div className="language">
              <p>Translate</p>
              <div className="language-icons">
                <img src="/images/icons/lang_vie.svg" alt="" />
                <span>Việt Nam</span>
                <span className="icon-arrow-down"><img src="/images/icons/arrow-down-black.svg" alt="" /></span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
