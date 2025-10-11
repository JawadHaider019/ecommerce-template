import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';

import Sidebar from './components/Sidebar.jsx'
import Login from './components/Login.jsx'
import Footer from './components/Footer.jsx'

import Add from './pages/Add.jsx'
import List from './pages/List.jsx'
import Orders from './pages/Orders.jsx'
import Dashboard from './pages/Dashboard.jsx';
import Setting from './pages/Setting.jsx';
import ContentManagement from './components/ContentManagement/ContentManagement.jsx';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency ='Rs.'

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
    useEffect(()=>{
        localStorage.setItem('token',token)
    },[token])
    
    return (
        <div className='bg-gray-50 min-h-screen'>
            <ToastContainer/>
            {token === "" ? <Login setToken={setToken} /> : <>
                <hr />
                    <Sidebar />
                    <div className='p-4 text-gray-600 text-base'>
                        <Routes>
                            <Route path='/' element={<Dashboard token={token} />} />
                            <Route path='/content-management' element={<ContentManagement token={token} />} />
                            <Route path='/add' element={<Add token={token}  setToken={setToken} />} />
                            <Route path='/list' element={<List token={token}  setToken={setToken}  />} />
                            <Route path='/orders' element={<Orders token={token}  setToken={setToken}  />} />
                            <Route path='/settings' element={<Setting token={token} setToken={setToken} />} />
                        </Routes>
                    </div>
            </>}
            <Footer />
        </div>
    )
}

export default App