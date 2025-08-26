import React from 'react';
import Link from 'next/link';
import { ArrowRightLong } from '@/components/icon/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

type TabButton = {
  title: string;
  href: string;
};

type CtaTabs = {
  id: string;
  title: string;
  content: string;
  button: TabButton;
};

interface TabbedCtaProps {
  data: CtaTabs[];
}

export default function TabbedCta({ data }: TabbedCtaProps) {
  return (
    <section className='py-25'>
      <div className='container mx-auto px-4'>
        <Tabs defaultValue='professionals' className='w-full my-20'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            {/* Tab Navigation */}
            <div className='lg:col-span-4'>
              <TabsList className='flex flex-col items-start h-auto p-0 bg-transparent space-y-2'>
                {data.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className='justify-start text-md text-left p-4 pl-0 bg-transparent border-b-2 border-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none shadow-none'
                  >
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className='lg:col-span-8'>
              {data.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className='mt-0'>
                  <div className='space-y-6'>
                    <h4 className='text-xl font-semibold'>{tab.title}</h4>
                    <p
                      className='text-muted-foreground pb-4'
                      dangerouslySetInnerHTML={{ __html: tab.content }}
                    />
                    <Button variant='secondary' asChild size='lg'>
                      <Link
                        href={tab.button.href}
                        className='inline-flex items-center gap-2'
                      >
                        Εγγραφή Επαγγελματία
                        <ArrowRight className='w-4 h-4' />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
