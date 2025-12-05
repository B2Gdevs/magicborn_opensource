"use client";

interface ResourceDocumentationProps {
  title: string;
  sourcePath: string;
  outputPath: string;
  description: string;
  mergeStrategy?: string;
}

export default function ResourceDocumentation({
  title,
  sourcePath,
  outputPath,
  description,
  mergeStrategy,
}: ResourceDocumentationProps) {
  return (
    <div className="bg-shadow border border-border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-glow mb-3 flex items-center gap-2">
        📚 Data Flow Documentation
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold text-ember-glow">Source:</span>
          <code className="ml-2 text-text-secondary bg-deep px-2 py-1 rounded">
            {sourcePath}
          </code>
          <p className="text-text-muted mt-1 ml-4 text-xs">
            {sourcePath.endsWith('.db') 
              ? 'Data is read from this database when the editor loads'
              : 'Data is read from this file when the editor loads'}
          </p>
        </div>
        <div>
          <span className="font-semibold text-ember-glow">Output:</span>
          <code className="ml-2 text-text-secondary bg-deep px-2 py-1 rounded">
            {outputPath}
          </code>
          <p className="text-text-muted mt-1 ml-4 text-xs">
            {outputPath.endsWith('.db')
              ? 'Changes are written to this database when you save'
              : 'Changes are written back to this file when you save'}
          </p>
        </div>
        {mergeStrategy && (
          <div>
            <span className="font-semibold text-ember-glow">Merge Strategy:</span>
            <p className="text-text-secondary mt-1 ml-4">{mergeStrategy}</p>
          </div>
        )}
        <div>
          <span className="font-semibold text-ember-glow">Description:</span>
          <p className="text-text-secondary mt-1 ml-4">{description}</p>
        </div>
      </div>
    </div>
  );
}

