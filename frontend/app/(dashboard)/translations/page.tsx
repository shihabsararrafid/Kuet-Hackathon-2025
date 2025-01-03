"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Eye,
  Globe,
  Languages,
  Loader2,
  Lock,
  Share2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
interface Translation {
  id: string;
  rawText: string;
  translatedText: string;
  pdfLink: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  isPublic: boolean;
  title: string | null;
  caption: string | null;
  createdAt: string;
  totalVisits: number;
  userId: string;
}

const TranslationsPage = () => {
  const [translations, setTranslations] = React.useState<Translation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPdfLoading, setPDfIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  React.useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/v1/translations",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setTranslations(data.data);
      } catch (error) {
        console.error("Error fetching translations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);
  const handleDownload = async (pdfId: string) => {
    try {
      setPDfIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/translations/generate-pdf/${pdfId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            isPublic: false, // or true based on your needs
          }),
        }
      );

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const result = await response.json();

      // Open PDF in new tab or trigger download
      window.open(result.data.pdfLink, "_blank");

      toast({
        title: "Success",
        description: "PDF generated successfully!",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPDfIsLoading(false);
    }
  }; // Add sharing handler
  const handleShare = async (
    visibility: "PRIVATE" | "AUTHENTICATED" | "PUBLIC",
    pdfId: string
  ) => {
    try {
      setIsSharing(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/translations/shareability/${pdfId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            visibility: visibility,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Sharing failed");
      }

      const result = await response.json();
      console.log(result);
      navigator.clipboard.writeText(result.data.pdfLink);
      toast({
        title: "Success",
        description: `Document shared with ${visibility.toLowerCase()} access and link copied to clipboard`,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Translations</h1>
        <Button size="lg" className="gap-2">
          <Languages className="h-4 w-4" />
          New Translation
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translations.map((translation) => (
            <Card key={translation.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge
                    variant={
                      translation.visibility === "PUBLIC"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {translation.visibility}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(translation.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="space-y-4 flex-grow">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Original Text
                    </h3>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: translation.rawText }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      Translated Text
                    </h3>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: translation.translatedText,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {translation.totalVisits} views
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (translation.pdfLink) {
                          // If PDF exists, open it
                          window.open(translation.pdfLink, "_blank");
                        } else {
                          // If no PDF, generate one
                          handleDownload(translation.id);
                        }
                      }}
                    >
                      {!translation.pdfLink && isPdfLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!translation.id || isSharing}
                        >
                          {isSharing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleShare("PRIVATE", translation.id)}
                          className="cursor-pointer"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          <span>Private</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleShare("AUTHENTICATED", translation.id)
                          }
                          className="cursor-pointer"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          <span>Authenticated Users</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShare("PUBLIC", translation.id)}
                          className="cursor-pointer"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Public</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranslationsPage;
