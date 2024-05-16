import useSWR from "swr";

export const fetchSWR = (name, url) => {
  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, isLoading } = useSWR(
    `http://167.99.244.34:1337/api/${url}`,
    fetcher
  );

  return {
    [name]: data,
    isError: error,
    isLoading,
  };
};
