import '../public/scss/style.scss'
import '../public/fonts/stylesheet.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import ProductOfCategory from './pages/ProductOfCategory'
import ProductDetailPage from './pages/ProductDetailPage'
import Wishlist from './pages/Wishlist'
import CartPage from './pages/CartPage'
import Payment from './pages/Payment'
import OrderComplete from './pages/OrderComplete'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import ContactForm from './pages/ContactForm'
import ContactFormArch from './pages/ContactFormArch'
import ContactFormDesign from './pages/ContactFormDesign'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import User from './pages/User'
import DetailOrder from './pages/DetailOrder'
import Privacy from './pages/Privacy'
import Policy from './pages/Policy'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import NotFoundPage from './pages/404'
import '../public/fonts/stylesheet.css'
import TestPage from './pages/TestPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductPage />} />
        <Route path="/danh-muc/:slug" element={<ProductOfCategory />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="/san-pham-yeu-thich" element={<Wishlist />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan" element={<Payment />} />
        <Route path="/dat-hang-thanh-cong" element={<OrderComplete />} />
        <Route path="/khong-gian" element={<Rooms />} />
        <Route path="/khong-gian/:slug" element={<RoomDetail />} />
        <Route path="/dich-vu-thiet-ke" element={<ContactForm />} />
        <Route path="/ho-so-kien-truc" element={<ContactFormArch />} />
        <Route path="/lien-he" element={<ContactFormDesign />} />
        <Route path="/dang-ky" element={<SignUp />} />
        <Route path="/dang-nhap" element={<SignIn />} />
        <Route path="/quen-mat-khau" element={<ForgotPassword />} />
        <Route path="/tai-khoan" element={<User />} />
        <Route path="/chi-tiet-don-hang/:id" element={<DetailOrder />} />
        <Route path="/dieu-khoan-su-dung" element={<Privacy />} />
        <Route path="/chinh-sach-bao-mat" element={<Policy />} />
        <Route path="/tin-tuc" element={<News />} />
        <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
        <Route path="/test" element={<TestPage />} />
        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
