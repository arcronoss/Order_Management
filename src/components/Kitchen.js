import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assuming your Firebase configuration is correct
import "./Kitchen.css"; // Make sure to style this page accordingly
import logo from "../images/Logo.png";
import { Link } from "react-router-dom";
import { FiBarChart2 } from "react-icons/fi"; // ใช้ไอคอนสถิติ

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from Firebase in real-time
  useEffect(() => {
    const ordersRef = collection(db, "Orders");
    const ordersQuery = query(ordersRef, orderBy("queueNumber", "asc")); // Sort by queueNumber

    const unsubscribe = onSnapshot(
      ordersQuery,
      (querySnapshot) => {
        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
        setIsLoading(false); // Stop loading when data is fetched
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup
  }, []);

  // Delete order by ID
  // Delete order by ID and update queue numbers
  const handleArchiveOrder = async (orderId) => {
    try {
      const orderToArchive = orders.find((order) => order.id === orderId);
      if (!orderToArchive) return;
  
      // ดึงเฉพาะข้อมูลที่ต้องการ (รายการอาหาร, ราคา, จำนวน)
      const archivedItems = orderToArchive.items.map((menu) => ({
        name: menu.name,
        price: menu.price,
        quantity: menu.quantity,
      }));
  
      // เพิ่มข้อมูลไปยัง SalesHistory
      const salesHistoryRef = collection(db, "SalesHistory");
      await addDoc(salesHistoryRef, {
        items: archivedItems, // บันทึกเฉพาะข้อมูลที่ต้องการ
        archivedAt: new Date().toISOString(), // เวลาที่บันทึก
      });
  
      // ลบออเดอร์ออกจาก Orders หลังจากบันทึก
      const orderDocRef = doc(db, "Orders", orderId);
      await deleteDoc(orderDocRef);
  
      console.log(`Order ${orderId} archived successfully.`);
    } catch (error) {
      console.error(`Error archiving order ${orderId}:`, error);
    }
  };
  

  // Accept order by updating its status
  const handleAcceptOrder = async (orderId) => {
    const orderRef = doc(db, "Orders", orderId);
    try {
      console.log("กำลังอัปเดตสถานะคำสั่งซื้อ", orderId);
      await updateDoc(orderRef, {
        status: "กำลังทำอาหาร", // เปลี่ยนสถานะเป็นกำลังทำอาหาร
      });
      console.log("สถานะคำสั่งซื้อเปลี่ยนเป็นกำลังทำอาหาร");
    } catch (error) {
      console.error("ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้: ", error);
    }
  };
  // Update order status to "เสร็จสิ้น"
  // เมื่อกด Order Success ให้ลบออเดอร์และลดคิว
  const handleOrderSuccess = async (orderId) => {
    try {
      const orderToComplete = orders.find((order) => order.id === orderId);
      if (!orderToComplete) return;

      const orderDocRef = doc(db, "Orders", orderId);

      // อัปเดต order ที่เสร็จสิ้นให้ queueNumber เป็น null และเปลี่ยนสถานะเป็น "เสร็จสิ้น"
      await updateDoc(orderDocRef, {
        queueNumber: null, // หรือ "" ตามที่คุณต้องการ
        status: "รอชำระเงิน",
      });

      // ดึงรายการที่มี queueNumber มากกว่าของ order นี้
      const ordersToUpdate = orders.filter(
        (order) =>
          order.queueNumber && order.queueNumber > orderToComplete.queueNumber
      );

      // ลด queueNumber ของออเดอร์ที่เหลือลง 1
      const updatePromises = ordersToUpdate.map((order) => {
        const orderDocRef = doc(db, "Orders", order.id);
        return updateDoc(orderDocRef, { queueNumber: order.queueNumber - 1 });
      });

      await Promise.all(updatePromises);

      console.log(
        `Order ${orderId} marked as completed, queue number removed, and remaining orders updated.`
      );
    } catch (error) {
      console.error(
        `Error updating order ${orderId} or adjusting queue numbers:`,
        error
      );
    }
  };

  // Render order details
  const handlePaymentSuccess = async (orderId) => {
    try {
      const orderDocRef = doc(db, "Orders", orderId);
      await updateDoc(orderDocRef, {
        status: "ชำระเงินแล้ว", // อัปเดตสถานะเมื่อชำระเงินเสร็จสิ้น
      });
      console.log(`Order ${orderId} marked as paid.`);
    } catch (error) {
      console.error(
        `Error updating payment status for order ${orderId}:`,
        error
      );
    }
  };

  const renderOrderDetails = (order) => {
    return (
      <div key={order.id} className="order-item-kitchen">
        <h3>
          {order.queueNumber !== null ? `Queue #${order.queueNumber} - ` : ""}
          Table {order.tableId}
        </h3>

        {/* Container ใหม่สำหรับจัดรายการอาหารและปุ่มในแถวเดียวกัน */}
        <div className="order-details-kitchen">
          <ul>
            {order.items.map((item) => (
              <li key={item.menuId}>
                {item.name} (x{item.quantity}) - {item.price * item.quantity}{" "}
                THB
              </li>
            ))}
          </ul>
          <div className="order-buttons-kitchen">
            {order.status !== "กำลังทำอาหาร" &&
              order.status !== "รอชำระเงิน" &&
              order.status !== "ชำระเงินแล้ว" && (
                <button
                  className="accept-button-kitchen"
                  onClick={() => handleAcceptOrder(order.id)}
                  disabled={order.status === "accepted"}
                >
                  {order.status === "accepted" ? "Accepted" : "Accept Order"}
                </button>
              )}

            {order.status === "กำลังทำอาหาร" && (
              <button
                className="success-button-kitchen"
                onClick={() => handleOrderSuccess(order.id)}
              >
                Order Success
              </button>
            )}

            {order.status === "รอชำระเงิน" && (
              <button
                className="payment-button-kitchen"
                onClick={() => handlePaymentSuccess(order.id)}
              >
                ลูกค้าจ่ายเงินแล้ว
              </button>
            )}

            {order.status === "ชำระเงินแล้ว" && (
             <button className="archive-button" onClick={() => handleArchiveOrder(order.id)}>
             Archive Order
           </button>
           
            )}
          </div>
        </div>

        <div className="order-total">Total: {order.total} THB</div>

        {order.status === "รอชำระเงิน" && (
          <span className="order-status-kitchen completed">
            Order Complete!
          </span>
        )}
        {order.status === "ชำระเงินแล้ว" && (
          <div className="order-status-kitchen paid">Payment Completed!</div>
        )}
        <hr />
      </div>
    );
  };

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div className="kitchen">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Manage orders</h2>

      {/* ปุ่มสถิติ */}
      <Link to="/sales-history" className="stats-button">
        <FiBarChart2 size={28} color="black" /> {/* ไอคอนสถิติ */}
      </Link>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="orders-list-kitchen">
          {orders.map(renderOrderDetails)}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
