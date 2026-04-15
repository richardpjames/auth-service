import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import './Index.css';

const NotFound = lazy(() => import('./NotFound.tsx'));
const Register = lazy(() => import('./Register.tsx'));
const LogInPage = lazy(() => import('./LogIn.tsx'));
const LoggedIn = lazy(() => import('./LoggedIn.tsx'));
const Logout = lazy(() => import('./Logout.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex h-screen flex-col max-w-5xl mx-auto">
        <div className="w-full mt-5 px-5">
          <Suspense
            fallback={
              <div className="w-full text-center">
                <p className="loading"></p>
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<LogInPage />} />
              <Route path="/loggedin" element={<LoggedIn />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
