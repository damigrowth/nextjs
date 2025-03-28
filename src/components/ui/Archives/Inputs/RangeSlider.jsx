"use client";

import { useEffect, useState, useTransition } from "react";
import ReactSlider from "react-slider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";

export default function RangeSlider({ iniMin, iniMax, type = "price" }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state from search parameters or use default values
  const getInitialMin = () => parseInt(searchParams.get(type === "price" ? "min" : "hourly_min")) || iniMin;
  const getInitialMax = () => parseInt(searchParams.get(type === "price" ? "max" : "hourly_max")) || iniMax;

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
    params.set(type === "price" ? "min" : "hourly_min", newMin);
    params.set(type === "price" ? "max" : "hourly_max", newMax);
    params.set("page", 1);

    startTransition(() => {
      router.push(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  // Debounced function to update search parameters
  const debouncedUpdateSearchParams = debounce(updateSearchParams, 300);

  // Function to handle slider changes
  const handleSliderChange = (value, index) => {
    const [newMin, newMax] = value;
    setMin(newMin);
    setMax(newMax);
  };

  // Function to handle after slider change
  const handleAfterChange = (value) => {
    const [newMin, newMax] = value;
    // If max is 1000 for price or 100 for hourly, set it to show all values above
    const finalMax = type === "price" 
      ? (newMax === 1000 ? 100000 : newMax)
      : (newMax === 100 ? 10000 : newMax);
    debouncedUpdateSearchParams(newMin, finalMax);
  };

  const handleSlider = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === "min") {
      setMin(value);
      debouncedUpdateSearchParams(value, max);
    } else {
      // If max is 1000 for price or 100 for hourly, set it to show all values above
      const finalMax = this.type === "price"
        ? (value === 1000 ? 100000 : value)
        : (value === 100 ? 10000 : value);
      setMax(value);
      debouncedUpdateSearchParams(min, finalMax);
    }
  };

  // Function to format the display value
  const formatDisplayValue = (value) => {
    if (type === "price") {
      return value === 100000 ? "1000+" : value;
    } else {
      return value === 10000 ? "100+" : value;
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
                placeholder={`${iniMin}${type === "price" ? "€" : "€/ώρα"}`}
                min={iniMin}
                max={max}
                value={min}
                onChange={(e) => handleSlider(e, "min")}
              />
              <span className="fa-sharp fa-solid fa-minus mx-1 dark-color" />
              <input
                type="text"
                className="amount2 w-100"
                placeholder={`${iniMax}${type === "price" ? "€" : "€/ώρα"}`}
                min={min}
                max={iniMax}
                value={formatDisplayValue(max)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (type === "price" && value === "1000+") {
                    handleSlider({ target: { value: "1000" } }, "max");
                  } else if (type === "hourly" && value === "100+") {
                    handleSlider({ target: { value: "100" } }, "max");
                  } else {
                    handleSlider({ target: { value } }, "max");
                  }
                }}
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
