import { useState } from "react";

const accordionData = [
  {
    label: "Trò chuyện với Nhà Thiết Kế Nội Thất",
    content: `
            <p>Các chuyên gia thiết kế của chúng tôi luôn sẵn sàng giúp bạn hiện thực hóa ý tưởng của mình. Dù là phong cách nào, chúng tôi đều hỗ trợ tận tình để bạn có được không gian như mong muốn.</p>
          `,
  },
  {
    label: "Nâng tầm không gian với thiết kế nội thất Việt Nam",
    content: `
            <p>Khám phá phong cách độc đáo từ các nghệ nhân địa phương cho ngôi nhà của bạn.</p>
          `,
  },
  {
    label: "Cửa hàng nội thất thiết kế độc đáo",
    content: `
            <p>Chúng tôi kết hợp thẩm mỹ và công năng để tạo nên những sản phẩm vượt thời gian.</p>
            <p><strong>Giờ mở cửa:</strong> Thứ 2 - Chủ nhật, 9h00 - 20h00</p>
          `,
  },
  {
    label: "Tạo phong cách riêng với tùy chọn cá nhân hóa",
    content: `
            <p>Chọn chất liệu, màu sắc và kiểu dáng để thể hiện dấu ấn cá nhân của bạn.</p>
          `,
  },
];

const GetInTouch = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="get-in-touch">
      <div className="container">
        <h2 className="get-in-touch__title" data-reveal>
          Liên hệ với chúng tôi
        </h2>

        <div className="get-in-touch__box">
          <div className="get-in-touch__intro" data-reveal>
            <p className="get-in-touch__description">
              Bạn đang tìm kiếm nội thất thiết kế mang dấu ấn Việt? Đội ngũ chăm
              sóc khách hàng của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc –
              từ sản phẩm, dịch vụ đến những yêu cầu đặc biệt khác. Đừng ngần
              ngại liên hệ với chúng tôi.
            </p>
          </div>

          <div className="get-in-touch__options" data-reveal>
            {accordionData.map((item, index) => {
              const open = openIndex === index;
              const panelId = `get-in-touch-panel-${index}`;
              return (
                <div key={item.label} className={`get-in-touch__option${open ? " active" : ""}`}>
                  <button
                    type="button"
                    className="get-in-touch__header"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => handleToggle(index)}
                  >
                    <span className="get-in-touch__label">{item.label}</span>
                    <svg className="get-in-touch__icon" viewBox="0 0 15 8" fill="none" aria-hidden="true">
                      <path d="M1 1L7.5 7L14 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="get-in-touch__content-wrapper" id={panelId} role="region" aria-hidden={!open}>
                    <div className="get-in-touch__content" dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
