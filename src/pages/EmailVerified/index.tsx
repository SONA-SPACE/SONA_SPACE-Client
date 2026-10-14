import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailVerified: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const statusParam = params.get('status');
        const messageParam = params.get('message');

        if (statusParam === 'success' || statusParam === 'error') {
            setStatus(statusParam);
            setMessage(
                messageParam ||
                (statusParam === 'success'
                    ? 'Xác thực email thành công!'
                    : 'Có lỗi xảy ra trong quá trình xác thực email.')
            );
        } else {
            setStatus('error');
            setMessage('Liên kết xác thực không hợp lệ.');
        }
    }, [location.search]);

    const handleLoginClick = () => {
        navigate('/dang-nhap');
    };

    return (
        <>
            <div className="email-verified-page">
                <div className="container">
                    <div className="email-verified-content">
                        {status === 'success' ? (
                            <img
                                src="https://cdnl.iconscout.com/lottie/premium/thumb/success-animated-icon-download-in-lottie-json-gif-static-svg-file-formats--payment-checkmark-achievement-tick-warning-symbols-pack-user-interface-icons-7271806.gif"
                                alt="Success"
                                className="icon success-icon"
                            />
                        ) : (
                            <img
                                src="https://assets-v2.lottiefiles.com/a/b5641ed8-1152-11ee-ada0-8f4e8e17569e/HiOUGl9iPo.gif"
                                alt="Error"
                                className="icon error-icon"
                            />
                        )}

                        <h1 className="title">
                            {status === 'success' ? 'Xác thực tài khoản thành công!' : 'Xác thực thất bại!'}
                        </h1>

                        <p className="message">{message}</p>

                        {status === 'success' && (
                            <button
                                onClick={handleLoginClick}
                                className="login-btn success"
                            >
                                Đăng nhập ngay
                            </button>
                        )}

                        {status === 'error' && (
                            <p className="support-note">
                                Nếu bạn vẫn gặp sự cố, vui lòng liên hệ bộ phận hỗ trợ.
                                <br />
                                Email: <a href="mailto:support@example.com">support@example.com</a><br />
                                Điện thoại: <a href="tel:+1234567890">+123 456 7890</a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmailVerified;
