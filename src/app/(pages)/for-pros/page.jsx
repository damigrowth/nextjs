import { CtaBanner1 } from '@/components/banner';
import { Breadcumb1 } from '@/components/breadcrumb';
import { CounterInfo1 } from '@/components/counter';
import { AboutArea1, OurFaq1, OurFeature1 } from '@/components/section';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title:
    'Doulitsa - Freelance Marketplace React/Next Js Template | Become seller',
};

export default function page() {
  return (
    <>
      <Breadcumb1
        title={'Επαγγελματικά Προφίλ'}
        brief={` Εάν είστε Επαγγελματίας ή Επιχείρηση, μπορείτε να αποκτήσετε εύκολα προβολή στην πλατφόρμα μας.`}
      />
      <AboutArea1 />
      <OurFeature1 />
      <CtaBanner1 />
      <CounterInfo1 />
      <OurFaq1 />
    </>
  );
}
