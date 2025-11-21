import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import NextLink from './next-link';

type Question = {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
};

type FaqData = {
  title: string;
  subtitle: string;
  list: Question[];
};

type FaqVariant = 'default' | 'compact';

type Props = {
  data: FaqData;
  variant?: FaqVariant;
  linkHref?: string;
  linkText?: string;
  // Custom styling props (override variant defaults)
  sectionClassName?: string;
  containerClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  accordionClassName?: string;
  accordionItemClassName?: string;
  accordionTriggerClassName?: string;
  accordionContentClassName?: string;
  showHeader?: boolean;
};

// Variant configurations
const variants = {
  default: {
    sectionClassName: 'py-20 pb-12 bg-white',
    containerClassName: 'container mx-auto px-6',
    headerClassName: 'w-full lg:w-1/2 mx-auto mb-16',
    titleClassName: 'title text-2xl lg:text-3xl font-bold mb-4 text-dark',
    subtitleClassName: 'paragraph text-body leading-relaxed mt-3',
    accordionClassName: 'w-full space-y-4',
    accordionItemClassName:
      'border border-gray-300 rounded overflow-hidden mb-4 [&>h3]:mb-0',
    accordionTriggerClassName:
      'bg-bluey text-left hover:no-underline px-5 py-6 text-lg font-medium text-dark [&[data-state=open]>svg]:rotate-180',
    accordionContentClassName:
      'bg-bluey text-dark px-5 pb-6 text-base leading-relaxed',
    showHeader: true,
  },
  compact: {
    sectionClassName: 'py-0',
    containerClassName: '',
    headerClassName: 'w-full lg:w-2/3 mx-auto mb-6',
    titleClassName: 'title text-xl font-bold text-left',
    subtitleClassName: '',
    accordionClassName: 'w-full space-y-3',
    accordionItemClassName:
      'border border-gray-400 rounded overflow-hidden [&>h3]:mb-0',
    accordionTriggerClassName:
      'w-full px-4 py-3 bg-bluey text-left text-dark text-base font-medium hover:bg-bluey/80 hover:no-underline flex justify-between items-center [&[data-state=open]>svg]:rotate-180',
    accordionContentClassName:
      'px-4 py-3 bg-bluey text-dark break-words text-sm',
    showHeader: true,
  },
};

export default function FaqSection({
  data,
  variant = 'default',
  linkHref = '/faq',
  linkText = 'FAQ',
  // Override props
  sectionClassName,
  containerClassName,
  headerClassName,
  titleClassName,
  subtitleClassName,
  accordionClassName,
  accordionItemClassName,
  accordionTriggerClassName,
  accordionContentClassName,
  showHeader,
}: Props) {
  // Get variant defaults
  const variantStyles = variants[variant];

  // Use provided props or fall back to variant defaults
  const styles = {
    sectionClassName: sectionClassName ?? variantStyles.sectionClassName,
    containerClassName: containerClassName ?? variantStyles.containerClassName,
    headerClassName: headerClassName ?? variantStyles.headerClassName,
    titleClassName: titleClassName ?? variantStyles.titleClassName,
    subtitleClassName: subtitleClassName ?? variantStyles.subtitleClassName,
    accordionClassName: accordionClassName ?? variantStyles.accordionClassName,
    accordionItemClassName:
      accordionItemClassName ?? variantStyles.accordionItemClassName,
    accordionTriggerClassName:
      accordionTriggerClassName ?? variantStyles.accordionTriggerClassName,
    accordionContentClassName:
      accordionContentClassName ?? variantStyles.accordionContentClassName,
    showHeader: showHeader ?? variantStyles.showHeader,
  };
  return (
    <section className={styles.sectionClassName}>
      <div className={styles.containerClassName}>
        {styles.showHeader && (
          <div className='flex flex-wrap'>
            {/* Header */}
            <div className={styles.headerClassName}>
              <div className='text-center'>
                <h2 className={styles.titleClassName}>{data.title}</h2>
                {data.subtitle && (
                  <p className={styles.subtitleClassName}>
                    {data.subtitle}{' '}
                    {linkHref && linkText && (
                      <>
                        <NextLink
                          href={linkHref}
                          className='text-primary hover:text-secondary underline'
                        >
                          {linkText}
                        </NextLink>
                        .
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-wrap'>
          <div className='w-full lg:w-2/3 mx-auto'>
            <div className='relative mb-8 lg:mb-12'>
              {/* FAQ Accordion */}
              <Accordion
                type='single'
                defaultValue={
                  data.list.find((q) => q.isOpen)?.id || data.list[0]?.id
                }
                collapsible
                className={styles.accordionClassName}
              >
                {data.list.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className={styles.accordionItemClassName}
                  >
                    <AccordionTrigger
                      className={styles.accordionTriggerClassName}
                    >
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent
                      className={styles.accordionContentClassName}
                    >
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
