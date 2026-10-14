const POLICIES = [
  {
    icon: "/images/products/ship.svg",
    title: "Vận chuyển",
    text: "Giao hàng nhanh chóng, an toàn đến tận nhà bạn với dịch vụ vận chuyển chuyên nghiệp.",
  },
  {
    icon: "/images/products/support.svg",
    title: "Hỗ trợ 24/7",
    text: "Đội ngũ tư vấn luôn sẵn sàng giải đáp mọi thắc mắc của bạn mọi lúc, mọi nơi.",
  },
  {
    icon: "/images/products/money.svg",
    title: "Hoàn tiền & Bảo hành",
    text: "Chính sách hoàn tiền linh hoạt và bảo hành dài hạn, đảm bảo quyền lợi khách hàng.",
  },
];

const PolicyProduct = () => {
  return (
    <section className="Policy-full">
      <div className="container">
        <div className="box-policy">
          <div className="box-policy-1" data-reveal>
            <p className="policy-eyebrow">Cam kết</p>
            <h2 className="policy-text">Chính sách & Hỗ trợ</h2>
            <p className="p">
              Chúng tôi cung cấp chính sách đổi trả linh hoạt và hỗ trợ tận tình để bạn an tâm khi mua sắm nội thất.
            </p>
          </div>
          {POLICIES.map((policy) => (
            <div className="box-policy-2" key={policy.title} data-reveal>
              <span className="policy-icon">
                <img src={policy.icon} alt="" />
              </span>
              <h3 className="policy-text">{policy.title}</h3>
              <p className="p">{policy.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PolicyProduct;
