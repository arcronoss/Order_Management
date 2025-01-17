// import React, { useEffect, useState } from 'react';
// import { collection, getDocs, query } from 'firebase/firestore';
// import { db } from '../firebaseConfig'; // ตั้งค่าการเชื่อมต่อ Firebase
// import { Timestamp } from 'firebase/firestore'; // นำเข้า Timestamp หากใช้

// const KitchenOrders = () => {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const q = query(collection(db, 'Orders')); // ดึงข้อมูลจาก collection 'Orders'
//         const querySnapshot = await getDocs(q);

//         const ordersList = querySnapshot.docs.map((doc) => {
//           const orderData = doc.data();
          
//           // แปลง Timestamp เป็น Date ถ้า orderTime เป็น Timestamp
//           const orderTime = orderData.orderTime instanceof Timestamp 
//             ? orderData.orderTime.toDate().toLocaleString() // แปลงเป็นวันที่ที่อ่านได้
//             : 'Invalid Date';

//           return {
//             id: doc.id,
//             tableId: orderData.tableId,
//             orderTime,
//             items: orderData.items,
//           };
//         });

//         setOrders(ordersList);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//       }
//     };

//     fetchOrders();
//   }, []);

//   if (orders.length === 0) return <p>No orders yet.</p>;

//   return (
//     <div>
//       <h1>Orders</h1>
//       {orders.map((order) => (
//         <div key={order.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
//           <h2>Table {order.tableId}</h2>
//           <p>Order Time: {order.orderTime}</p>
//           <h3>Items:</h3>
//           <ul>
//             {order.items.map((item, index) => (
//               <li key={index}>
//                 {item.menu_name} - {item.price} บาท
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default KitchenOrders;
//-----------------------------------------------------------------
// import React, { useEffect, useState } from 'react';
// import { collection, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebaseConfig'; // ตั้งค่าการเชื่อมต่อ Firebase
// import { Timestamp } from 'firebase/firestore'; // นำเข้า Timestamp

// const KitchenOrders = () => {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, 'Orders'), (querySnapshot) => {
//       const ordersList = querySnapshot.docs.map((doc) => {
//         const orderData = doc.data();
        
//         // แปลง Timestamp เป็น Date ถ้า orderTime เป็น Timestamp
//         const orderTime = orderData.orderTime instanceof Timestamp 
//           ? orderData.orderTime.toDate().toLocaleString() // แปลงเป็นวันที่ที่อ่านได้
//           : 'Invalid Date';

//         return {
//           id: doc.id,
//           tableId: orderData.tableId,
//           orderTime,
//           items: orderData.items,
//         };
//       });

//       setOrders(ordersList); // อัปเดตข้อมูลใน state
//     });

//     // คืนค่า unsubscribe เมื่อ component ถูกทำลาย
//     return () => unsubscribe();
//   }, []);

//   if (orders.length === 0) return <p>Kitchen_Management No orders yet.</p>;

//   return (
//     <div>
//       <h1>Orders</h1>
//       {orders.map((order) => (
//         <div key={order.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
//           <h2>Table {order.tableId}</h2>
//           <p>Order Time: {order.orderTime}</p>
//           <h3>Items:</h3>
//           <ul>
//             {order.items.map((item, index) => (
//               <li key={index}>
//                 {item.menu_name} - {item.price} บาท
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default KitchenOrders;
//------------------------------------------------------------------------
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../firebaseConfig'; // ตั้งค่า Firebase Firestore
// import './TablePage.css';
// import stirFriedBlueCrabImage from '../images/Stir_fried_blue_crab.webp';
// import friedRiceImage from '../images/fried_rice.webp';

// const TablePage = () => {
//     const { tableId } = useParams(); // ดึง tableId จาก URL
//     const [tableData, setTableData] = useState(null);
//     const [menu, setMenu] = useState([]); // เมนูที่สามารถเลือกสั่งได้
//     const [orderItems, setOrderItems] = useState([]); // รายการอาหารที่ลูกค้าสั่ง

//     useEffect(() => {
//         const fetchTableData = async () => {
//             try {
//                 const docRef = doc(db, 'Tables', `table${tableId}`);
//                 const docSnap = await getDoc(docRef);

//                 if (docSnap.exists()) {
//                     setTableData(docSnap.data());
//                 } else {
//                     console.log('No such document!');
//                 }
//             } catch (error) {
//                 console.error('Error fetching table data:', error);
//             }
//         };

//         const fetchMenu = async () => {
//             try {
//                 const menuSnapshot = await getDocs(collection(db, 'Menus'));
//                 const menuData = menuSnapshot.docs.map(doc => doc.data());
//                 setMenu(
//                     menuData.map((item) => ({
//                         ...item,
//                         image:
//                             item.menu_name === 'ผัดปูม้า'
//                                 ? stirFriedBlueCrabImage
//                                 : item.menu_name === 'ข้าวผัด'
//                                 ? friedRiceImage
//                                 : null, // กำหนดภาพตามชื่อเมนู
//                     }))
//                 );
//             } catch (error) {
//                 console.error('Error fetching menu:', error);
//             }
//         };

//         fetchTableData();
//         fetchMenu();
//     }, [tableId]);

