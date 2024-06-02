import { getData } from "../api";
import { getUser } from "../user/user";

export async function getFreelancerId() {
  const user = await getUser();
  const id = user.freelancer.id;
  return id;
}

export async function getFreelancer(query) {
  const freelancerId = await getFreelancerId();

  let url = ``;

  if (query === "basic") {
    url = `freelancers/${freelancerId}?fields[0]=firstName&fields[1]=lastName`;
  } else {
    url = `freelancers/${freelancerId}?populate=*`;
  }

  const data = await getData(url);

  return data;
}
