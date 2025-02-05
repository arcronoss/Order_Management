import { useState } from "react";

const OrderStatusBar = ({ tableId, orders }) => {
  const [showAllOrders, setShowAllOrders] = useState(false);

  if (!orders || orders.length === 0) {
    return <p>ยังไม่มีออเดอร์</p>;
  }

  return (
    <div className="order-status-bar p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-bold">คำสั่งซื้อของโต๊ะ {tableId}</h2>

      {/* แสดงออเดอร์แรก */}
      <div className="order-card p-3 border-b">
        <h3 className="text-md font-semibold">
          {orders[0].status === "รอชำระเงิน" || orders[0].status === "ชำระเงินแล้ว"
            ? "ออเดอร์นี้เสร็จสิ้นแล้ว"
            : `ออเดอร์ #${orders[0].queueNumber}`}
        </h3>
        <p className="text-sm">สถานะ: {orders[0].status}</p>
      </div>

      {/* ปุ่มสำหรับเปิด/ปิดการแสดงผลรายการที่เหลือ */}
      {orders.length > 1 && (
        <>
          <button
            className="mt-2 p-2 bg-blue-500 text-white rounded-md w-full"
            onClick={() => setShowAllOrders(!showAllOrders)}
          >
            {showAllOrders ? "ซ่อนออเดอร์ทั้งหมด" : "ดูออเดอร์ทั้งหมด"}
          </button>

          {showAllOrders && (
            <div className="dropdown-orders mt-2">
              {orders.slice(1).map((order) => (
                <div key={order.id} className="order-card p-3 border-b">
                  <h3 className="text-md font-semibold">{`ออเดอร์ #${order.queueNumber}`}</h3>
                  <p className="text-sm">สถานะ: {order.status}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderStatusBar;
