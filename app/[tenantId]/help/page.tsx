import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { ChevronLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  params: {
    tenantId: string
  }
}

export default async function HelpPage({ params }: Props) {
  const { tenantId } = params

  if (!tenantId) {
    notFound()
  }

  try {
    const helpContent = fs.readFileSync(
      path.join(process.cwd(), 'public', 'help.md'),
      'utf-8'
    )

    return (
      <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="flex h-16 items-center border-b bg-white px-4 dark:bg-slate-950">
          <Link
            href={`/${tenantId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Yardım içeriğinde ara..."
                className="w-[300px] pl-8"
              />
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <h1 className="text-lg font-semibold">Yardım Merkezi</h1>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <Card className="overflow-hidden bg-white p-4 shadow-lg dark:bg-slate-950 sm:p-8">
              <article className="prose prose-slate max-w-none dark:prose-invert
                prose-headings:scroll-mt-20
                prose-h1:text-3xl prose-h1:font-bold 
                prose-h2:text-2xl prose-h2:font-semibold 
                prose-h3:text-xl prose-h3:font-bold 
                prose-h4:text-lg prose-h4:font-medium 
                prose-img:rounded-lg prose-img:shadow-md
                prose-a:text-primary hover:prose-a:text-primary/80
                prose-code:text-pink-500 dark:prose-code:text-pink-400
                prose-pre:bg-slate-900 prose-pre:shadow-md dark:prose-pre:bg-slate-800
                prose-img:mx-auto prose-img:max-w-full sm:prose-img:max-w-2xl
                prose-table:w-full
                prose-th:bg-slate-100 prose-th:p-2 dark:prose-th:bg-slate-800
                prose-td:p-2 prose-td:border
                prose-hr:my-8
                prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                prose-ul:list-disc prose-ul:pl-6
                prose-ol:list-decimal prose-ol:pl-6
                prose-li:my-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]} 
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-3" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-lg font-medium mb-2" {...props} />
                  }}
                >{helpContent}</ReactMarkdown>
              </article>
            </Card>
          </div>
        </ScrollArea>
      </div>
    )
  } catch (error) {
    console.error('Help page error:', error)
    notFound()
  }
}
