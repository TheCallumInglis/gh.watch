import PrTable from "../components/PrTable";
import { metadata } from "../app/layout";

const Home = () => {
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "system-ui", fontSize: 22}}>{metadata.title}</h1>
      <p style={{ fontFamily: "system-ui", marginBottom: 12, color: "#555" }}>{metadata.description}</p>
      <PrTable />
    </main>
  );
}

export default Home;