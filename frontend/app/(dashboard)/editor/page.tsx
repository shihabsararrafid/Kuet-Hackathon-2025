"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import RichTextEditor from "@/components/rich-text/editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  about: z.string().min(2, {
    message: "about must be at least 2 characters.",
  }),
});

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      about: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
    } catch (error) {
      toast({
        title: "Error",
        description: (
          <div>
            {error instanceof Error ? error.message : "Unknown Error Occurred"}
          </div>
        ),
      });
    } finally {
      setIsLoading(false);
    }
    console.log(values);
  }

  return (
    <div className="w-1/2 h-screen mx-auto space-y-20">
      <h1 className="flex justify-center pt-20 text-2xl font-medium">
        Convert any Banglish to Bangla
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Banglish Sentence</FormLabel>
                <FormControl>
                  <RichTextEditor {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="flex items-center gap-2"
            aria-label="Translate text"
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
        </form>
      </Form>
    </div>
  );
}
