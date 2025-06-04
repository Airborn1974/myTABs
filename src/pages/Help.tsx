import React from "react";
import Header from "@/components/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import {
  Book,
  Link as LinkIcon,
  StickyNote,
  ListChecks,
  Layers,
  Moon,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="w-full py-8 px-4 md:px-0">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link to="/" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Workspace
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Help Guide
          </h1>
        </div>

        <div className="prose max-w-none dark:prose-invert mb-6">
          <p className="text-lg text-muted-foreground">
            Welcome to myTABs! This guide will help you understand how to use
            the application efficiently and take advantage of all its features.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="overview">
            <AccordionTrigger className="text-xl font-medium">
              Overview
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>
                myTABs is a productivity tool that helps you organize your work
                by storing tabs, notes, and to-do lists in a visual workspace.
                The interface uses a Kanban-style layout with groups, making it
                easy to manage your workflow.
              </p>
              <p>
                You can create different groups for various projects or
                contexts, and add tabs, notes, and to-do lists to each group.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="getting-started">
            <AccordionTrigger className="text-xl font-medium">
              Getting Started
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>To start using myTABs:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Click the <strong>"Create New"</strong> button in the top
                  navigation bar.
                </li>
                <li>
                  Choose what type of item you want to create: Tab, Note, or
                  Todo List.
                </li>
                <li>Select which group you want to add it to.</li>
                <li>
                  Fill in the required information and click{" "}
                  <strong>"Create"</strong>.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tabs">
            <AccordionTrigger className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Managing Tabs
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>
                <strong>Creating a Tab:</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Click <strong>"Create New"</strong> and select the Tab option.
                </li>
                <li>Enter a title for your tab.</li>
                <li>Enter the URL (the website address).</li>
                <li>Select the group where you want to save the tab.</li>
                <li>
                  Click <strong>"Create"</strong>.
                </li>
              </ol>
              <p>
                <strong>Using Tabs:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click on a tab card to open the saved website.</li>
                <li>Each tab displays the website title and URL.</li>
                <li>
                  You can delete a tab by clicking the delete icon on the tab
                  card.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Using Notes
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>
                <strong>Creating a Note:</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Click <strong>"Create New"</strong> and select the Note
                  option.
                </li>
                <li>Enter a title for your note.</li>
                <li>Write your note content.</li>
                <li>Select the group where you want to save the note.</li>
                <li>
                  Click <strong>"Create"</strong>.
                </li>
              </ol>
              <p>
                <strong>Managing Notes:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Your notes are displayed as cards in their respective groups.
                </li>
                <li>You can edit a note by clicking on it.</li>
                <li>
                  Delete a note by clicking the delete icon on the note card.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="todos">
            <AccordionTrigger className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Todo Lists
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>
                <strong>Creating a Todo List:</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Click <strong>"Create New"</strong> and select the Todo
                  option.
                </li>
                <li>Enter a title for your todo list.</li>
                <li>Select the group where you want to save the todo list.</li>
                <li>
                  Click <strong>"Create"</strong>.
                </li>
              </ol>
              <p>
                <strong>Managing Todo Lists:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>After creating a todo list, you can add tasks to it.</li>
                <li>Check off completed tasks by clicking the checkbox.</li>
                <li>
                  Add new tasks using the input field at the bottom of the todo
                  list.
                </li>
                <li>Delete tasks by clicking the delete icon next to them.</li>
                <li>
                  Delete the entire todo list by clicking the delete icon on the
                  todo list card.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="groups">
            <AccordionTrigger className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Working with Groups
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>
                Groups help you organize your tabs, notes, and todo lists. Each
                group is displayed as a column in the workspace.
              </p>
              <p>
                <strong>Using Groups:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  When creating a new item, you must select which group it
                  belongs to.
                </li>
                <li>
                  Groups are displayed side by side in a Kanban-style layout.
                </li>
                <li>
                  Each group can contain a mix of tabs, notes, and todo lists.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="theme">
            <AccordionTrigger className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Theme Options
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <p>myTABs offers three theme options:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Light:</strong> A bright theme for daytime use.
                </li>
                <li>
                  <strong>Dark:</strong> A dark theme that's easier on the eyes,
                  especially at night.
                </li>
                <li>
                  <strong>System:</strong> Automatically matches your device's
                  theme preference.
                </li>
              </ul>
              <p>
                To change the theme, click the theme toggle icon in the top
                right corner of the page and select your preferred option.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tips">
            <AccordionTrigger className="text-xl font-medium">
              Tips & Tricks
            </AccordionTrigger>
            <AccordionContent className="text-base space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Organize by Project:</strong> Create groups for
                  different projects or areas of focus.
                </li>
                <li>
                  <strong>Quick Access:</strong> Save frequently used websites
                  as tabs for quick access.
                </li>
                <li>
                  <strong>Daily Notes:</strong> Create a note for daily tasks or
                  thoughts.
                </li>
                <li>
                  <strong>Track Progress:</strong> Use todo lists to track
                  progress on tasks.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default HelpPage;
