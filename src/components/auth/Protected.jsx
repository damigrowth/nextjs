import { getUserMe } from "@/lib/auth/user";
import Link from "next/link";

export default async function Protected({ children, message }) {
  const user = await getUserMe();
  const authenticated = user.ok;

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
