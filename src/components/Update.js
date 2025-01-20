import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import MenuBar from "./MenuBar";
import {
  FaGlassMartiniAlt,
  FaHamburger,
  FaPizzaSlice,
  FaUtensils,
} from "react-icons/fa";
import "./TablePage.css";

const TablePage = () => {
  const { tableId } = useParams();
  const [tableData, setTableData] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("maincourse");
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const docRef = doc(db, "Tables", `table${tableId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTableData(docSnap.data());
        } else {
          console.error("No such table document!");
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchTableData();
  }, [tableId]);

  useEffect(() => {
    const fetchAllMenus = async () => {
      try {
        const categoryRef = collection(db, "Menus");
        const querySnapshot = await getDocs(categoryRef);
        const menuItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllMenus(menuItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching menus:", error);
        setIsLoading(false);
      }
    };

    fetchAllMenus();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMenu(allMenus);
    } else {
      setFilteredMenu(
        allMenus.filter((item) => item.category === selectedCategory)
      );
    }
  }, [selectedCategory, allMenus]);

  const handleAddToCart = (menuItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === menuItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...menuItem, quantity: 1 }];
      }
    });
  };

  const handleIncreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const [successMessage, setSuccessMessage] = useState(""); // state สำหรับข้อความสำเร็จ
  const [errorMessage, setErrorMessage] = useState(""); // state สำหรับข้อความข้อผิดพลาด

  const handleSubmitOrder = async () => {
    try {
      // Prepare order data
      const orderData = {
        tableId,
        items: cartItems.map((item) => ({
          menuId: item.id,
          name: item.menu_name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotalPrice(),
        timestamp: new Date(),
      };

      // Add order to Firestore
      await addDoc(collection(db, "Orders"), orderData);

      setCartItems([]);
      setSuccessMessage("ส่งรายการสำเร็จ"); // แสดงข้อความสำเร็จ
      setErrorMessage(""); // เคลียร์ข้อความข้อผิดพลาด
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order.");
      setErrorMessage("Failed to submit order."); // แสดงข้อความข้อผิดพลาด
      setSuccessMessage(""); // เคลียร์ข้อความสำเร็จ
    }
  };

  if (isLoading) return <p>Loading menu items...</p>;

  return (
    <>
      <MenuBar
        cartItemCount={calculateTotalQuantity()}
        toggleOrderSummary={() => setShowOrderSummary(!showOrderSummary)}
      />
      <div className="table-page">
        <div className="table-info">
          {tableData ? (
            <h1>Table {tableData.table_number}</h1>
          ) : (
            <p>Loading table information...</p>
          )}
        </div>

        <div className="menu">
          <h2>Menu</h2>
          <div className="category-buttons">
            <button
              onClick={() => setSelectedCategory("maincourse")}
              className={`category-icon ${
                selectedCategory === "maincourse" ? "active" : ""
              }`}
            >
              <FaUtensils size={30} />
            </button>
            <button
              onClick={() => setSelectedCategory("burger")}
              className={`category-icon ${
                selectedCategory === "burger" ? "active" : ""
              }`}
            >
              <FaHamburger size={30} />
            </button>
            <button
              onClick={() => setSelectedCategory("fastfood")}
              className={`category-icon ${
                selectedCategory === "fastfood" ? "active" : ""
              }`}
            >
              <FaPizzaSlice size={30} />
            </button>
            <button
              onClick={() => setSelectedCategory("drink")}
              className={`category-icon ${
                selectedCategory === "drink" ? "active" : ""
              }`}
            >
              <FaGlassMartiniAlt size={30} />
            </button>
          </div>

          {filteredMenu.length > 0 ? (
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-image">
                    <img
                      src={item.image_url || "default-image-url.png"}
                      alt={item.menu_name}
                    />
                  </div>
                  <div className="menu-details">
                    <h3>{item.menu_name}</h3>
                    <p>{item.price} THB</p>
                    <button onClick={() => handleAddToCart(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No menu items available.</p>
          )}
        </div>

        {showOrderSummary && (
          <div className="order-summary">
            <h2>รายการสั่งซื้อ</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span>{item.menu_name}</span>
                  <div className="order-controls">
                    <button onClick={() => handleDecreaseQuantity(item.id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleIncreaseQuantity(item.id)}>
                      +
                    </button>
                    <button onClick={() => handleRemoveItem(item.id)}>
                      ลบรายการ
                    </button>
                  </div>
                  <span>{item.price * item.quantity} บาท</span>
                </div>
              ))
            ) : (
              <p className="no_item_selected">เชิญเลือกเมนูที่ชอบได้เลยค่ะ.</p>
            )}
            <div className="order-summary-bottom">
                {/* Submit Order Button */}
                <button
                  onClick={handleSubmitOrder}
                  className="submit-order-button"
                  disabled={cartItems.length === 0} // Disable button if cart is empty
                >
                  ส่งรายการสั่งซื้อ
                </button>
                {successMessage && (
                  <p style={{ color: "green" }}>{successMessage}</p>
                )}{" "}
                {/* แสดงข้อความสำเร็จ */}
                {errorMessage && (
                  <p style={{ color: "red" }}>{errorMessage}</p>
                )}{" "}
                {/* แสดงข้อความข้อผิดพลาด */}
              <div className="total-price">
                รวม: {calculateTotalPrice()} บาท
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TablePage;
// import React, { useEffect, useState } from "react";
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "../firebaseConfig"; // Assuming your Firebase configuration is correct
// import "./Kitchen.css"; // Make sure to style this page accordingly

// const Kitchen = () => {
//   const [orders, setOrders] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch orders from Firebase in real-time
//   useEffect(() => {
//     const ordersRef = collection(db, "Orders");

//     const unsubscribe = onSnapshot(
//       ordersRef,
//       (querySnapshot) => {
//         const ordersList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setOrders(ordersList);
//         setIsLoading(false); // Stop loading when data is fetched
//       },
//       (error) => {
//         console.error("Error fetching orders:", error);
//         setIsLoading(false);
//       }
//     );

//     // Cleanup the listener when the component is unmounted
//     return () => unsubscribe();
//   }, []);

//   // Render order details
//   const renderOrderDetails = (order) => {
//     return (
//       <div key={order.id} className="order-item">
//         <h3>Table {order.tableId}</h3>
//         <ul>
//           {order.items.map((item) => (
//             <li key={item.menuId}>
//               {item.name} (x{item.quantity}) - {item.price * item.quantity} THB
//             </li>
//           ))}
//         </ul>
//         <div className="order-total">Total: {order.total} THB</div>
//         <hr />
//       </div>
//     );
//   };

//   if (isLoading) return <p>Loading orders...</p>;

//   return (
//     <div className="kitchen">
//       <h2>Order List</h2>
//       {orders.length === 0 ? (
//         <p>No orders yet</p>
//       ) : (
//         <div className="orders-list">
//           {orders.map(renderOrderDetails)}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Kitchen;
//MenuBar.css
//.body-menu-bar{
//   position: fixed;
//   top: 0;
//   width: 100%;
//   z-index: 1000;
//   background-color: #ffffff;
// }
// .menu-bar {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 10px;
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* เพิ่มเงา */
//   flex-wrap: wrap; /* ทำให้เนื้อหาเลื่อนลงในกรณีที่หน้าจอเล็ก */
// }

// .icon-button {
//   background: none;
//   border: none;
//   font-size: 24px;
//   color: #333;
//   cursor: pointer;
//   flex-shrink: 0; /* ป้องกันการบีบไอคอน */
//   margin: 0 10px; /* ระยะห่างระหว่างไอคอน */
// }

// .icon-container {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-wrap: wrap; /* ไอคอนจะเลื่อนลงในหน้าจอเล็ก */
//   gap: 10px; /* ระยะห่างระหว่างไอคอน */
// }


// .logo {
//   display: block;
//   margin: 0 auto;
//   height: 45px; /* ปรับขนาดของโลโก้ */
// }

// .cart-button {
//   font-size: 24px;
// }

// .category-button {
//   font-size: 24px;
// }

// /* เพิ่มเงาให้ปุ่ม */
// .icon-button:hover {
//   color: #ff0000;
//   transition: color 0.3s ease;
// }

// .table-id {
//   font-size: 18px;
//   font-weight: bold;
//   color: #333;
// }

// .cart-button {
//   position: relative;
// }

// .cart-badge {
//   position: absolute;
//   top: -5px;
//   right: -5px;
//   background-color: red;
//   color: white;
//   font-size: 12px;
//   width: 20px;
//   height: 20px;
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }

// import React, { useState, useEffect } from "react";
// import "./Banner.css";

// // อ้างอิงภาพแบบ dynamic import
// const images = [
//   require("../images/bannerBurger.png"),
//   require("../images/bannerMeat.png"),
//   require("../images/bannerCurry.png"),
// ];

// const Banner = () => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   // ฟังการเปลี่ยนแปลงขนาดหน้าจอ
//   useEffect(() => {
//     const handleResize = () => {
//       // คำนวณหรือปรับแต่งขนาดแบนเนอร์ตามความจำเป็นที่นี่
//       // เช่น การรีเฟรชภาพแบนเนอร์ให้พอดีกับขนาดใหม่ของหน้าจอ
//     };

//     // ฟังการเปลี่ยนแปลงขนาดหน้าจอ
//     window.addEventListener("resize", handleResize);

//     // ล้าง event listener เมื่อ component ถูกลบ
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//     }, 5000); // เลื่อนภาพทุก 5 วินาที

//     return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูกลบ
//   }, []);

//   return (
//     <div className="banner">
//       <div
//         className="slider"
//         style={{
//           transform: `translateX(-${currentImageIndex * 100}%)`,
//         }}
//       >
//         {images.map((image, index) => (
//           <img
//             key={index}
//             src={image}
//             alt={`Slide ${index + 1}`}
//             className="banner-image"
//           />
//         ))}
//       </div>
//       <div className="indicators">
//         {images.map((_, index) => (
//           <span
//             key={index}
//             className={`indicator ${index === currentImageIndex ? "active" : ""}`}
//           ></span>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Banner;

