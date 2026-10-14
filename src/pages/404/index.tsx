import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <>
      <div className="not-found-page">
        <div className="container">
          <div className="not-found-content">
            <h1 className="not-found-title">Chúng tôi không thể tìm thấy trang mà bạn đang tìm</h1>
            
            <Link to="/" className="back-to-home">
              Về lại trang chủ <span className="arrow" aria-hidden="true">→</span>
            </Link>
            
            <div className="not-found-image">
              <img src="/images/404/404.svg" alt="" width={700} height={496} />
            </div>
          </div>
        </div>
        
        
      </div>
    </>
  );
};

export default NotFoundPage;
