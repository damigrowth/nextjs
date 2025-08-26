import React from 'react';

type CounterData = {
  end: number;
  label: string;
  text: string;
};

type Props = {
  data: CounterData[];
};

export default function StatisticsCounter({ data }: Props) {
  return (
    <section className="pb-0 pt-16">
      <div className="max-w-3xl mx-auto border-b border-gray-200 pb-16 px-4 lg:px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {data.map((stat, index) => (
            <div key={index} className="transition-all duration-300">
              <div className="flex justify-center items-baseline mb-2">
                <span className="text-gray-800 font-bold text-3xl leading-10">
                  {stat.end}
                </span>
                <span className="text-gray-800 font-bold text-2xl ml-1">{stat.text}</span>
              </div>
              <p className="text-gray-600 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}