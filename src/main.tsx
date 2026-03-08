import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

async function main() {
    const container = document.getElementById("root");
    if (container) {
        const root = createRoot(container);
        root.render(<App />);
    } else {
        console.error("unable to find root");
    }
}

main();
