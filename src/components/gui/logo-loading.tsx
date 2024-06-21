export default function LogoLoading() {
  return (
    <div className="flex gap-2 items-center">
      <div
        className="w-12 h-12 flex justify-center items-center rounded"
        style={{
          background:
            "linear-gradient(45deg, #12C2E9, #C471ED 50%, #F7797D 100%)",
        }}
      >
        <span style={{ fontSize: 30 }} className="text-white animate-spin">
          ✱
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">LibSQL Studio</h1>
      </div>
    </div>
  );
}
