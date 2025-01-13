import ViewEditor from "../view-editor";

export interface ViewTabProps {
  name: string;
  tableName?: string;
  schemaName: string;
}

export default function ViewTab(props: ViewTabProps) {
  return (
    <div>
      {JSON.stringify(props)}
      <ViewEditor />
    </div>
  );
}
