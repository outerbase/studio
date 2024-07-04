"use client";
import { useEffect, useState } from "react";

function calcuateFromExpire(expiredAt: number) {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiredAt - now);
}

export default function TemporarySession({ expiredAt }: { expiredAt: number }) {
  const [countdownInSec, setCountdownInSec] = useState(
    calcuateFromExpire(expiredAt)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdownInSec(calcuateFromExpire(expiredAt));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiredAt, setCountdownInSec]);

  const min = Math.floor(countdownInSec / 60);
  const sec = countdownInSec % 60;

  return (
    <div className="border-b pb-1">
      <div className="flex gap-0.5 mb-1">
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {Math.floor(min / 10)}
        </span>
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {min % 10}
        </span>
        <span className="p-1 rounded  mono text-center ">:</span>
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {Math.floor(sec / 10)}
        </span>
        <span className="p-1 px-2 rounded  mono text-center bg-black text-white">
          {sec % 10}
        </span>
      </div>
      <p className="text-xs">Remaining of your temporary session</p>
    </div>
  );
}
