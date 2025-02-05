import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import MenuBar from "./MenuBar";
import { query, orderBy, limit } from "firebase/firestore";
import logo from "../images/and_logo.png";
import {
  FaGlassMartiniAlt,
  FaHamburger,
  FaPizzaSlice,
  FaUtensils,
} from "react-icons/fa";
import "./TablePage.css";
import Banner from "./Banner"; // เพิ่มการนำเข้า Banner Component

const TablePage = () => {
  const { tableId } = useParams();
  const [tableData, setTableData] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("maincourse");
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showInvoiceOrder, setShowInvoiceOrder] = useState();
  const [invoiceData, setInvoiceData] = useState([]); // เก็บข้อมูลใบแจ้งหนี้
  const [orderStatus, setOrderStatus] = useState(""); // เก็บสถานะออร์เดอร์
  // สร้าง state สำหรับเก็บรายการออเดอร์
  const [orders, setOrders] = useState([]);
  // สร้าง state สำหรับเก็บว่ากำลังขยายออเดอร์ไหน
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const ordersRef = collection(db, "Orders");
    const ordersQuery = query(ordersRef, orderBy("queueNumber", "asc"));

    // ฟังการเปลี่ยนแปลงแบบเรียลไทม์
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const fetchedOrders = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => order.tableId === tableId);
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, [tableId]);

  useEffect(() => {
    if (showInvoiceOrder) {
      const ordersRef = collection(db, "Orders");
      const ordersQuery = query(ordersRef, orderBy("timestamp", "asc")); // เรียงลำดับตามเวลา

      // ใช้ onSnapshot เพื่อฟังการเปลี่ยนแปลง
      const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
        const orders = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((order) => order.tableId === tableId); // กรองตาม tableId
        setInvoiceData(orders); // อัปเดตข้อมูลใบแจ้งหนี้
      });

      // Cleanup listener เมื่อ component ถูก unmount
      return () => unsubscribe();
    }
  }, [showInvoiceOrder, tableId]); // ฟังการเปลี่ยนแปลงเฉพาะเมื่อ showInvoiceOrder หรือ tableId เปลี่ยน

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
  const [isSubmitting, setIsSubmitting] = useState(false); // ป้องกันการกดซ้ำ

  const handleSubmitOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const ordersRef = collection(db, "Orders");

      const latestOrderQuery = query(
        ordersRef,
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const latestOrderSnapshot = await getDocs(latestOrderQuery);

      let latestQueueNumber = 0;
      if (!latestOrderSnapshot.empty) {
        const latestOrderData = latestOrderSnapshot.docs[0].data();
        latestQueueNumber = Number(latestOrderData.queueNumber) || 0; // แปลงเป็นตัวเลข
      }

      const newQueueNumber = latestQueueNumber + 1;

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
        queueNumber: newQueueNumber,
        status: "รอคิว",
      };

      await addDoc(ordersRef, orderData);

      setCartItems([]);
      setSuccessMessage("ส่งรายการสำเร็จ");
      setErrorMessage("");
    } catch (error) {
      console.error("Error submitting order:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการส่งออเดอร์");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchOrderStatus = async () => {
      const ordersRef = collection(db, "Orders");
      const ordersQuery = query(ordersRef, orderBy("queueNumber", "asc"));

      const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // หาคำสั่งซื้อที่ตรงกับ tableId
        const tableOrder = orders.find((order) => order.tableId === tableId);
        if (tableOrder) {
          // ตรวจสอบสถานะของออเดอร์
          if (tableOrder.status === "ชำระเงินแล้ว") {
            setOrderStatus("ชำระเงินแล้ว");
          } else if (tableOrder.status === "รอชำระเงิน") {
            setOrderStatus("รอชำระเงิน");
          } else if (tableOrder.status === "กำลังทำอาหาร") {
            setOrderStatus("กำลังทำอาหาร");
          } else {
            // ถ้าสถานะไม่ตรงกับเงื่อนไขด้านบน ให้ถือว่า "รอคิว"
            setOrderStatus("รอคิว");
          }
        }
      });

      return () => unsubscribe(); // Cleanup เมื่อ component ถูก unmount
    };

    fetchOrderStatus();
  }, [tableId]); // useEffect นี้จะทำงานเมื่อ tableId เปลี่ยนแปลง

  if (isLoading) return <p>Loading menu items...</p>;

  return (
    <>
      <MenuBar
        cartItemCount={calculateTotalQuantity()}
        toggleOrderSummary={() => {
          setShowOrderSummary((prev) => {
            if (!prev) setShowInvoiceOrder(false);
            return !prev;
          });
        }}
        invoiceOrder={() => {
          setShowInvoiceOrder((prev) => {
            if (!prev) setShowOrderSummary(false);
            return !prev;
          });
        }}
      />

      <div className="table-page">
        <div className="table-info">
          {tableData ? (
            <div>
              <h1>โต๊ะหมายเลข {tableData.table_number}</h1>
              <div className="order-status-bar">
                <h2>คำสั่งซื้อของโต๊ะ {tableId}</h2>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className={`order-card ${
                        expandedOrder === order.id ? "expanded" : ""
                      }`}
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )
                      }
                    >
                      <h3>
                        {order.status === "รอชำระเงิน" ||
                        order.status === "ชำระเงินแล้ว"
                          ? "ออเดอร์นี้เสร็จสิ้นแล้ว"
                          : `ออเดอร์ #${order.queueNumber}`}
                      </h3>
                      <p>สถานะ: {order.status}</p>

                      {expandedOrder === order.id && (
                        <div className="order-details">
                          <ul>
                            {order.items.map((item, index) => (
                              <h4 key={index}>
                                {item.name} {item.quantity} ชิ้น
                              </h4>
                            ))}
                          </ul>
                          <p>รวม: {order.total} บาท</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>ยังไม่มีออเดอร์</p>
                )}
              </div>

              <Banner />
            </div>
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
        {showInvoiceOrder && (
          <div className="invoice-order">
            {/* เพิ่มโลโก้และชื่อร้าน */}
            <div className="invoice-header">
              <img src={logo} alt="Logo" className="invoice-logo" />
              <h1>Snack & Grill's</h1>
            </div>
            <h2>ใบแจ้งหนี้สำหรับโต๊ะ {tableId}</h2>
            {invoiceData.length > 0 ? (
              <div>
                {invoiceData.map((order, orderIndex) => (
                  <div key={order.id} className="invoice-item">
                    <h3>คำสั่งซื้อครั้งที่ {orderIndex + 1}</h3>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        <span>{item.name}</span> -
                        <span>{item.quantity} ชิ้น</span> -
                        <span>{item.price * item.quantity} บาท</span>
                      </div>
                    ))}
                    <p>รวม: {order.total} บาท</p>
                  </div>
                ))}
                {/* รวมยอดคำสั่งซื้อทุกรอบ */}
                <div className="invoice-total">
                  <h3>รวมคำสั่งซื้อทั้งหมด</h3>
                  <p>
                    {invoiceData.reduce(
                      (grandTotal, order) => grandTotal + order.total,
                      0
                    )}{" "}
                    บาท
                  </p>
                  {/* คำนวณ VAT 7% */}
                  <p>
                    VAT 7%:{" "}
                    {(
                      invoiceData.reduce(
                        (grandTotal, order) => grandTotal + order.total,
                        0
                      ) * 0.07
                    ).toFixed(2)}{" "}
                    บาท
                  </p>
                  {/* รวมยอดรวม (รวม VAT) */}
                  <p>
                    ยอดรวมสุทธิ:{" "}
                    {(
                      invoiceData.reduce(
                        (grandTotal, order) => grandTotal + order.total,
                        0
                      ) * 1.07
                    ).toFixed(2)}{" "}
                    บาท
                  </p>
                </div>
                {/* เพิ่มวิธีการชำระเงิน */}
                <div className="payment-method">
                  <p>วิธีการชำระเงิน: เงินสด</p>
                </div>
              </div>
            ) : (
              <p>ไม่มีคำสั่งซื้อ</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TablePage;
