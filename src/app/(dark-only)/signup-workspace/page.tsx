"use client";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import { OuterbaseIcon } from "@/components/icons/outerbase";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import { Label } from "@/components/orbit/label";
import { Select } from "@/components/orbit/select";
import { strippedWorkspaceName } from "@/lib/utils";
import { updateOuterbaseUserProfile } from "@/outerbase-cloud/api-account";
import { createOuterbaseWorkspace } from "@/outerbase-cloud/api-workspace";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LoginBaseSpaceship } from "../signin/starbase-portal";
import { SpaceshipContentContainer } from "../spaceship-container";

function generateRandomString(length: number) {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshPartial } = useWorkspaces();

  const createWorkspaceWithProfile = useCallback(async () => {
    const random = generateRandomString(4);
    const workspaceShortName = `${strippedWorkspaceName(workspaceName)}-${random}`;

    await updateOuterbaseUserProfile({
      first_name: firstName,
      last_name: lastName,
    }).then(() => {});

    const createdWorkspace = await createOuterbaseWorkspace({
      name: workspaceName,
      short_name: workspaceShortName,
    });

    refreshPartial(createdWorkspace);
    router.push(`/w/${createdWorkspace.short_name}`);
  }, [workspaceName, firstName, lastName, router, refreshPartial]);

  return (
    <>
      <SpaceshipContentContainer>
        <div className="mb-8 flex flex-col items-center text-base text-white">
          <OuterbaseIcon className="mb-2 h-14 w-14" />

          <h1 className="text-2xl font-bold">Create Workspace</h1>
          <p>Workspaces are a home for your databases.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            setLoading(true);
            createWorkspaceWithProfile()
              .then()
              .catch()
              .finally(() => {
                setLoading(false);
              });
          }}
          className="flex flex-col gap-4"
        >
          <LabelInput
            label="First name"
            size="lg"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
            required
          />

          <LabelInput
            label="Last name"
            size="lg"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
            required
          />

          <LabelInput
            required
            label="Workspace name"
            size="lg"
            placeholder="Workspace name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.currentTarget.value)}
          />

          <Label title="Company size">
            <Select
              className="w-full"
              value={companySize}
              placeholder="Company size"
              size="lg"
              setValue={setCompanySize}
              options={[
                { value: "Just me", label: "Just me" },
                { value: "2-10", label: "2-10" },
                { value: "11-50", label: "11-50" },
                { value: "51-200", label: "51-200" },
                { value: "201-500", label: "201-500" },
                { value: "501-1000", label: "501-1000" },
                { value: "1000+", label: "1000+" },
              ]}
            />
          </Label>

          <Label title="Your role">
            <Select
              className="w-full"
              value={role}
              size="lg"
              setValue={setRole}
              placeholder="Your role"
              options={[
                { value: "Data Science", label: "Data Science" },
                { value: "Marketing", label: "Marketing" },
                { value: "Design", label: "Design" },
                { value: "Product", label: "Product" },
                { value: "Engineering", label: "Engineering" },
                {
                  value: "Customer Service",
                  label: "Customer Service",
                },
                { value: "Operations", label: "Operations" },
                { value: "IT & Support", label: "IT & Support" },
                { value: "Finance", label: "Finance" },
                { value: "Sales", label: "Sales" },
                { value: "Founder", label: "Founder" },
                { value: "Other/Personal", label: "Other/Personal" },
              ]}
            />
          </Label>

          <Button
            loading={loading}
            variant="primary"
            size="lg"
            className="mt-8 w-full justify-center"
          >
            Create workspace
          </Button>
        </form>
      </SpaceshipContentContainer>
      <LoginBaseSpaceship />
    </>
  );
}
