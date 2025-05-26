import FreelancerCard from '../card/freelancer-card';

export default function FreelancersTab({ freelancers, fid }) {
  return (
    <div className='row'>
      {freelancers && freelancers.length > 0 ? (
        freelancers.map(
          (freelancer, i) =>
            freelancer?.username && (
              <div key={freelancer.username} className='col-sm-6 col-xl-3'>
                <FreelancerCard
                  freelancer={freelancer}
                  fid={fid}
                  showDelete={true}
                  linkedName
                />
              </div>
            ),
        )
      ) : (
        <div>Δεν βρέθηκαν αποθηκευμένα προφίλ</div>
      )}
    </div>
  );
}
