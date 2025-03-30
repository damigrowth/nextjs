"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function Switch({ paramName, label, noHeader, id }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from search parameters or default to false
  const getInitialVerified = () => searchParams.has(paramName);
  const [isToggled, setIsToggled] = useState(getInitialVerified);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsToggled(getInitialVerified());
  }, [searchParams, paramName]);

  // Handler to update search parameters
  const handleSwitchChange = () => {
    const newVerified = !isToggled;
    setIsToggled(newVerified);

    const params = new URLSearchParams(searchParams.toString());
    if (newVerified) {
      params.set(paramName, "");
      params.set("page", 1);
    } else {
      params.delete(paramName);
    }
    const paramString = params.toString().replace(/=(&|$)/g, "$1");

    startTransition(() => {
      router.push(pathname + "?" + paramString, {
        scroll: false,
      });
    });
  };

  const switchContent = (
    <div className="switch-style1">
      <div className="form-check form-switch mb10">
        <input
          className="form-check-input mt-0"
          type="checkbox"
          id={id || `switch-${paramName}`}
          checked={isToggled}
          onChange={handleSwitchChange}
        />
        <label
          className="form-check-label mt-0"
          htmlFor={id || `switch-${paramName}`}
        >
          {label}
        </label>
      </div>
    </div>
  );

  if (noHeader) {
    return (
      <div data-pending={isPending ? "" : undefined} className="px-0 pt-0">
        {switchContent}
      </div>
    );
  }

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className="card-body card-body px-0 pt-0"
    >
      {switchContent}
    </div>
  );
}