//     const handleAddToOrder = (item) => {
//         setOrderItems((prevOrderItems) => {
//             const existingItem = prevOrderItems.find((orderItem) => orderItem.menu_name === item.menu_name);
//             if (existingItem) {
//                 return prevOrderItems.map((orderItem) =>
//                     orderItem.menu_name === item.menu_name
//                         ? { ...orderItem, quantity: orderItem.quantity + 1 }
//                         : orderItem
//                 );
//             } else {
//                 return [...prevOrderItems, { ...item, quantity: 1 }];
//             }
//         });
//     };

//     const handleIncreaseQuantity = (itemName) => {
//         setOrderItems((prevOrderItems) =>
//             prevOrderItems.map((item) =>
//                 item.menu_name === itemName ? { ...item, quantity: item.quantity + 1 } : item
//             )
//         );
//     };

//     const handleDecreaseQuantity = (itemName) => {
//         setOrderItems((prevOrderItems) =>
//             prevOrderItems.map((item) =>
//                 item.menu_name === itemName && item.quantity > 1
//                     ? { ...item, quantity: item.quantity - 1 }
//                     : item
//             )
//         );
//     };

//     const handleRemoveItem = (itemName) => {
//         setOrderItems((prevOrderItems) => prevOrderItems.filter((item) => item.menu_name !== itemName));
//     };

//     const handlePlaceOrder = async () => {
//         try {
//             const orderData = {
//                 tableId,
//                 orderTime: serverTimestamp(),
//                 items: orderItems,
//             };

//             const docRef = await addDoc(collection(db, 'Orders'), orderData);
//             console.log('Order placed with ID:', docRef.id);

//             setOrderItems([]);
//         } catch (error) {
//             console.error('Error placing order:', error);
//         }
//     };

//     if (!tableData) return <p>Loading...</p>;

//     return (
//         <div className="table-page">
//             <div className="table-info">
//                 <h1>Table {tableData.table_number}</h1>
//                 <p>Status: {tableData.status}</p>
//             </div>

//             <div className="menu">
//                 <h2>Menu</h2>
//                 {menu.length > 0 ? (
//                     <ul>
//                         {menu.map((item, index) => (
//                             <li key={index} className="menu-item">
//                                 <img src={item.image} alt={item.menu_name} className="menu-image" />
//                                 <div>
//                                     {item.menu_name} - {item.price} THB
//                                 </div>
//                                 <button onClick={() => handleAddToOrder(item)}>Add to Order</button>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p>No menu items available.</p>
//                 )}
//             </div>

//             <div className="order-summary">
//                 <h2>Order Summary</h2>
//                 {orderItems.length > 0 ? (
//                     <ul>
//                         {orderItems.map((item, index) => (
//                             <li key={index} className="order-item">
//                                 <div className="order-details">
//                                     <span>{item.menu_name} - {item.price} THB</span>
//                                     <span> x {item.quantity}</span>
//                                 </div>
//                                 <div className="order-controls">
//                                     <button onClick={() => handleIncreaseQuantity(item.menu_name)}>+</button>
//                                     <button onClick={() => handleDecreaseQuantity(item.menu_name)}>-</button>
//                                     <button onClick={() => handleRemoveItem(item.menu_name)}>Remove</button>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p>No items selected.</p>
//                 )}
//                 <button onClick={handlePlaceOrder} disabled={orderItems.length === 0}>
//                     Place Order
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default TablePage;
//--------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // ให้ใช้การเชื่อมต่อ Firestore ของคุณ
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import './Kitchen.css'; // นำเข้าไฟล์ CSS ที่สร้างขึ้น

const Kitchen = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // ใช้ onSnapshot แทน getDocs เพื่อดึงข้อมูลเรียลไทม์
        const orderQuery = query(collection(db, 'Orders'), orderBy('orderTime', 'asc'));
        
        const unsubscribe = onSnapshot(orderQuery, (orderSnapshot) => {
            const orderList = orderSnapshot.docs.map(doc => doc.data());
            setOrders(orderList); // อัพเดทข้อมูลคำสั่งซื้อใน state
        }, (error) => {
            console.error('Error fetching orders:', error);
        });

        // คืนค่าฟังก์ชัน unsubscribe เพื่อหยุดการฟังข้อมูลเมื่อคอมโพเนนต์ถูกทำลาย
        return () => unsubscribe();
    }, []); // จะทำงานเมื่อคอมโพเนนต์ถูกโหลด

    const handlePrepareOrder = (orderId) => {
        // ฟังก์ชันจัดการเตรียมคำสั่งซื้อ
        console.log('Preparing order', orderId);
    };

    return (
        <div className="kitchen-background">
            <div className="kitchen-header">Kitchen Orders</div>
            <div className="kitchen-order-list">
                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className="kitchen-order-item">
                            <div>
                                <span>Table {order.tableId}</span>
                                <div>{order.items.map(item => (
                                    <div key={item.menu_name}>
                                        {item.menu_name} x {item.quantity}
                                    </div>
                                ))}</div>
                            </div>
                            <div className="kitchen-time">
                                {/* แปลงเวลา timestamp เป็นเวลาแบบ readable */}
                                {new Date(order.orderTime.seconds * 1000).toLocaleTimeString()}
                            </div>
                            <button 
                                className="kitchen-button" 
                                onClick={() => handlePrepareOrder(order.tableId)}>
                                Prepare
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No orders yet.</p>
                )}
            </div>
        </div>
    );
};

export default Kitchen;

