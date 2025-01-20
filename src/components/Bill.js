import React, { useState, useEffect } from "react";
import Modal from "react-modal"; // หรือใช้ Material-UI Dialog
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const BillModal = ({ tableId, isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const fetchOrders = async () => {
        try {
          const q = query(
            collection(db, "Order"),
            where("tableId", "==", tableId) // แทน tableId ด้วย ID โต๊ะปัจจุบัน
          );
          const querySnapshot = await getDocs(q);
          const orderData = [];
          let total = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            orderData.push(data);
            total += data.price * data.quantity; // สมมติว่า `price` และ `quantity` เป็นชื่อฟิลด์
          });

          setOrders(orderData);
          setTotalPrice(total);
        } catch (error) {
          console.error("Error fetching orders: ", error);
        }
      };

      fetchOrders();
    }
  }, [isOpen, tableId]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false}>
      <div style={{ padding: "20px" }}>
        <h2>บิลชำระเงิน</h2>
        {orders.length > 0 ? (
          <>
            <table style={{ width: "100%", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>ชื่ออาหาร</th>
                  <th style={{ textAlign: "right" }}>จำนวน</th>
                  <th style={{ textAlign: "right" }}>ราคา</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.name}</td>
                    <td style={{ textAlign: "right" }}>{order.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      {order.price * order.quantity} บาท
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>รวมทั้งหมด: {totalPrice} บาท</h3>
          </>
        ) : (
          <p>ไม่มีคำสั่งซื้อ</p>
        )}
        <button onClick={onClose} style={{ marginTop: "20px" }}>
          ปิด
        </button>
      </div>
    </Modal>
  );
};

export default BillModal;
