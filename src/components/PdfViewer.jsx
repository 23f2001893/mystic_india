import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfViewer({ pdfUrl }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageDirection, setPageDirection] = useState(1);
    const [loadError, setLoadError] = useState("");

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
        <div className="bg-neutral-100">
            <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium text-neutral-700">
                    {numPages ? `Page ${pageNumber} of ${numPages}` : "Loading pages..."}
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={goToPreviousPage}
                        disabled={!numPages || pageNumber <= 1}
                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={!numPages || pageNumber >= numPages}
                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-4">
            <Document
                file={pdfUrl}
                loading={<p className="py-10 text-center text-sm text-neutral-600">Loading PDF...</p>}
                error={<p className="py-10 text-center text-sm text-red-600">{loadError || "Unable to load PDF"}</p>}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
            >
                {numPages && (
                    <div className="flex justify-center overflow-hidden [perspective:1200px]">
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
                    </div>
                )}
            </Document>
            </div>
        </div>
    );
}
