import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    MinusIcon,
    ArrowTopRightOnSquareIcon,
    ClockIcon,
    CalendarDaysIcon,
    FlagIcon
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { CountdownEvent } from '../CountdownCard';

interface CountdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: CountdownEvent[];
    layoutId?: string;
}

const CountdownModal: React.FC<CountdownModalProps> = ({
    isOpen,
    onClose,
    events,
    layoutId
}) => {
    const { lockScroll, unlockScroll } = useScrollLock();

    useEffect(() => {
        if (isOpen) lockScroll();
        return () => { if (!isOpen) unlockScroll(); };
    }, [isOpen, lockScroll, unlockScroll]);

    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const normalizeToMinute = (value: Date) => {
        const next = new Date(value);
        next.setSeconds(0, 0);
        return next;
    };

    const parseDate = (value?: string) => {
        if (!value) return null;
        const trimmed = value.trim();
        let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/);
        if (match) {
            const [, yy, mm, dd, hh = '0', min = '0'] = match;
            const parsed = new Date(
                Number(yy),
                Number(mm) - 1,
                Number(dd),
                Number(hh),
                Number(min)
            );
            return normalizeToMinute(parsed);
        }
        match = trimmed.match(/^(\d{4})-(\d{2})$/) || trimmed.match(/^(\d{4})-(\d{2})-$/);
        if (match) {
            const [, yy, mm] = match;
            const parsed = new Date(Number(yy), Number(mm) - 1, 1, 0, 0);
            return normalizeToMinute(parsed);
        }
        const isoTrimmed = trimmed.replace(' ', 'T');
        const parsed = new Date(isoTrimmed);
        if (Number.isNaN(parsed.getTime())) return null;
        return normalizeToMinute(parsed);
    };

    const todayMid = normalizeToMinute(new Date());
    const todayTime = todayMid.getTime();

    const upcomingTitle = (() => {
        if (!events || events.length === 0) return '无';
        const candidates = events.map(event => {
            const target = parseDate(event.targetDate);
            return {
                event,
                targetTime: target ? target.getTime() : null
            };
        }).filter(item => item.targetTime !== null && (item.targetTime as number) >= todayTime);

        if (candidates.length === 0) return '无';
        candidates.sort((a, b) => (a.targetTime as number) - (b.targetTime as number));
        return candidates[0].event.title || '无';
    })();

    return (
        <AnimatePresence onExitComplete={unlockScroll}>
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
                            initial={!layoutId ? { opacity: 0, scale: 0.95 } : undefined}
                            animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
                            exit={!layoutId ? { opacity: 0, scale: 0.95 } : undefined}
                            className="w-full md:max-w-[900px] h-[85vh] md:h-[700px] bg-white/95 dark:bg-[#1c1c1e]/95 rounded-[32px] shadow-2xl overflow-y-auto md:overflow-hidden pointer-events-auto flex flex-col md:flex-row relative p-2"
                            style={{ willChange: "transform" }}
                            transition={layoutId ? {
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 1.0
                            } : {
                                duration: 0.2,
                                ease: "easeOut"
                            }}
                        >
                            {/* Sidebar */}
                            <div className="w-full md:w-[280px] flex-shrink-0 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-[24px] shadow-sm flex flex-col relative overflow-hidden border-b md:border-b-0 md:border-r border-[#FEF9F1] dark:border-white/5 z-20">

                                {/* Traffic Lights */}
                                <motion.div
                                    className="flex-shrink-0 h-[44px] md:h-[60px] flex items-center justify-between px-5"
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                >
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
                                </motion.div>

                                {/* Sidebar Info */}
                                <div className="flex-1 p-6 flex flex-col">
                                    <div className="mb-8">
                                        <motion.div
                                            layoutId={`${layoutId}-icon-box`}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white shadow-lg mb-4"
                                        >
                                            <motion.div layoutId={`${layoutId}-icon`}>
                                                <ClockIcon className="w-8 h-8" />
                                            </motion.div>
                                        </motion.div>
                                        <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-1">
                                            日程
                                        </h2>
                                        <p className="text-[#86868b] dark:text-gray-400 text-sm">
                                            Schedules
                                        </p>
                                    </div>

                                    <div className="mt-auto p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/30">
                                        <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-1">UPCOMING</div>
                                        <div className="text-sm font-bold text-teal-800 dark:text-teal-100 line-clamp-1">
                                            {upcomingTitle}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <motion.div
                                className="flex-none md:flex-1 h-auto md:h-full overflow-visible md:overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar z-10"
                                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {events.map((event, idx) => {
                                        const today = todayMid;
                                        const todayTime = todayMid.getTime();
                                        const startDate = parseDate(event.Startdate);
                                        const targetDate = parseDate(event.targetDate);

                                        const startTime = (startDate ?? today).getTime();
                                        const targetTime = (targetDate ?? today).getTime();

                                        const isBeforeStart = !!startDate && todayTime < startTime;
                                        const isAfterTarget = !!targetDate && todayTime > targetTime;
                                        const isInProgress = !isBeforeStart && !isAfterTarget;

                                        const daysToStart = Math.ceil((startTime - todayTime) / MS_PER_DAY);
                                        const daysToTarget = Math.ceil((targetTime - todayTime) / MS_PER_DAY);
                                        const rawDays = isBeforeStart ? daysToStart : (isAfterTarget ? Math.abs(daysToTarget) : Math.max(daysToTarget, 0));
                                        const days = Number.isFinite(rawDays) ? rawDays : 0;

                                        let progress = 0;
                                        if (startDate && targetDate) {
                                            if (isAfterTarget) {
                                                progress = 100;
                                            } else if (isInProgress) {
                                                const total = targetTime - startTime;
                                                const current = todayTime - startTime;
                                                progress = total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;
                                            }
                                        }

                                        const isPast = isAfterTarget;
                                        const dayLabel = isPast ? 'Days Ago' : (isInProgress ? 'Days Left' : 'Days');
                                        const showProgressBar = isInProgress;
                                        const showProgressMeta = true;
                                        const flagDate = isPast
                                            ? (event.Startdate || event.targetDate)
                                            : (isInProgress
                                                ? (event.Startdate || event.targetDate)
                                                : (isBeforeStart ? (event.Startdate || event.targetDate) : event.targetDate));
                                        const progressDate = event.targetDate;

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                                className="bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl p-5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors duration-200 relative overflow-hidden group"
                                            >
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{event.title}</h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <FlagIcon className="w-3 h-3" />
                                                                {flagDate}
                                                            </p>
                                                        </div>
                                                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${(isPast || isBeforeStart) ? 'bg-gray-100 text-gray-500' : 'bg-teal-100 text-teal-600'}`}>
                                                            {isBeforeStart ? 'PLANED' : (isPast ? 'ENDED' : 'ACTIVE')}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end gap-1 mb-4">
                                                        <span className="text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
                                                            {Math.abs(days)}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-500 mb-1.5 ml-1">
                                                            {dayLabel}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {showProgressBar && (
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                                transition={{ delay: 0.4 + (idx * 0.1), duration: 1 }}
                                                                className={`h-full rounded-full ${isPast ? 'bg-gray-400' : 'bg-gradient-to-r from-teal-400 to-cyan-500'}`}
                                                            />
                                                        </div>
                                                    )}
                                                    {showProgressMeta && (
                                                        <div className={`flex justify-between ${showProgressBar ? 'mt-1.5' : 'mt-2'}`}>
                                                            <span className="text-[10px] text-gray-400">{progressDate}</span>
                                                            <span className="text-[10px] text-gray-400">{Math.round(progress)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <div className="h-16"></div>
                            </motion.div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CountdownModal;
