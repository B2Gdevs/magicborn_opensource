import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllDeveloperDocs, getDeveloperDocBySlug, getAllDeveloperDocSlugs, getSearchIndex } from '@/lib/developer-docs';
import DevDocsLayout from '@/components/developer-docs/DevDocsLayout';
import DevDocsToc from '@/components/developer-docs/DevDocsToc';
import DevMarkdownRenderer from '@/components/developer-docs/DevMarkdownRenderer';
import { Calendar, Clock } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

// Generate static params for all docs
export async function generateStaticParams() {
  const slugs = getAllDeveloperDocSlugs();
  return [
    { slug: [] }, // root /docs/developer
    ...slugs.map((slug) => ({ slug: slug.split('/') })),
  ];
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugString = slug?.join('/') || 'README';
  const doc = getDeveloperDocBySlug(slugString);
  
  if (!doc) {
    return { title: 'Developer Documentation | Magicborn' };
  }
  
  return {
    title: `${doc.meta.title} | Developer Docs | Magicborn`,
    description: doc.meta.description || `Developer documentation for ${doc.meta.title}`,
  };
}

export default async function DeveloperDocPage({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug?.join('/') || 'README';
  
  const doc = getDeveloperDocBySlug(slugString);
  const allDocs = getAllDeveloperDocs();
  const searchIndex = getSearchIndex();
  
  if (!doc) {
    notFound();
  }
  
  return (
    <main className="ml-64 mt-16 min-h-screen bg-void">
      <DevDocsLayout docs={allDocs} searchIndex={searchIndex}>
        <div className="flex gap-8 max-w-7xl mx-auto px-8 py-12">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-8 pb-6 border-b border-border">
              <h1 className="text-4xl font-bold text-ember-glow mb-2">
                {doc.meta.title}
              </h1>
              {doc.meta.description && (
                <p className="text-lg text-text-muted mt-2">
                  {doc.meta.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Last updated
                </span>
              </div>
            </header>
            
            {/* Content */}
            <div className="prose-dark">
              <DevMarkdownRenderer content={doc.content} />
            </div>
          </article>
          
          {/* Right sidebar - TOC */}
          <DevDocsToc headings={doc.headings} />
        </div>
      </DevDocsLayout>
    </main>
  );
}

