import React from "react";

function Error({ statusCode }) {
  return (
    <div>
      <h1>
        {statusCode ? `Error ${statusCode}` : "An error occurred on the client"}
      </h1>
      <p>Something went wrong, please try again later.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
