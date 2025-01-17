import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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
  const { tableId } = useParams(); // รับหมายเลขโต๊ะจาก URL
  const [tableData, setTableData] = useState(null); // เก็บข้อมูลโต๊ะ
  const [allMenus, setAllMenus] = useState([]); // เก็บเมนูทั้งหมด
  const [filteredMenu, setFilteredMenu] = useState([]); // เก็บเมนูที่กรองตามหมวดหมู่
  const [selectedCategory, setSelectedCategory] = useState("burger");
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลโต๊ะ
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

  // ดึงข้อมูลเมนูทั้งหมด
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

  // กรองเมนูเมื่อหมวดหมู่เปลี่ยน
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMenu(allMenus);
    } else {
      setFilteredMenu(
        allMenus.filter((item) => item.category === selectedCategory)
      );
    }
  }, [selectedCategory, allMenus]);

  if (isLoading) return <p>Loading menu items...</p>;

  return (
    <>
      <MenuBar />
      <div className="table-page">
        <div className="table-info">
          {/* แสดงหมายเลขโต๊ะและสถานะ */}
          {tableData ? (
            <>
              <h1>Table {tableData.table_number}</h1>
              {/* <p>Status: {tableData.status}</p> */}
            </>
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
            {/* <button
              onClick={() => setSelectedCategory("all")}
              className={`category-icon ${
                selectedCategory === "all" ? "active" : ""
              }`}
            >
              All
            </button> */}
          </div>

          {filteredMenu.length > 0 ? (
            <ul>
              {filteredMenu.map((item) => (
                <li key={item.id} className="menu-item">
                  <img
                    src={item.image}
                    alt={item.menu_name}
                    className="menu-image"
                  />
                  <div>
                    {item.menu_name} - {item.price} THB
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No menu items available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TablePage;
