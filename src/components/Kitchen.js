import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assuming your Firebase configuration is correct
import "./Kitchen.css"; // Make sure to style this page accordingly

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
const handleDelete = async (orderId) => {
  try {
    const orderToDelete = orders.find((order) => order.id === orderId);
    if (!orderToDelete) return;

    const orderDocRef = doc(db, "Orders", orderId);
    await deleteDoc(orderDocRef); // ลบออเดอร์ปัจจุบัน

    console.log(`Order ${orderId} deleted successfully without updating queue numbers`);
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
  }
};


  // Accept order by updating its status
  const handleAcceptOrder = async (orderId) => {
    const orderRef = doc(db, "Orders", orderId);
    try {
      console.log("กำลังอัปเดตสถานะคำสั่งซื้อ", orderId);
      await updateDoc(orderRef, {
        status: "กำลังทำอาหาร",  // เปลี่ยนสถานะเป็นกำลังทำอาหาร
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
      status: "รอชำระเงิน"
    });

    // ดึงรายการที่มี queueNumber มากกว่าของ order นี้
    const ordersToUpdate = orders.filter(
      (order) => order.queueNumber && order.queueNumber > orderToComplete.queueNumber
    );

    // ลด queueNumber ของออเดอร์ที่เหลือลง 1
    const updatePromises = ordersToUpdate.map((order) => {
      const orderDocRef = doc(db, "Orders", order.id);
      return updateDoc(orderDocRef, { queueNumber: order.queueNumber - 1 });
    });

    await Promise.all(updatePromises);

    console.log(`Order ${orderId} marked as completed, queue number removed, and remaining orders updated.`);
  } catch (error) {
    console.error(`Error updating order ${orderId} or adjusting queue numbers:`, error);
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
      console.error(`Error updating payment status for order ${orderId}:`, error);
    }
  };
  
  const renderOrderDetails = (order) => {
    return (
      <div key={order.id} className="order-item">
        <h3>
          {order.queueNumber !== null ? `Queue #${order.queueNumber} - ` : ""}
          Table {order.tableId}
        </h3>
  
        <ul>
          {order.items.map((item) => (
            <li key={item.menuId}>
              {item.name} (x{item.quantity}) - {item.price * item.quantity} THB
            </li>
          ))}
        </ul>
        <div className="order-total">Total: {order.total} THB</div>
        <div className="order-buttons">
  {/* ซ่อนปุ่ม Accept Order ถ้าสถานะเป็น "ชำระเงินแล้ว" */}
  {order.status !== "กำลังทำอาหาร" && order.status !== "รอชำระเงิน" && order.status !== "ชำระเงินแล้ว" && (
    <button
      className="accept-button"
      onClick={() => handleAcceptOrder(order.id)}
      disabled={order.status === "accepted"}
    >
      {order.status === "accepted" ? "Accepted" : "Accept Order"}
    </button>
  )}

  {order.status === "กำลังทำอาหาร" && (
    <button className="success-button" onClick={() => handleOrderSuccess(order.id)}>
      Order Success
    </button>
  )}

  {order.status === "รอชำระเงิน" && (
    <button className="payment-button" onClick={() => handlePaymentSuccess(order.id)}>
      ลูกค้าจ่ายเงินแล้ว
    </button>
  )}

  {/* แสดงปุ่ม Delete เฉพาะเมื่อสถานะเป็น "ชำระเงินแล้ว" */}
  {order.status === "ชำระเงินแล้ว" && (
    <button className="delete-button" onClick={() => handleDelete(order.id)}>
      Delete
    </button>
  )}

  {order.status === "รอชำระเงิน" && <span className="order-status completed">Order Complete!</span>}
</div>

        {order.status === "ชำระเงินแล้ว" && <div className="order-status paid">Payment Completed!</div>}
        <hr />
      </div>
    );
  };
  
  

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div className="kitchen">
      <h2>Order List</h2>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="orders-list">{orders.map(renderOrderDetails)}</div>
      )}
    </div>
  );
};

export default Kitchen;
