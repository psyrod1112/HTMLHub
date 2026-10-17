import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'
import { SubscriptionsProvider } from './context/SubscriptionsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ForgotPassword, Login, ResetPassword, Signup } from './pages/Auth'
import Channel from './pages/Channel'
import Home from './pages/Home'
import MyPage from './pages/MyPage'
import NotFound from './pages/NotFound'
import SubscriptionFeed from './pages/SubscriptionFeed'
import Upload from './pages/Upload'
import Watch from './pages/Watch'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/p/:id" element={<Watch />} />
                <Route path="/u/:id" element={<Channel />} />
                <Route path="/feed/subscriptions" element={<RequireAuth><SubscriptionFeed /></RequireAuth>} />
                <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
                <Route path="/me" element={<RequireAuth><MyPage /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SubscriptionsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
