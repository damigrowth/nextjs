import { isAuthenticated } from "@/lib/auth/authenticated";
import Link from "next/link";

export default async function Protected({ children, message }) {
  const { authenticated } = await isAuthenticated();

  if (authenticated === true) {
    return children;
  } else {
    if (message === undefined) {
      return null;
    } else {
      return (
        <div className="text-center pt30">
          <p>{message}</p>
          <Link href="/login" className="ud-btn btn-thm2">
            Σύνδεση
          </Link>
        </div>
      );
    }
  }
}
