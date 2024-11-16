import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Main from './components/Main';

const App = () => {

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/main" />} />
            <Route path="/main" element={<Main />} />
        </Routes>
    );
}

export default App;