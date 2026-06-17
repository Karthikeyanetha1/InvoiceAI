import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import GoogleCallback from './pages/GoogleCallback'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import Documents from './pages/Documents'
import DocumentView from './pages/DocumentView'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Layout from './components/Layout'
import ResetPassword from './pages/ResetPassword'
// Add this route:
<Route path="/reset-password" element={<ResetPassword/>}/>

function PrivateRoute({children}){const{user}=useAuth();return user?children:<Navigate to="/login" replace/>}
function PublicRoute({children}){const{user}=useAuth();return !user?children:<Navigate to="/dashboard" replace/>}

export default function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style:{background:'#fff',color:'#111827',border:'1px solid #e1e8f0',fontFamily:'Inter,sans-serif',fontSize:'0.875rem'},
            success:{iconTheme:{primary:'#16a34a',secondary:'#fff'}}
          }}/>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>
            <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/auth/callback" element={<GoogleCallback/>}/>
            <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace/>}/>
              <Route path="dashboard" element={<Dashboard/>}/>
              <Route path="generate" element={<Generate/>}/>
              <Route path="documents" element={<Documents/>}/>
              <Route path="documents/:id" element={<DocumentView/>}/>
              <Route path="clients" element={<Clients/>}/>
              <Route path="clients/:id" element={<ClientDetail/>}/>
              <Route path="settings" element={<Settings/>}/>
              <Route path="admin" element={<Admin/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  )
}