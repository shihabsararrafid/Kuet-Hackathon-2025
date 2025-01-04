"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Languages, PlusCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Contribution, contributionService } from "./contribution-service";

const ContributionManagement: React.FC = () => {
  // State management
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  // Fetch contributions
  const fetchContributions = async () => {
    try {
      const isApproved = activeTab === "approved";
      const fetchedContributions =
        await contributionService.getUserContributions(isApproved);
      setContributions(fetchedContributions);
    } catch (error) {
      console.error("Failed to fetch contributions", error);
    }
  };

  // Refresh contributions when tab changes
  useEffect(() => {
    fetchContributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="mr-2" />
            Translation Contributions
          </CardTitle>
          <CardDescription>
            Manage your translation contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs for Pending and Approved Contributions */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "pending" | "approved")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pending Contributions</TabsTrigger>
              <TabsTrigger value="approved">Approved Contributions</TabsTrigger>
            </TabsList>

            {/* Contribution Table */}
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Banglish Text</TableHead>
                  <TableHead>Bangla Text</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>{contribution.banglishText}</TableCell>
                    <TableCell>{contribution.banglaText}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Create Contribution Button */}
            <div className="mt-4">
              <Link href={`/contribution/new`}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Contribution
                </Button>
              </Link>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionManagement;
