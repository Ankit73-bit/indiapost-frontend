import { CodeEditorContent } from './CodeEditorContent';
import { CodeEditorStatusBar } from './CodeEditorStatusBar';
import { CodeEditorTabBar } from './CodeEditorTabBar';
import type { CodeEditorPaneProps } from './codeEditorPane.types';
import { useCodeEditorPane } from './useCodeEditorPane';

export function CodeEditorPane({
  projectName,
  tabs,
  activeTab,
  content,
  onTabSelect,
  onTabClose,
  onContentChange,
  onSave,
  onTogglePreview,
  previewOpen,
  readOnly,
  isSaving,
  linkedConfigFile,
  onOpenConfig,
}: CodeEditorPaneProps) {
  const { textareaRef, lineCount, lines, handleKeyDown } = useCodeEditorPane(
    content,
    readOnly,
    onSave,
    onContentChange,
  );

  const isTypFile = activeTab.endsWith('.typ');

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[hsl(var(--background))]">
      <CodeEditorTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
        isTypFile={isTypFile}
        previewOpen={previewOpen}
        onTogglePreview={onTogglePreview}
        readOnly={readOnly}
        isSaving={isSaving}
        onSave={onSave}
      />

      <CodeEditorStatusBar
        projectName={projectName}
        activeTab={activeTab}
        readOnly={readOnly}
        linkedConfigFile={linkedConfigFile}
        onOpenConfig={onOpenConfig}
        lineCount={lineCount}
      />

      <CodeEditorContent
        lines={lines}
        textareaRef={textareaRef}
        content={content}
        readOnly={readOnly}
        onContentChange={onContentChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
