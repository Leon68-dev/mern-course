import React from 'react';
import { Route, 
    BrowserRouter,
    Routes,
} from 'react-router-dom';
import { CreatePage } from './pages/CreatePage';
import { LinksPage } from './pages/LinksPage';
import { DetailPage } from './pages/DetailPage';
import { AuthPage } from './pages/AuthPage';

export const useRoutes = isAuthentificated => {
    if(isAuthentificated){
        return (
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<CreatePage />} exact />
                    <Route path='/links' element={<LinksPage />} exact />
                    <Route path='/create' element={<CreatePage />} exact />
                    <Route path='/detail/id:' element={<DetailPage />} />
                    {/* Redirect */}
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<AuthPage />} exact />
            </Routes>
        </BrowserRouter>
    );
    
}