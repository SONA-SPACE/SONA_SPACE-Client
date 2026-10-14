import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Link } from 'react-router-dom';
import { convertToAdminApiUrl } from '../../utils/url';
import { getAuthToken } from '../../services/loginService';
import { InlineErrorState, SkeletonText } from '../StateFeedback';
export interface Notification {
  notification_id: number;
  title: string;
  message: string;
  created_at: string;
  link: string;
  is_read: boolean;
}


export interface MiniNotificationHandle {
  toggleMiniNotification: () => void;
  closeMiniNotification: () => void;
  isVisible: boolean;
  refreshNotifications: () => void;
  getNotificationCount: () => number;
    markAllAsRead?: () => Promise<number>; 
}

interface MiniNotificationProps {
  onNotificationCountChange?: (count: number) => void;
}

const MiniNotification = forwardRef<MiniNotificationHandle, MiniNotificationProps>(
  ({ onNotificationCountChange }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [readingIds, setReadingIds] = useState<number[]>([]);
    const isExternalLink = (url?: string) => /^https?:\/\//.test(url || '');
    const getNotificationLink = (link?: string) => link || "/tai-khoan/ma-giam-gia";

    const refreshNotifications = async () => {
      const token = getAuthToken();

      if (!token) {
        setNotifications([]);
        setLoadError(null);
        setActionError(null);
        setLoading(false);
        if (onNotificationCountChange) onNotificationCountChange(0);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);
        setActionError(null);
        const response = await fetch(convertToAdminApiUrl("/couponcodes/notification"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json();
        const nextNotifications = Array.isArray(data) ? data : [];
        setNotifications(nextNotifications);

        if (onNotificationCountChange) {
          onNotificationCountChange(nextNotifications.length);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
        setNotifications([]);
        setLoadError("Không thể tải thông báo. Vui lòng thử lại.");
        if (onNotificationCountChange) onNotificationCountChange(0);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      refreshNotifications();
    }, []);



    useImperativeHandle(ref, () => ({
      toggleMiniNotification: () => setIsVisible((prev) => !prev),
      closeMiniNotification: () => setIsVisible(false),
      isVisible,
      refreshNotifications,
      getNotificationCount: () => notifications.length,
    }));
    const handleDeleteNotification = async (id: number) => {
      if (deletingIds.includes(id)) return;

      try {
        const token = getAuthToken();
        if (!token) {
          setActionError("Vui lòng đăng nhập để chỉnh sửa thông báo.");
          return;
        }

        setDeletingIds((prev) => [...prev, id]);
        setActionError(null);
        const response = await fetch(convertToAdminApiUrl(`/couponcodes/notification/${id}`), {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Không thể xóa thông báo");

        setNotifications((prev) => {
          const nextNotifications = prev.filter((n) => n.notification_id !== id);
          if (onNotificationCountChange) {
            onNotificationCountChange(nextNotifications.length);
          }
          return nextNotifications;
        });
      } catch (error) {
        console.error("Lỗi khi xoá thông báo:", error);
        setActionError("Không thể xóa thông báo. Vui lòng thử lại.");
      } finally {
        setDeletingIds((prev) => prev.filter((itemId) => itemId !== id));
      }
    };

const handleMarkAsRead = async (id: number) => {
  if (readingIds.includes(id)) return;

  const token = getAuthToken();
  if (!token) {
    setActionError("Vui lòng đăng nhập để xem thông báo.");
    return;
  }

  try {
    setReadingIds((prev) => [...prev, id]);
    setActionError(null);
    const res = await fetch(convertToAdminApiUrl(`/couponcodes/notification/read/${id}`), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to mark as read");

    setNotifications(prev =>
      prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
    );
  } catch (err) {
    console.error("Lỗi đánh dấu đã đọc:", err);
    setActionError("Không thể cập nhật trạng thái thông báo.");
  } finally {
    setReadingIds((prev) => prev.filter((itemId) => itemId !== id));
  }
};

    return (
      <div className={`mini-notification ${isVisible ? 'show' : ''}`}>
        <div className="mini-notification-content">
          <div className="mini-notification-header">
            <h3>Thông báo của bạn ({notifications.length})</h3>
            <button
              className="close-mini-notification"
              onClick={() => setIsVisible(false)}
            >
              <img src="/images/icons/close.svg" alt="Đóng" />
            </button>
          </div>
          <div className="mini-notification-items" >
            {loading ? (
              <div className="mini-notification-loading" aria-label="Đang tải thông báo">
                <SkeletonText lines={4} />
                <SkeletonText lines={4} />
              </div>
            ) : loadError ? (
              <InlineErrorState message={loadError} onRetry={refreshNotifications} />
            ) : notifications.length > 0 ? (
              <>
                {actionError && <InlineErrorState message={actionError} />}
                {notifications.map((noti) => (

                <div
                  key={noti.notification_id}
                  className={`mini-notification-item ${noti.is_read ? 'read' : 'unread'}`}
                >


                  {isExternalLink(noti.link) ? (
                    <a className="noti-content" href={getNotificationLink(noti.link)} target="_blank" rel="noopener noreferrer" onClick={() => handleMarkAsRead(noti.notification_id)}>
                      <h4 className="noti-title">{noti.title}</h4>
                      <div className="noti-message">{noti.message}</div>  
                    </a>
                  ) : (
                    <Link className="noti-content" to={getNotificationLink(noti.link)} onClick={() => handleMarkAsRead(noti.notification_id)}>
                      <h4 className="noti-title">{noti.title}</h4>
                      <div className="noti-message">{noti.message}</div>
                    </Link>
                  )}

                  <button
                    type="button"
                    className="delete-noti"
                    onClick={() => handleDeleteNotification(noti.notification_id)}
                    title="Xóa thông báo"
                    disabled={deletingIds.includes(noti.notification_id)}
                  >
                    <img src="/images/icons/close.svg" alt="Xóa" />
                  </button>
                </div>

                ))}
              </>

            ) : (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <img src="/images/icons/bell-ring.svg" alt="Giỏ hàng trống" />
                </div>
                <p>Thông báo của bạn đang trống</p>

              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

export default MiniNotification;
