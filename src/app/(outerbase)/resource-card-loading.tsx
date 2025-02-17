export default function ResourceCardLoading() {
  return (
    <div className="bg-background flex h-36 w-full gap-2 rounded border p-4">
      <div>
        <div className="bg bg-muted h-10 w-10 animate-pulse rounded"></div>
      </div>
      <div className="mt-1 flex flex-col gap-2">
        <div className="bg bg-muted h-3 w-24 animate-pulse rounded-sm"></div>
        <div className="bg bg-muted h-3 w-32 animate-pulse rounded-sm"></div>
      </div>
    </div>
  );
}
