import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore"; // ใช้ getDocs แทน get
import { db } from "../firebaseConfig";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./SalesHistory.css";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
// ฟังก์ชันเพื่อคำนวณยอดขายและจำนวนของอาหาร
const calculateSalesData = (sales) => {
  const itemSales = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (itemSales[item.name]) {
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].total += item.price * item.quantity;
      } else {
        itemSales[item.name] = {
          quantity: item.quantity,
          total: item.price * item.quantity,
        };
      }
    });
  });

  const sortedData = Object.entries(itemSales)
    .map(([name, { quantity, total }]) => ({
      name,
      quantity,
      total,
    }))
    .sort((a, b) => b.total - a.total); // เรียงตามยอดขายรวม (total) จากมากไปหาน้อย

  return sortedData;
};

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [password, setPassword] = useState(""); // state สำหรับเก็บรหัส
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false); // state สำหรับตรวจสอบว่ารหัสถูกต้องหรือไม่

  useEffect(() => {
    const salesRef = collection(db, "SalesHistory");

    // ดึงข้อมูลแบบ real-time
    const unsubscribe = onSnapshot(salesRef, (querySnapshot) => {
      const salesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSales(salesData);
      setSalesData(calculateSalesData(salesData));
    });

    return () => unsubscribe(); // Cleanup listener
  }, [sales]);

  // ฟังก์ชัน handleDeleteAll ที่แก้ไขใหม่
  const handleDeleteAll = async () => {
    if (password === "778899") {
      const salesRef = collection(db, "SalesHistory");
      const querySnapshot = await getDocs(salesRef); // ใช้ getDocs แทน get
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref); // ลบเอกสารทั้งหมด
      });
      alert("All sales data has been deleted.");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="sales-history">
      <h2>Sales History</h2>
      <Link to="/kitchen-orders" className="stats-button">
        <FiArrowLeft size={28} color="black" /> {/* ไอคอนลูกศรย้อนกลับ */}
      </Link>
      {sales.length === 0 ? (
        <p>No sales history available</p>
      ) : (
        <div>
          {/* แสดงเมนูที่ขายดีที่สุด */}
          <h4>Top Best-Selling Menus</h4>
          <ul>
            {salesData.map((sale, index) => (
              <p key={sale.name}>
                <strong>
                  {index + 1}. {sale.name}
                </strong>{" "}
                - {sale.quantity} sold - {sale.total} THB
              </p>
            ))}
          </ul>
          {/* แสดงกราฟเส้น */}
          <h4>Sales Trend by Menu</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#007bff" />
            </LineChart>
          </ResponsiveContainer>

          {/* แสดงกราฟแท่ง */}
          <h4>Sales Quantity by Menu</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>

          {/* ฟอร์มกรอกรหัสเพื่อเปิดใช้ปุ่มลบ */}
          <div>
            <input
              type="password"
              placeholder="Enter password to delete all sales data"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleDeleteAll} disabled={password !== "778899"}>
              Delete All Sales Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
