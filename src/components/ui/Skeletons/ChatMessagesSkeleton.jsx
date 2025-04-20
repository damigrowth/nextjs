import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ChatMessagesSkeleton() {
  // Create an array to generate skeleton messages
  const skeletonMessages = Array(3).fill(null);

  return (
    <ul className="chatting_content">
      {skeletonMessages.map((_, index) => {
        // Alternate between sent and received messages for visual variety
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
                  {/* Skeleton for avatar */}
                  <Skeleton borderRadius={15} width={50} height={50} />
                </div>
              )}

              <div className={`title fz15 ${isSent ? "text-end" : ""}`}>
                {isSent ? (
                  <>
                    {/* Time placeholder */}
                    <small className="d-flex ml5">
                      <Skeleton width={40} />
                      <Skeleton width={30} className="ml5" />{" "}
                      {/* Time placeholder */}
                    </small>
                  </>
                ) : (
                  <>
                    {/* Name placeholder */}

                    <small className="d-flex ml5">
                      <Skeleton width={70} />
                      <Skeleton width={30} className="ml5" />{" "}
                      {/* Time placeholder */}
                    </small>
                  </>
                )}
              </div>

              {isSent && (
                <div className="ml10 align-self-end">
                  {/* Skeleton for avatar */}
                  <Skeleton borderRadius={15} width={50} height={50} />
                </div>
              )}
            </div>

            {/* Message content placeholder */}
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

//  {new Array(6).fill().map((_, i) => (
//           <div key={i}>
//             <Skeleton
//               count={1}
//               height={232}
//               borderRadius={4}
//               style={{ marginBottom: "30px" }}
//             />
//           </div>
//         ))}

// import React from "react";

// export default function ChatMessagesSkeleton() {
//   {
//     new Array(6).fill().map((_, index) => (
//       <li
//         key={index}
//         className={`${isSent ? "reply float-end" : "sent float-start"} ${
//           isOptimistic ? "opacity-75" : ""
//         }`}
//         data-msg-index={index}
//       >
//         <div
//           className={`d-flex align-items-center mb15 ${
//             isSent ? "justify-content-end" : ""
//           }`}
//         >
//           <div className="mr10 align-self-start">
//             {/* <UserImage
//               width={50}
//               height={50}
//               image={authorImage}
//               firstName={authorFirstName}
//               lastName={authorLastName}
//               displayName={authorDisplayName}
//               hideDisplayName={true}
//             /> */}
//           </div>
//           <div className={`title fz15 ${isSent ? "text-end" : ""}`}>
//             {isSent ? (
//               <>
//                 <small className="mr10">
//                   {isOptimistic
//                     ? msg.status === "sending"
//                       ? "Sending..."
//                       : msg.status === "pending"
//                       ? "Pending..."
//                       : "Failed"
//                     : timeAgoText}
//                 </small>{" "}
//                 {/* {authorDisplayName}{" "} */}
//                 Me{" "}
//               </>
//             ) : (
//               <>
//                 {authorDisplayName}{" "}
//                 <small className="ml10">{timeAgoText}</small>{" "}
//               </>
//             )}
//           </div>
//           {isSent && (
//             <div className="ml10 align-self-end">
//               <UserImage
//                 width={50}
//                 height={50}
//                 image={currentUserImage}
//                 firstName={currentUser?.firstName}
//                 lastName={currentUser?.lastName}
//                 displayName={currentUser?.displayName}
//                 hideDisplayName={true}
//               />
//             </div>
//           )}
//         </div>
//         <p
//           className={`fit ${isSent ? "message-sent" : "message-received"} ${
//             hasError ? "text-danger" : ""
//           }`}
//         >
//           {msg.content}
//           {hasError && (
//             <small className="d-block mt-1 text-danger">
//               Error: {msg.error || "Failed to send"}
//             </small>
//           )}
//         </p>
//       </li>
//     ));
//   }
// }
