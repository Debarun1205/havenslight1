import { Languages, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import Translator from '@/components/comms/Translator';
import HelplineList from '@/components/comms/HelplineList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Communication() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <Languages className="w-4 h-4" /> Bridge the language gap
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Communication</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Translate phrases instantly and reach 24/7 multilingual helplines with one tap.
        </p>

        <Tabs defaultValue="translator" className="mt-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="translator"><Languages className="w-4 h-4 mr-1.5" /> Translator</TabsTrigger>
            <TabsTrigger value="helplines"><Phone className="w-4 h-4 mr-1.5" /> Helplines</TabsTrigger>
          </TabsList>
          <TabsContent value="translator" className="mt-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Translator />
            </div>
          </TabsContent>
          <TabsContent value="helplines" className="mt-5">
            <HelplineList />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}