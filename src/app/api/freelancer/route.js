import { NextResponse } from 'next/server';
import { getFreelancer } from '@/actions/shared/freelancer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const freelancer = await getFreelancer();
    
    if (!freelancer) {
      return NextResponse.json({ freelancer: null }, { 
        status: 200,
        headers: { 
          'Cache-Control': 'no-store',
          'Cache-Tags': 'freelancer'
        }
      });
    }

    // Return the same format your Zustand store expects
    const freelancerType = freelancer.type?.data?.attributes?.slug;
    const hasAccess = ['freelancer', 'company'].includes(freelancerType);

    const result = {
      fid: freelancer.id,
      username: freelancer.username,
      displayName: freelancer.displayName,
      firstName: freelancer.firstName,
      lastName: freelancer.lastName,
      image: freelancer.image,
      hasAccess: hasAccess,
      isAuthenticated: true,
      isConfirmed: !!freelancer.confirmed,
      savedServices: freelancer.saved_services?.data || [],
      savedFreelancers: freelancer.saved_freelancers?.data || [],
    };

    return NextResponse.json({ freelancer: result }, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-store',
        'Cache-Tags': 'freelancer'
      }
    });

  } catch (error) {
    console.error('Error fetching freelancer:', error);
    return NextResponse.json({ freelancer: null }, { 
      status: 500,
      headers: { 
        'Cache-Control': 'no-store',
        'Cache-Tags': 'freelancer'
      }
    });
  }
}
