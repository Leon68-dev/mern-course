import React from 'react';
import { Route, 
    Routes,
} from 'react-router-dom';
import { CreatePage } from './pages/CreatePage';
import { LinksPage } from './pages/LinksPage';
import { DetailPage } from './pages/DetailPage';
import { AuthPage } from './pages/AuthPage';

export const useRoutes = isAuthentificated => {
    console.log('isAuthentificated', isAuthentificated);
    if(isAuthentificated){
        return (
            <Routes>
                <Route path='/links' element={<LinksPage />} exact />
                <Route path='/create' element={<CreatePage />} exact />
                <Route path='/detail/id:' element={<DetailPage />} />
                <Route path='/' element={<CreatePage />} exact />
            </Routes>
        );
    }

    return (
            <Routes>
                <Route path='/' element={<AuthPage />} exact />
            </Routes>
    );
    
}