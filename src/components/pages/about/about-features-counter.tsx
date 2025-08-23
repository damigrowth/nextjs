import React from 'react';

type Props = {};

const stats = [
  {
    number: "600",
    label: "Υπηρεσίες"
  },
  {
    number: "180",
    label: "Κατηγορίες Υπηρεσιών" 
  },
  {
    number: "180",
    label: "Επαγγελματικά Προφίλ"
  },
  {
    number: "100",
    label: "Θετικές Αξιολογήσεις"
  }
];

export default function FeaturesCounterAbout({}: Props) {
  return (
    <section className="pb-0 pt-16">
      <div className="max-w-3xl mx-auto border-b border-gray-200 pb-16 px-4 lg:px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="transition-all duration-300">
              <div className="flex justify-center items-baseline mb-2">
                <span className="text-gray-800 font-bold text-3xl leading-10">
                  {stat.number}
                </span>
                <span className="text-gray-800 font-bold text-2xl ml-1">+</span>
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
