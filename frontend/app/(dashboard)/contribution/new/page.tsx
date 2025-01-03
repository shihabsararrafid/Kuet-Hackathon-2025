"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { Languages, CheckCircle, AlertCircle } from "lucide-react";

const BanglishContributionForm: React.FC = () => {
  const [banglishText, setBanglishText] = useState("");
  const [banglaText, setBanglaText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    banglish: boolean;
    bangla: boolean;
  }>({
    banglish: false,
    bangla: false,
  });

  // Validate Banglish text (basic implementation)
  const validateBanglishText = (text: string) => {
    // Basic validation: check if text contains both English and Bengali characters
    const banglishRegex = /^[a-zA-Z\s\u0980-\u09FF]+$/;
    return text.trim().length > 0 && banglishRegex.test(text);
  };

  // Validate Bangla text
  const validateBanglaText = (text: string) => {
    // Ensure text is in Bangla script
    const banglaRegex = /^[\u0980-\u09FF\s]+$/;
    return text.trim().length > 0 && banglaRegex.test(text);
  };

  // Handle text submission
  const handleSubmit = async () => {
    // Validate both inputs
    const isBanglishValid = validateBanglishText(banglishText);
    const isBanglaValid = validateBanglaText(banglaText);

    // Update validation status
    setValidationStatus({
      banglish: isBanglishValid,
      bangla: isBanglaValid,
    });

    // Check if both inputs are valid
    if (!isBanglishValid || !isBanglaValid) {
      toast({
        title: "Validation Error",
        description: "Please ensure both Banglish and Bangla texts are valid.",
        variant: "destructive",
      });
      return;
    }

    // Prepare submission
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contribution/create`,
        {
          banglishText,
          banglaText,
        },
        { withCredentials: true }
      );

      // Success toast
      toast({
        title: "Contribution Submitted",
        description:
          "Your translation contribution is pending admin verification.",
        variant: "default",
      });

      // Reset form
      setBanglishText("");
      setBanglaText("");
      setValidationStatus({
        banglish: false,
        bangla: false,
      });
    } catch (error) {
      // Error handling
      toast({
        title: "Submission Failed",
        description: "Unable to submit contribution. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Languages className="mr-2 h-6 w-6" />
          Contribute Translation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Banglish Input */}
          <div>
            <label
              htmlFor="banglish-input"
              className="block mb-2 text-sm font-medium"
            >
              Banglish Text
            </label>
            <div className="relative">
              <Input
                id="banglish-input"
                placeholder="Enter text in Banglish (e.g., ami kemon acho)"
                value={banglishText}
                onChange={(e) => {
                  setBanglishText(e.target.value);
                  setValidationStatus((prev) => ({
                    ...prev,
                    banglish: validateBanglishText(e.target.value),
                  }));
                }}
                className={`${
                  validationStatus.banglish
                    ? "border-green-500"
                    : banglishText
                    ? "border-red-500"
                    : ""
                }`}
              />
              {banglishText && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validationStatus.banglish ? (
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  ) : (
                    <AlertCircle className="text-red-500 h-5 w-5" />
                  )}
                </div>
              )}
            </div>
            {!validationStatus.banglish && banglishText && (
              <p className="text-xs text-red-500 mt-1">
                Invalid Banglish text. Use both English and Bengali characters.
              </p>
            )}
          </div>

          {/* Bangla Input */}
          <div>
            <label
              htmlFor="bangla-input"
              className="block mb-2 text-sm font-medium"
            >
              Bangla Text
            </label>
            <div className="relative">
              <Textarea
                id="bangla-input"
                placeholder="Enter corresponding Bangla text"
                value={banglaText}
                onChange={(e) => {
                  setBanglaText(e.target.value);
                  setValidationStatus((prev) => ({
                    ...prev,
                    bangla: validateBanglaText(e.target.value),
                  }));
                }}
                className={`${
                  validationStatus.bangla
                    ? "border-green-500"
                    : banglaText
                    ? "border-red-500"
                    : ""
                }`}
              />
              {banglaText && (
                <div className="absolute right-3 top-3">
                  {validationStatus.bangla ? (
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  ) : (
                    <AlertCircle className="text-red-500 h-5 w-5" />
                  )}
                </div>
              )}
            </div>
            {!validationStatus.bangla && banglaText && (
              <p className="text-xs text-red-500 mt-1">
                Invalid Bangla text. Use only Bangla characters.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !validationStatus.banglish ||
              !validationStatus.bangla
            }
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Contribute Translation"}
          </Button>
        </div>

        {/* Guidance Text */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Help improve our translation model!</strong>
            By contributing, you help make our Banglish to Bangla translations
            more accurate. Your contribution will be reviewed by an admin before
            being added to the training data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BanglishContributionForm;
