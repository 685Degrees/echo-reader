import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Worker } from "@react-pdf-viewer/core";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Component {...pageProps} />
    </Worker>
  );
}
