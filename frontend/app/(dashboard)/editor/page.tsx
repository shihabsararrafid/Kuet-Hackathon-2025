"use client";
import RichTextEditor from "@/components/rich-text/editor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Globe,
  Languages,
  Loader2,
  Lock,
  Share2,
  Users,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
// import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  about: z.string().min(2, {
    message: "Text must be at least 2 characters.",
  }),
});

export default function TranslationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [translatedText, setTranslatedText] = useState("");
  const [pdfId, setPdfId] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingPdf, setGeneratingPdf] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("write");

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      about: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/translations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            rawText: values.about, // Assuming 'about' contains the text to translate
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const data = (await response.json())?.data;
      //   console.log(data.tranlatedText);
      setPdfId(data.id);
      setTranslatedText(data.translatedText); // Adjust based on your API response structure

      toast({
        title: "Translation Complete",
        description: "Your text has been translated successfully!",
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: (
          <div>
            {error instanceof Error
              ? error.message
              : "Translation failed. Please try again."}
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  const copyToClipboard = () => {
    // Create a temporary div to strip HTML tags for copying
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = translatedText;
    const plainText = tempDiv.textContent || tempDiv.innerText;

    navigator.clipboard.writeText(plainText);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = "bn-BD";
    window.speechSynthesis.speak(utterance);
  };
  const handleDownload = async () => {
    try {
      setGeneratingPdf(true);
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
      setGeneratingPdf(false);
    }
  }; // Add sharing handler
  const handleShare = async (
    visibility: "PRIVATE" | "AUTHENTICATED" | "PUBLIC"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-1/2 mx-auto p-6 space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Banglish to Bangla Converter
        </h1>
        <p className="text-muted-foreground">
          Convert your Banglish text to proper Bangla with just one click
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">
                    Enter Your Banglish Text
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center">
              <Button
                type="submit"
                size="lg"
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4" />
                    Translate
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {translatedText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Translated Text</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSpeak}>
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pdfId || isSharing}
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
                      onClick={() => handleShare("PRIVATE")}
                      className="cursor-pointer"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Private</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShare("AUTHENTICATED")}
                      className="cursor-pointer"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>Authenticated Users</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShare("PUBLIC")}
                      className="cursor-pointer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Public</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={handleDownload}
                  disabled={!pdfId}
                  variant="outline"
                  size="sm"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Card className="p-4 bg-muted">
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: translatedText }}
              />
            </Card>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
