import "./styles.css";

export function LoginBaseSpaceship() {
  return (
    <div
      className="absolute top-0 bottom-0 opacity-40 md:opacity-100"
      style={{
        left: "50%",
        height: "100vh",
        width: "100vh",
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="absolute z-1 flex h-full w-full overflow-hidden bg-no-repeat"
        style={{
          backgroundImage: `url("/assets/login-portal.png")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: "transparent",
        }}
      ></div>

      <div
        className="absolute left-1 z-0 h-full w-full"
        style={{ width: "calc(100% - 8px)" }}
      >
        <div
          className="absolute h-full w-full"
          style={{ backgroundColor: "#0d1013" }}
        >
          <img
            src="/assets/login-stars.png"
            alt="stars"
            className="stars-animation absolute w-full"
          />

          <img
            src="/assets/login-planet.png"
            alt="planet"
            className="planet-animation absolute w-full"
            style={{ bottom: "16%" }}
          />
        </div>
      </div>
    </div>
  );
}
