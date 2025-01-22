import ProjectCard1 from "@/components/card/ProjectCard1";

// FreelancersTab.jsx (Server Component)
export function FreelancersTab({ freelancers }) {
  return (
    <div className="row">
      {freelancers.slice(0, 6).map((item, i) => (
        <div key={i} className="col-md-6 col-lg-12 col-xl-6">
          <ProjectCard1 data={item} />
        </div>
      ))}
    </div>
  );
}
