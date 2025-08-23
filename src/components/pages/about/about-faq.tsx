import React from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Props = {};

const faqItems = [
  {
    id: 'item-1',
    question: 'Που έχει έδρα η Doulitsa;',
    answer: 'Είμαστε Ελληνική εταιρεία και έχουμε την έδρα μας στην Αθήνα.',
    defaultOpen: true,
  },
  {
    id: 'item-2',
    question: 'Πώς μπορώ να συνεργαστώ με την Doulitsa αν είμαι επαγγελματίας;',
    answer:
      "Για να εγγραφείς ως επαγγελματίας και να προσφέρεις τις υπηρεσίες σου, ακολούθησε τις οδηγίες στη σελίδα 'Εγγραφή'. Θα είμαστε σε επικοινωνία για να σε βοηθήσουμε σε ό,τι χρειαστείς.",
    defaultOpen: false,
  },
  {
    id: 'item-3',
    question: 'Υπάρχουν κρυφές χρεώσεις;',
    answer:
      'Η εγγραφή στον κατάλογό μας είναι εντελώς Δωρεάν. Εάν έχετε επαγγελματικό προφίλ μπορείτε να αποκτήσετε μια συνδρομή για να αυξήσετε την προβολή σας. Από την πλευρά των χρηστών, δεν υπάρχει καμία επιβάρυνση για να αποκτήσετε οποιαδήποτε υπηρεσία.',
    defaultOpen: false,
  },
];

export default function FaqAbout({}: Props) {
  return (
    <section className='py-20 pb-12 bg-white'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-wrap'>
          {/* Header */}
          <div className='w-full lg:w-1/2 mx-auto mb-16'>
            <div className='text-center'>
              <h2 className='title text-2xl lg:text-3xl font-bold mb-4 text-dark'>
                Συχνές Ερωτήσεις
              </h2>
              <p className='paragraph text-body leading-relaxed mt-3'>
                Αν έχεις περισσότερες ερωτήσεις πήγαινε στη σελίδα{' '}
                <Link
                  href='/faq'
                  className='text-primary hover:text-secondary underline'
                >
                  FAQ
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap'>
          <div className='w-full lg:w-2/3 mx-auto'>
            <div className='relative mb-8 lg:mb-12'>
              {/* FAQ Accordion */}
              <Accordion
                type='single'
                defaultValue='item-1'
                collapsible
                className='w-full space-y-4'
              >
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className='border border-gray-300 rounded overflow-hidden mb-4 [&>h3]:mb-0'
                  >
                    <AccordionTrigger className='bg-bluey text-left hover:no-underline px-5 py-6 text-lg font-medium text-dark [&[data-state=open]>svg]:rotate-180'>
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className='bg-bluey text-dark px-5 pb-6 text-base leading-relaxed'>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
