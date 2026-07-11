import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function CompanyPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params;
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: { founders: true },
  })

  if (!company) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-4 -ml-4" })}>
          ← Back to Directory
        </Link>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight uppercase mb-2">{company.name}</h1>
            {company.oneLiner && (
              <p className="text-xl text-muted-foreground font-medium mb-4">{company.oneLiner}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-6">
              {company.vcBacker && <Badge>{company.vcBacker}</Badge>}
              {company.industry && <Badge variant="outline">{company.industry}</Badge>}
              {company.location && <Badge variant="outline">{company.location}</Badge>}
              {company.foundedYear && <Badge variant="outline">Est. {company.foundedYear}</Badge>}
              {company.tags && company.tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="outline">{tag.trim()}</Badge>
              ))}
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {company.description || "No detailed description available."}
            </p>
            <div className="flex gap-4">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "default" })}>
                  Visit Website
                </a>
              )}
              {company.twitterUrl && (
                <a href={company.twitterUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                  Twitter
                </a>
              )}
              {company.linkedinUrl && (
                <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
          
          <Card className="w-full md:w-64 shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">At a Glance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Employees</div>
                <div className="font-medium">{company.employees || "Unknown"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-6 border-b border-[#27272A] pb-2">Founders</h2>
        {company.founders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.founders.map(founder => (
              <Card key={founder.id} className="hover:border-foreground transition-none">
                <CardHeader>
                  <CardTitle className="text-xl tracking-tight uppercase">{founder.name}</CardTitle>
                  {founder.role && <div className="text-sm text-muted-foreground">{founder.role}</div>}
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {founder.bio && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {founder.bio}
                    </p>
                  )}
                  {founder.email && (
                    <div className="text-sm">
                      <span className="font-medium">Email:</span> <a href={`mailto:${founder.email}`} className="text-primary hover:underline">{founder.email}</a>
                    </div>
                  )}
                  {founder.phone && (
                    <div className="text-sm">
                      <span className="font-medium">Phone:</span> {founder.phone}
                    </div>
                  )}
                  {(founder.twitterUrl || founder.linkedinUrl) && (
                    <div className="text-sm flex gap-3 mt-2">
                      {founder.twitterUrl && (
                        <a href={founder.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter</a>
                      )}
                      {founder.linkedinUrl && (
                        <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No founder information available.</p>
        )}
      </div>
    </div>
  )
}
