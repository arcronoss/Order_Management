import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";// import MenuBar from './components/MenuBar';
import TablePage from './components/TablePage';
import Kitchen from './components/Kitchen'; // นำเข้าไฟล์ Kitchen.js ที่คุณสร้างไว้


const App = () => {
    return (
        <Router>
            {/* <MenuBar /> */}
            <Routes>
                <Route path="/table/:tableId" element={<TablePage />} />
                <Route path="/kitchen-orders" element={<Kitchen />} /> {/* เพิ่ม Route สำหรับ Kitchen */}
            </Routes>
        </Router>
    );
};

export default App;

