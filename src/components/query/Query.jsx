import { getData } from "@/lib/client/operations";

export default async function Query({ query, variables, children }) {
  try {
    const data = await getData(query, variables);
    return children(data);
  } catch (error) {
    return <p>Error: {error.message}</p>;
  }
}
