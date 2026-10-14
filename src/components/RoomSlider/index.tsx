import { Link } from "react-router-dom";
import { fetchAllRooms } from "../../services/roomService";
import type { Room } from "../../types";
import { useEffect, useState } from "react";
import { SkeletonBlock } from "../StateFeedback";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";

export default function RoomSlider() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('');
    useEffect(() => {
        const loadRooms = async () => {
            try {
                setLoading(true);
                const data = await fetchAllRooms();
                setDebugInfo(prev => `${prev}\nReceived ${data.length} rooms`);
                setRooms(data);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to load rooms: ${errorMessage}`);
                setDebugInfo(prev => `${prev}\nError: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        loadRooms();
    }, []);
    const DebugInfo = () => {
        const isDev = false; // Debug details are for local troubleshooting, never for shoppers
        return isDev && debugInfo ? (
            <div className="category-list-debug">
                <details>
                    <summary>Debug Info</summary>
                    <pre>{debugInfo}</pre>
                </details>
            </div>
        ) : null;
    };
    // Same footprint as the loaded slider, so the sections below do not jump when rooms arrive
    if (loading) {
        return (
            <div className="categories-flex" aria-busy="true" aria-label="Đang tải không gian">
                {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="category-item">
                        <SkeletonBlock
                            width={300}
                            height={420}
                            className="category-slider-skeleton__image"
                        />
                        <SkeletonBlock
                            width="100%"
                            height={40}
                            className="category-slider-skeleton__title"
                        />
                    </div>
                ))}
            </div>
        );
    }
    if (error) {
        return (
            <div className="category-list-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
                <DebugInfo />
            </div>
        );
    }
    if (rooms.length === 0) {
        return (
            <div className="category-list-empty">
                <p>Không tìm thấy không gian nào</p>
                <DebugInfo />
            </div>
        );
    }
    return (
        <>
            <Swiper
                className="categories-flex"
                modules={[FreeMode, Scrollbar]}
                spaceBetween={24}
                slidesPerView="auto"
                grabCursor={true}
                style={{ paddingBottom: 48 }}
                freeMode={true}
                scrollbar={{
                    draggable: true,
                    hide: false,
                    dragSize: 200,
                }}
            >
                {rooms.map((room: Room) => (
                    <SwiperSlide
                        key={room.room_id}
                        style={{ width: 300 }}
                        className={`category-item`}
                    >
                        <Link to={`/khong-gian/${room.slug}`} className="category-link">
                            <div className="category-image">
                                <img src={room.room_image} alt={room.room_name} />
                            </div>
                            <h3 className="category-name">{room.room_name}</h3>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}