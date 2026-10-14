import { Link } from "react-router-dom";
import type { Category } from "../../types";
import { useEffect, useState } from "react";
import { fetchAllCategories } from "../../services/categoryService";
import { SkeletonBlock } from "../StateFeedback";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";

export default function CategorySlider() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('');
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await fetchAllCategories();
                setDebugInfo(prev => `${prev}\nReceived ${data.length} categories`);
                setCategories(data);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to load rooms: ${errorMessage}`);
                setDebugInfo(prev => `${prev}\nError: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);
    const DebugInfo = () => {
        const isDev = false;
        return isDev && debugInfo ? (
            <div className="category-list-debug">
                <details>
                    <summary>Debug Info</summary>
                    <pre>{debugInfo}</pre>
                </details>
            </div>
        ) : null;
    };

    if (loading) {
        return (
            <div className="categories-flex">
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
                <DebugInfo />
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
    if (categories.length === 0) {
        return (
            <div className="category-list-empty">
                <p>Không tìm thấy tin tức nào</p>
                <DebugInfo />
            </div>
        );
    }
    return (
        <Swiper
            className="categories-flex"
            modules={[FreeMode, Scrollbar]}
            freeMode={true}
            scrollbar={{
                draggable: true,
                hide: false,
                dragSize: 200,
            }}
            spaceBetween={24}
            slidesPerView="auto"
            grabCursor={true}
            style={{ paddingBottom: 48 }}
        >
            {categories.map((category: Category) => (
                <SwiperSlide key={category.category_id}>
                    <div
                        key={category.category_id}
                        className={`category-item`}
                    >
                        <Link to={`/danh-muc/${category.slug}`} className="category-link">
                            <div className="category-image">
                                <img src={category.category_image} alt="" loading="lazy" decoding="async" />
                            </div>
                            <h3 className="category-name">{category.category_name}</h3>
                        </Link>
                    </div>
                </SwiperSlide>
            ))}

        </Swiper>
    )
}
