import { Link } from "react-router-dom";
import SectionHeading, { ArrowRight } from "../SectionHeading";

const DESIGN_SERVICES = [
  {
    title: "Nội Thất Theo Yêu Cầu",
    image: "/images/interior-1.jpg",
    body: 'Mỗi khách hàng đều mang một cá tính riêng. Tại SONA SPACE, bạn được tự do chọn phong cách, màu sắc và bố trí theo đúng ý tưởng. Đội ngũ chuyên gia sẽ lắng nghe và hiện thực hóa từng chi tiết theo đúng "gu" sống của bạn.',
  },
  {
    title: "Tư Vấn Không Gian Sống",
    image: "/images/interior-2.jpg",
    body: "Không chỉ trông đẹp mắt mà còn thông minh - thiết kế nội thất của chúng tôi chú trọng vào sự tiện nghi và bố trí hợp lý. Dù là căn hộ nhỏ hay biệt thự rộng rãi, mọi thứ sẽ được sắp xếp tinh tế và tối ưu nhất.",
  },
];

const InteriorDesign = () => {
  return (
    <section className="interior-design">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Dịch vụ thiết kế"
          title="Nội Thất Theo Yêu Cầu"
          description="Khám phá dịch vụ thiết kế nội thất cao cấp của chúng tôi"
        />
        <div className="design-grid">
          {DESIGN_SERVICES.map((service) => (
            <article className="design-item" key={service.title} data-reveal>
              <div className="design-image parallax-frame">
                <img src={service.image} alt={service.title} loading="lazy" decoding="async" data-parallax="3" />
              </div>
              <div className="design-content">
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <Link to="/dich-vu-thiet-ke" className="design-link" data-magnetic="0.2">
                  Xem thêm
                  <ArrowRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteriorDesign;
