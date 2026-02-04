"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
} from "lucide-react";
import { Button } from "./button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Entrez votre texte...",
  disabled = false,
  className,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlValue, setHtmlValue] = useState(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHtmlValue(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[150px] p-3 focus:outline-none tiptap-textarea",
      },
    },
  });

  // Sync external value changes to editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setHtmlValue(value);
    }
  }, [value, editor]);

  // Handle HTML mode changes
  const handleHtmlChange = useCallback(
    (newHtml: string) => {
      setHtmlValue(newHtml);
      onChange(newHtml);
      if (editor) {
        editor.commands.setContent(newHtml);
      }
    },
    [editor, onChange]
  );

  // Handle tab change
  const handleModeChange = (newMode: string) => {
    if (newMode === "html" && editor) {
      setHtmlValue(editor.getHTML());
    }
    setMode(newMode as "visual" | "html");
  };

  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const characterCount = editor?.storage.characterCount.characters() ?? 0;

  if (!editor) {
    return (
      <div className="border border-border rounded-md p-3 min-h-[200px] bg-muted/50 animate-pulse" />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Tabs value={mode} onValueChange={handleModeChange}>
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="visual">Visuel</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground">
            {wordCount} mots · {characterCount} caractères
          </span>
        </div>

        <TabsContent value="visual" className="mt-0">
          <div className="border border-border rounded-md overflow-hidden bg-background">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border-b border-border bg-muted/30">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={disabled}
                className={cn(
                  editor.isActive("bold") && "bg-muted text-foreground"
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={disabled}
                className={cn(
                  editor.isActive("italic") && "bg-muted text-foreground"
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                disabled={disabled}
                className={cn(
                  editor.isActive("heading", { level: 2 }) &&
                  "bg-muted text-foreground"
                )}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                disabled={disabled}
                className={cn(
                  editor.isActive("heading", { level: 3 }) &&
                  "bg-muted text-foreground"
                )}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={disabled}
                className={cn(
                  editor.isActive("bulletList") && "bg-muted text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={disabled}
                className={cn(
                  editor.isActive("orderedList") && "bg-muted text-foreground"
                )}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                disabled={disabled}
                className={cn(
                  editor.isActive("codeBlock") && "bg-muted text-foreground"
                )}
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor content */}
            <EditorContent editor={editor} />
          </div>
        </TabsContent>

        <TabsContent value="html" className="mt-0">
          <Textarea
            value={htmlValue}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder="<p>Entrez votre code HTML...</p>"
            disabled={disabled}
            className="min-h-[200px] font-mono text-sm"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
