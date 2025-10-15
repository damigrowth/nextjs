'use server';

import { v2 as cloudinary } from 'cloudinary';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MediaLibraryTokenResult {
  success: boolean;
  data?: {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
  };
  error?: string;
}

export async function getMediaLibraryToken(): Promise<MediaLibraryTokenResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - Authentication required',
      };
    }

    if (session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Forbidden - Admin access required',
      };
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp: timestamp },
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      success: true,
      data: {
        signature,
        timestamp,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
      },
    };
  } catch (error) {
    console.error('Error generating Cloudinary token:', error);
    return {
      success: false,
      error: 'Failed to generate authentication token',
    };
  }
}
