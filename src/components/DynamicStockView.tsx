// src/components/DynamicStockView.tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";

interface DataPoint {
  time: string;
  price: number;
  secondaryPrice: number;
  volume: number;
}

const DynamicStockView: React.FC = () => {
  const { toast } = useToast();
  
  const generateData = (): DataPoint[] => {
    const now = new Date();
    return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now.getTime() - (19 - i) * 1000).toLocaleTimeString(),
      price: 100 + Math.random() * 10,
      secondaryPrice: 95 + Math.random() * 8,
      volume: Math.random() * 1000
    }));
  };

  const [data, setData] = useState<DataPoint[]>(generateData());

  useEffect(() => {
    toast({
      title: "Welcome to StockVision",
      description: "Real-time market data visualization at your fingertips",
      duration: 6000
    });

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastPrice = prevData[prevData.length - 1].price;
        newData.push({
          time: new Date().toLocaleTimeString(),
          price: lastPrice + (Math.random() - 0.5) * 2,
          secondaryPrice: lastPrice * 0.95 + (Math.random() - 0.5) * 2,
          volume: Math.random() * 1000
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-6 bg-[#0a1929] rounded-lg shadow-2xl">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: '#8f9faa', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              tick={{ fill: '#8f9faa', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 25, 41, 0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#00f2fe"
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="secondaryPrice"
              stroke="#ff0844"
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-[rgba(0,242,254,0.1)] rounded-xl border border-[rgba(0,242,254,0.2)]">
          <h3 className="text-sm font-semibold text-[#8f9faa] mb-2">Primary Index</h3>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-[#00f2fe]">
              ${data[data.length - 1].price.toFixed(2)}
            </p>
            <span className="ml-2 text-sm text-[#00f2fe]/70">
              +${(Math.random() * 2).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-[rgba(255,8,68,0.1)] rounded-xl border border-[rgba(255,8,68,0.2)]">
          <h3 className="text-sm font-semibold text-[#8f9faa] mb-2">Secondary Index</h3>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-[#ff0844]">
              ${data[data.length - 1].secondaryPrice.toFixed(2)}
            </p>
            <span className="ml-2 text-sm text-[#ff0844]/70">
              -${(Math.random() * 2).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicStockView;