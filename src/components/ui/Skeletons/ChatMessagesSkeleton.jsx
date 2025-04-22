import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ChatMessagesSkeleton() {
  const skeletonMessages = Array(3).fill(null);

  return (
    <ul className="chatting_content">
      {skeletonMessages.map((_, index) => {
        const isSent = index % 2 === 0;

        return (
          <li
            key={index}
            className={`${isSent ? "reply float-end" : "sent float-start"}`}
            data-msg-index={index}
          >
            <div
              className={`d-flex align-items-center mb10 ${
                isSent ? "justify-content-end" : ""
              }`}
            >
              {!isSent && (
                <div className="mr10 align-self-start">
                  <Skeleton borderRadius={15} width={50} height={50} />
                </div>
              )}

              <div className={`title fz15 ${isSent ? "text-end" : ""}`}>
                {isSent ? (
                  <>
                    <small className="d-flex ml5">
                      <Skeleton width={40} />
                      <Skeleton width={30} className="ml5" />{" "}
                    </small>
                  </>
                ) : (
                  <>
                    <small className="d-flex ml5">
                      <Skeleton width={70} />
                      <Skeleton width={30} className="ml5" />{" "}
                    </small>
                  </>
                )}
              </div>

              {isSent && (
                <div className="ml10 align-self-end">
                  <Skeleton borderRadius={15} width={50} height={50} />
                </div>
              )}
            </div>

            {isSent ? (
              <Skeleton height={60} width={250} borderRadius={15} />
            ) : (
              <Skeleton height={60} width={450} borderRadius={15} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
