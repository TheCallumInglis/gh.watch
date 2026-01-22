import PrTable from "../components/PrTable";
import { metadata } from "../app/layout";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
        <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "system-ui", fontSize: 22}}>{metadata.title}</h1>
            <p style={{ fontFamily: "system-ui", marginBottom: 12, color: "#555" }}>{metadata.description}</p>
            <PrTable />
        </main>
        <Footer />
    </>
  );
}

export default Home;