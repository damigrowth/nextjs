"use client";

export default function ErrorBoundary({ error }) {
  return <div>Error: {error.message}</div>;
}
