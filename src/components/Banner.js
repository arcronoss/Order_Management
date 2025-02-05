import React, { useState, useEffect } from "react";
import "./Banner.css";

// อ้างอิงภาพแบบ dynamic import
const images = [
  require("../images/bannerBurger.png"),
  require("../images/bannerMeat.png"),
  require("../images/bannerCurry.png"),
];

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // รีเฟรชแบนเนอร์ 1 รอบเมื่อเว็บไซต์เปิดครั้งแรก
  useEffect(() => {
    // ทำการเลื่อนแบนเนอร์ไปยังภาพถัดไป 1 รอบ
    const timeout = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 100); // รอ 100ms เพื่อให้เว็บโหลดเสร็จก่อนแล้วค่อยทำการเลื่อน

    return () => clearTimeout(timeout); // ล้าง timeout เมื่อ component ถูกลบ
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // เลื่อนภาพทุก 5 วินาที

    return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูกลบ
  }, []);

  return (
    <div className="banner">
      <div
        className="slider"
        style={{
          transform: `translateX(-${currentImageIndex * 100}%)`,
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className="banner-image"
          />
        ))}
      </div>
      <div className="indicators">
        {images.map((_, index) => (
          <span
            key={index}
            className={`indicator ${
              index === currentImageIndex ? "active" : ""
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Banner;
