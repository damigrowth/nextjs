"use client";

import { useEffect, useState, useTransition } from "react";
import ReactSlider from "react-slider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";

export default function RangeSlider({ iniMin, iniMax }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state from search parameters or use default values
  const getInitialMin = () => parseInt(searchParams.get("min")) || iniMin;
  const getInitialMax = () => parseInt(searchParams.get("max")) || iniMax;

  const [min, setMin] = useState(getInitialMin);
  const [max, setMax] = useState(getInitialMax);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMin(getInitialMin());
    setMax(getInitialMax());
  }, [searchParams]);

  // Helper function to update URL search parameters
  const updateSearchParams = (newMin, newMax) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("min", newMin);
    params.set("max", newMax);
    params.set("page", 1);

    startTransition(() => {
      router.push(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  // Debounced function to update search parameters
  const debouncedUpdateSearchParams = debounce(updateSearchParams, 300);

  // Function to handle slider changes
  const handleSliderChange = (values) => {
    const [newMin, newMax] = values;
    setMin(newMin);
    setMax(newMax);
  };

  // Function to handle after slider change
  const handleAfterChange = (values) => {
    const [newMin, newMax] = values;
    debouncedUpdateSearchParams(newMin, newMax);
  };

  const handleSlider = (e, type) => {
    const value = parseInt(e.target.value, 10);

    if (type === "min") {
      setMin(value);
      debouncedUpdateSearchParams(value, max);
    } else {
      setMax(value);
      debouncedUpdateSearchParams(min, value);
    }
  };

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className="card-body card-body px-0 pt-0"
    >
      <div className="widget-wrapper mb0 pr20">
        <div className="range-slider-style1">
          <div className="range-wrapper">
            <div className="price__range__box">
              <ReactSlider
                className="horizontal-slider"
                thumbClassName="example-thumb"
                trackClassName="example-track"
                value={[min, max]}
                min={iniMin}
                max={iniMax}
                minDistance={10}
                onChange={handleSliderChange}
                onAfterChange={handleAfterChange}
              />
            </div>
            <div className="d-flex gap-1 align-items-center pt-4">
              <input
                type="number"
                className="amount w-100"
                placeholder={`${iniMin}€`}
                min={iniMin}
                max={max}
                value={min}
                onChange={(e) => handleSlider(e, "min")}
              />
              <span className="fa-sharp fa-solid fa-minus mx-1 dark-color" />
              <input
                type="number"
                className="amount2 w-100"
                placeholder={`${iniMax}€`}
                min={min}
                max={iniMax}
                value={max}
                onChange={(e) => handleSlider(e, "max")}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <button
        onClick={() => setPriceRange(min, max)}
        className="done-btn ud-btn btn-thm drop_btn3"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button> */}
    </div>
  );
}
