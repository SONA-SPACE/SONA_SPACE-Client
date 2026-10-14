import React from "react";

interface SeemoreProps {
  onClick: () => void;
}

const Seemore: React.FC<SeemoreProps> = ({ onClick }) => {
  return (
    // A real button: it already sits inside the page container, so no second .container here
    <button type="button" className="box-seemore" onClick={onClick}>
      <span className="box-seemore__label">Xem thêm sản phẩm</span>
      <span className="arow-seemore" aria-hidden="true">
        <img src="/images/products/arow.svg" alt="" />
        <img src="/images/products/arow.svg" alt="" />
      </span>
    </button>
  );
};

export default Seemore;
