import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Assuming your Firebase configuration is correct
import "./Kitchen.css"; // Make sure to style this page accordingly

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from Firebase in real-time
  useEffect(() => {
    const ordersRef = collection(db, "Orders");

    const unsubscribe = onSnapshot(
      ordersRef,
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

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Delete order by ID
  const handleDelete = async (orderId) => {
    try {
      const orderDocRef = doc(db, "Orders", orderId);
      await deleteDoc(orderDocRef);
      console.log(`Order ${orderId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
    }
  };

  // Render order details
  const renderOrderDetails = (order) => {
    return (
      <div key={order.id} className="order-item">
        <h3>Table {order.tableId}</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.menuId}>
              {item.name} (x{item.quantity}) - {item.price * item.quantity} THB
            </li>
          ))}
        </ul>
        <div className="order-total">Total: {order.total} THB</div>
        <button className="delete-button" onClick={() => handleDelete(order.id)}>
          Delete
        </button>
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
