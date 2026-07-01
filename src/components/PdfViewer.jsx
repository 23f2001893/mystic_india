import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

const PDF_OPTIONS = {
    rangeChunkSize: 131072,
    disableStream: false,
    disableAutoFetch: true,
};

export default function PdfViewer({ pdfUrl }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageDirection, setPageDirection] = useState(1);
    const [loadError, setLoadError] = useState("");
    const [isPageLoading,setIsPageLoading]=useState(false)
    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
        setLoadError("");
    }

    function onDocumentLoadError(error) {
        setLoadError(error?.message || "Unable to load PDF");
    }

    const goToPreviousPage = () => {
        setPageDirection(-1);
        setPageNumber((currentPage) => Math.max(currentPage - 1, 1));
    };

    const goToNextPage = () => {
        setPageDirection(1);
        setPageNumber((currentPage) => Math.min(currentPage + 1, numPages || 1));
    };

    const pageVariants = {
        enter: (direction) => ({
            opacity: 0,
            x: direction > 0 ? 80 : -80,
            rotateY: direction > 0 ? -8 : 8,
        }),
        center: {
            opacity: 1,
            x: 0,
            rotateY: 0,
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction > 0 ? -80 : 80,
            rotateY: direction > 0 ? 8 : -8,
        }),
    };

    return (
        <div className="mx-auto w-full max-w-[860px] px-4 py-6">
            <div className="relative">
                <button
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={!numPages || pageNumber <= 1}
                    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-slate-800 shadow-lg transition hover:border-saffron hover:bg-saffron hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                >
                    ‹
                </button>
                <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={!numPages || pageNumber >= numPages}
                    className="absolute right-0 top-1/2 z-20 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-slate-800 shadow-lg transition hover:border-saffron hover:bg-saffron hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                >
                    ›
                </button>

                <div className="mx-auto w-full max-w-[840px] overflow-hidden rounded-[24px] bg-transparent">
                    <Document
                        file={pdfUrl}
                        options={PDF_OPTIONS}
                        loading={<p className="py-10 text-center text-sm text-neutral-600">Loading PDF...</p>}
                        error={<p className="py-10 text-center text-sm text-red-600">{loadError || "Unable to load PDF"}</p>}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                    >
                        {numPages && (
                            <div className="flex justify-center overflow-hidden">
                                <AnimatePresence mode="wait" custom={pageDirection}>
                                    <motion.div
                                        key={pageNumber}
                                        custom={pageDirection}
                                        variants={pageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.28, ease: "easeOut" }}
                                        className="origin-center shadow-xl"
                                    >
                                        <Page pageNumber={pageNumber} width={820} />
                                    </motion.div>
                                </AnimatePresence>
                                {pageNumber < numPages && (
                                    <div className="hidden">
                                        <Page pageNumber={pageNumber + 1} width={820} />
                                    </div>)}
                            </div>
                        )}
                    </Document>
                </div>
            </div>

            <div className="mt-4 text-center text-sm text-neutral-700">
                {numPages ? `Page ${pageNumber} of ${numPages}` : "Loading pages..."}
            </div>
        </div>
    );
}
