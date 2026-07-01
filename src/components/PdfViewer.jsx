import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
    enter: (direction) => ({
        opacity: 0,
        x: direction > 0 ? 80 : -80,
    }),
    center: { opacity: 1, x: 0 },
    exit: (direction) => ({
        opacity: 0,
        x: direction > 0 ? -80 : 80,
    }),
};

export default function PdfViewer({ pdfUrl, pageCount }) {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageDirection, setPageDirection] = useState(1);

    const pageUrl = (n) => `${pdfUrl}page_${n}.jpg`;

    const goToPreviousPage = () => {
        setPageDirection(-1);
        setPageNumber((p) => Math.max(p - 1, 1));
    };

    const goToNextPage = () => {
        setPageDirection(1);
        setPageNumber((p) => Math.min(p + 1, pageCount));
    };

    return (
        <div className="mx-auto w-full max-w-[860px] px-4 py-6">
            <div className="relative">
                <button
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={pageNumber <= 1}
                    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-slate-800 shadow-lg transition hover:border-saffron hover:bg-saffron hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                >
                    ‹
                </button>
                <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={pageNumber >= pageCount}
                    className="absolute right-0 top-1/2 z-20 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-slate-800 shadow-lg transition hover:border-saffron hover:bg-saffron hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                >
                    ›
                </button>

                <div className="mx-auto w-full max-w-[840px] overflow-hidden rounded-[24px]">
                    <AnimatePresence mode="wait" custom={pageDirection}>
                        <motion.img
                            key={pageNumber}
                            src={pageUrl(pageNumber)}
                            alt={`Page ${pageNumber}`}
                            custom={pageDirection}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="w-full shadow-xl"
                            draggable={false}
                        />
                    </AnimatePresence>
                </div>

                {/* preload next page */}
                {pageNumber < pageCount && (
                    <img
                        src={pageUrl(pageNumber + 1)}
                        alt=""
                        className="hidden"
                        aria-hidden="true"
                    />
                )}
            </div>

            <div className="mt-4 text-center text-sm text-neutral-700">
                Page {pageNumber} of {pageCount}
            </div>
        </div>
    );
}
