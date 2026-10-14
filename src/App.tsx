import './styles/style.scss'
import './styles/fonts.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { AuthProvider } from './contexts/AuthContext'
import ScrollToTop from './components/ScrollTop/ScrollToTop'
import SiteLayout from './layouts/SiteLayout'
import MotionProvider from './motion/MotionProvider'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import RouteFallback from './layouts/RouteFallback'

const ProductPage = lazy(() => import('./pages/ProductPage'))
const ProductOfCategory = lazy(() => import('./pages/ProductOfCategory'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const CartPage = lazy(() => import('./pages/CartPage'))
const Payment = lazy(() => import('./pages/Payment'))
const OrderComplete = lazy(() => import('./pages/OrderComplete'))
const Rooms = lazy(() => import('./pages/Rooms'))
const RoomDetail = lazy(() => import('./pages/RoomDetail'))
const ContactForm = lazy(() => import('./pages/ContactForm'))
const ContactFormArch = lazy(() => import('./pages/ContactFormArch'))
const ContactFormDesign = lazy(() => import('./pages/ContactFormDesign'))
const SignUp = lazy(() => import('./pages/SignUp'))
const SignIn = lazy(() => import('./pages/SignIn'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const User = lazy(() => import('./pages/User'))
const DetailOrder = lazy(() => import('./pages/DetailOrder'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Policy = lazy(() => import('./pages/Policy'))
const News = lazy(() => import('./pages/News'))
const NewsDetail = lazy(() => import('./pages/NewsDetail'))
const NotFoundPage = lazy(() => import('./pages/404'))
const PaymentResult = lazy(() => import('./pages/PaymentResult'))
const EmailVerified = lazy(() => import('./pages/EmailVerified'))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <MotionProvider />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/san-pham" element={<ProductPage />} />
            <Route path="/danh-muc/:slug" element={<ProductOfCategory />} />
            <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
            <Route path="/san-pham-yeu-thich" element={<Wishlist />} />
            <Route path="/gio-hang" element={<CartPage />} />
            <Route path="/thanh-toan" element={<Payment />} />
            <Route path="/dat-hang-thanh-cong/:orderHash" element={<OrderComplete />} />
            <Route path="/khong-gian" element={<Rooms />} />
            <Route path="/khong-gian/:slug" element={<RoomDetail />} />
            <Route path="/dich-vu-thiet-ke" element={<ContactFormDesign />} />
            <Route path="/ho-so-kien-truc" element={<ContactFormArch />} />
            <Route path="/lien-he" element={<ContactForm />} />
            <Route path="/dang-ky" element={<SignUp />} />
            <Route path="/dang-nhap" element={<SignIn />} />
            <Route path="/quen-mat-khau" element={<ForgotPassword />} />
            <Route path="/tai-khoan" element={<User />} />
            <Route path="/tai-khoan/thong-tin" element={<User />} />
            <Route path="/tai-khoan/ma-giam-gia" element={<User />} />
            <Route path="/tai-khoan/don-hang" element={<User />} />
            <Route path="/chi-tiet-don-hang/:id" element={<DetailOrder />} />
            <Route path="/dieu-khoan-su-dung" element={<Privacy />} />
            <Route path="/chinh-sach-bao-mat" element={<Policy />} />
            <Route path="/tin-tuc" element={<News />} />
            <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
            <Route path="/xac-thuc-email" element={<EmailVerified />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route
            path="/thanh-toan-result"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PaymentResult />
              </Suspense>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          style={{ marginTop: "var(--height-header)", zIndex: "var(--z-toast)" }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
