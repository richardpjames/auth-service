import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import './Index.css';
import NotFound from './NotFound.tsx';
import Register from './Register.tsx';
import LogInPage from './LogIn.tsx';
import LoggedIn from './LoggedIn.tsx';
import Logout from './Logout.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex h-screen flex-col max-w-5xl mx-auto">
        <div className="w-full mt-5 px-5">
          <Routes>
            <Route path="/login" element={<LogInPage />} />
            <Route path="/loggedin" element={<LoggedIn />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
