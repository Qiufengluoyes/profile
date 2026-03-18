import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    MinusIcon,
    ArrowTopRightOnSquareIcon,
    DocumentTextIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { BlogPost } from '../../../types';
import { useEffect } from 'react';
import { useScrollLock } from '../../../hooks/useScrollLock';

interface BlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    blogPosts: BlogPost[];
    layoutId?: string;
    hidden?: boolean;
}

const BlogModal: React.FC<BlogModalProps> = ({
    isOpen,
    onClose,
    blogPosts,
    layoutId
}) => {
    const { lockScroll, unlockScroll } = useScrollLock();

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            lockScroll();
        } else {
            unlockScroll();
        }
        return () => {
            unlockScroll();
        };
    }, [isOpen, lockScroll, unlockScroll]);

    const filteredPosts = blogPosts;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: layoutId ? 0.3 : 0.2 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[999]"
                        style={{ willChange: "backdrop-filter" }}
                        onClick={onClose}
                    />

                    <div className="fixed inset-0 flex items-center justify-center z-[1000] pointer-events-none p-4">
                        <motion.div
                            layoutId={layoutId}
                            initial={!layoutId ? { opacity: 0, scale: 0.95, y: 20 } : undefined}
                            animate={!layoutId ? { opacity: 1, scale: 1, y: 0 } : undefined}
                            exit={!layoutId ? { opacity: 0, scale: 0.95, y: 20 } : undefined}
                            transition={layoutId ? { type: "spring", stiffness: 300, damping: 30, mass: 1.0 } : { duration: 0.2, ease: "easeOut" }}
                            className="w-full md:max-w-[1100px] h-[90vh] md:h-[750px] bg-white/95 dark:bg-[#1c1c1e]/95 rounded-[32px] shadow-2xl overflow-y-auto md:overflow-hidden pointer-events-auto flex flex-col md:flex-row relative"
                            style={{ willChange: "transform" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Sidebar */}
                            <div className="w-full md:w-[320px] flex-shrink-0 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-[24px] shadow-sm flex flex-col relative overflow-hidden border-b md:border-b-0 md:border-r border-[#FEF9F1] dark:border-white/5 z-20">

                                {/* Header - Traffic Lights */}
                                <div className="flex-shrink-0 h-[44px] md:h-[60px] flex items-center justify-between px-5">
                                    <div className="flex items-center gap-2.5">
                                        <button onClick={onClose} className="w-4 h-4 rounded-full bg-[#ff5f56] border-[0.5px] border-[#e0443e] hover:brightness-90 transition-all flex items-center justify-center group">
                                            <XMarkIcon className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100" />
                                        </button>
                                        <button onClick={onClose} className="w-4 h-4 rounded-full bg-[#ffbd2e] border-[0.5px] border-[#dea123] hover:brightness-90 transition-all flex items-center justify-center group">
                                            <MinusIcon className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100" />
                                        </button>
                                        <button className="w-4 h-4 rounded-full bg-[#27c93f] border-[0.5px] border-[#1aab29] hover:brightness-90 transition-all flex items-center justify-center group cursor-default">
                                            <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100" />
                                        </button>
                                    </div>
                                </div>

                                {/* Sidebar Content */}
                                <div className="flex-1 p-6 flex flex-col overflow-hidden">
                                    <div className="mb-6 flex-shrink-0">
                                        {/* Icon Box */}
                                        <motion.div
                                            layoutId={`${layoutId}-icon-box`}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 mb-4"
                                        >
                                            <DocumentTextIcon className="w-8 h-8" />
                                        </motion.div>

                                        <motion.h2
                                            layoutId={`${layoutId}-title`}
                                            className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-1"
                                        >
                                            My Blog
                                        </motion.h2>
                                        <motion.p
                                            layoutId={`${layoutId}-subtitle`}
                                            className="text-[#86868b] dark:text-gray-400 text-xs uppercase tracking-wider font-medium"
                                        >
                                            Updates & Tutorials
                                        </motion.p>
                                    </div>

                                    {/* Stats Footer */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                        className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-gray-400">Total Articles</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{blogPosts.length}</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <motion.div
                                className="flex-none md:flex-1 flex flex-col h-auto md:h-full overflow-visible md:overflow-hidden relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                exit={{ opacity: 0, transition: { duration: 0.1 } }} // Fast exit
                            >
                                {/* Content Area */}
                                <div className="flex-1 overflow-visible md:overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredPosts.map((post, index) => (
                                            <motion.a
                                                key={post.id}
                                                href={post.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + (index * 0.05) }}
                                                className="group block bg-white dark:bg-[#2c2c2e] rounded-2xl p-5 border border-gray-100 dark:border-white/5 hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {post.pubDate}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                                    {post.title}
                                                </h3>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3 leading-relaxed">
                                                    {post.description}
                                                </p>

                                            </motion.a>
                                        ))}
                                    </div>
                                    <div className="h-8"></div>
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BlogModal;
