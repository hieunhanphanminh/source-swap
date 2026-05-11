import CanvasLoader from "./common/CanvasLoader";
import ScrollWrapper from "./common/ScrollWrapper";
import Experience from "./experience";
import Footer from "./footer";
import Hero from "./hero";

export default function PortfolioScene() {
  return (
    <CanvasLoader>
      <ScrollWrapper>
        <Hero />
        <Experience />
        <Footer />
      </ScrollWrapper>
    </CanvasLoader>
  );
}
