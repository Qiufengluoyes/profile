import { motion } from 'framer-motion';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useTiltPress } from '../../hooks/useTiltPress';

export interface CountdownEvent {
    title: string;
    Startdate?: string;
    targetDate: string;
    top: boolean;
}

interface CountdownCardProps {
    events: CountdownEvent[];
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    layoutId?: string;
    hidden?: boolean;
    closing?: boolean;
}

const CountdownCard: React.FC<CountdownCardProps> = ({
    events,
    onClick,
    onMouseEnter,
    onMouseLeave,
    layoutId,
    hidden = false,
    closing = false
}) => {
    const { tiltStyle, onPointerDown, onPointerUp, onPointerLeave } = useTiltPress();
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

    const formatLocalDate = (value: Date) => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        const hh = String(value.getHours()).padStart(2, '0');
        const min = String(value.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d} ${hh}:${min}`;
    };

    const today = normalizeToMinute(new Date());
    const todayTime = today.getTime();

    const pickEvent = () => {
        if (!events || events.length === 0) return null;
        const withTarget = events.map(event => {
            const start = parseDate(event.Startdate);
            const target = parseDate(event.targetDate);
            return {
                event,
                start,
                target,
                targetTime: target ? target.getTime() : null
            };
        }).filter(item => item.targetTime !== null);

        const ongoing = withTarget.filter(item => {
            const startTime = item.start ? item.start.getTime() : null;
            const targetTime = item.targetTime as number;
            return startTime !== null && startTime <= todayTime && targetTime >= todayTime;
        });

        const planned = withTarget.filter(item => {
            const startTime = item.start ? item.start.getTime() : null;
            return startTime !== null && startTime > todayTime;
        });

        if (ongoing.length > 0) {
            ongoing.sort((a, b) => (a.targetTime as number) - (b.targetTime as number));
            planned.sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0));
            return { focus: ongoing[0], ongoing, planned };
        }

        const upcoming = withTarget.filter(item => (item.targetTime as number) >= todayTime);
        if (upcoming.length === 0) return null;

        upcoming.sort((a, b) => (a.targetTime as number) - (b.targetTime as number));
        return { focus: upcoming[0], ongoing: [], planned };
    };

    const picked = pickEvent();
    const focusEvent = picked?.focus;
    const topEvent = focusEvent?.event;
    const startDate = focusEvent?.start ?? null;
    const targetDate = focusEvent?.target ?? null;
    const hasSchedule = !!topEvent;
    const ongoingEvents = picked?.ongoing ?? [];
    const ongoingCount = ongoingEvents.length;
    const plannedEvents = picked?.planned ?? [];

    const startTime = (startDate ?? today).getTime();
    const targetTime = (targetDate ?? today).getTime();

    const isBeforeStart = !!startDate && todayTime < startTime;
    const isAfterTarget = !!targetDate && todayTime > targetTime;
    const isInProgress = ongoingCount > 0 || (hasSchedule && !isBeforeStart && !isAfterTarget);

    const daysToStart = Math.ceil((startTime - todayTime) / MS_PER_DAY);
    const daysToTarget = Math.ceil((targetTime - todayTime) / MS_PER_DAY);
    const rawDays = isBeforeStart ? daysToStart : (isAfterTarget ? Math.abs(daysToTarget) : Math.max(daysToTarget, 0));
    const days = Number.isFinite(rawDays) ? rawDays : 0;

    const headerText = !topEvent
        ? ''
        : (isBeforeStart
            ? `距离${topEvent.title}还有`
            : (isInProgress ? '正在进行' : `Distance to ${topEvent.title}`));

    const unitLabel = isAfterTarget ? 'Days Ago' : 'Days';

    let progress = 0;
    if (startDate && targetDate && isInProgress) {
        const total = targetTime - startTime;
        const current = todayTime - startTime;
        progress = total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;
    }

    const displayDate = hasSchedule
        ? (isBeforeStart ? (topEvent?.Startdate || topEvent?.targetDate) : topEvent?.targetDate)
        : formatLocalDate(today);

    const inProgressLabelClass = ongoingCount >= 3
        ? 'text-sm'
        : (ongoingCount === 2 ? 'text-base' : 'text-lg');

    const iconBoxLayoutId = layoutId ? `${layoutId}-icon-box` : undefined;
    const iconLayoutId = layoutId ? `${layoutId}-icon` : undefined;

    return (
        <motion.div
            layoutId={layoutId}
            className={`md:col-span-1 cursor-pointer group relative z-10 overflow-hidden rounded-[32px] duration-200 aspect-square md:h-full bg-white/40 dark:bg-[#1c1c1e]/60 backdrop-blur-xl transition-colors duration-300 ${(hidden || closing) ? 'pointer-events-none' : ''}`}
            animate={{ opacity: hidden ? 0 : 1 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 250, damping: 25, mass: 1.0 }}
            style={tiltStyle}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
        >
            {/* Gradient Overlay (Teal/Blue to match "Time" vibe) */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20 z-0 opacity-80"></div>

            {/* Content */}
            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <motion.div
                        layoutId={iconBoxLayoutId}
                        className="w-10 h-10 rounded-full bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center backdrop-blur-md"
                    >
                        <motion.div layoutId={iconLayoutId}>
                            <ClockIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </motion.div>
                    </motion.div>

                    <div className="px-2 py-1 rounded-full bg-white/40 dark:bg-white/10 border border-white/20 text-[10px] font-medium text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                        {events.length} Events
                    </div>
                </div>

                {/* Main Number */}
                <div className="flex flex-col items-center justify-center flex-1 my-2">
                    {!hasSchedule ? (
                        <div className="text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight text-center">
                            当前没有日程
                        </div>
                    ) : (
                        <>
                            <span className={`${inProgressLabelClass} font-bold text-gray-500 dark:text-gray-400 mb-1`}>
                                {isInProgress ? '正在进行' : headerText}
                            </span>
                            {isInProgress ? (
                                <div className="text-center space-y-2">
                                    <div className="text-[26px] font-bold text-[#1d1d1f] dark:text-white tracking-tight space-y-1">
                                        {(ongoingCount > 0 ? ongoingEvents : [{ event: topEvent }]).map((item, idx) => (
                                            <div key={`${item.event?.title ?? 'event'}-${idx}`} className="line-clamp-1">
                                                {item.event?.title}
                                            </div>
                                        ))}
                                    </div>
                                    {plannedEvents.length > 0 && (
                                        <div className="text-gray-500 dark:text-gray-400 font-medium space-y-0.5">
                                            <div className={`${inProgressLabelClass} font-bold tracking-wide`}>规划中</div>
                                            {plannedEvents.slice(0, 3).map((item, idx) => (
                                                <div key={`${item.event?.title ?? 'planned'}-${idx}`} className="text-[15px] line-clamp-1">
                                                    {item.event?.title}
                                                </div>
                                            ))}
                                            {plannedEvents.length > 3 && (
                                                <div className="text-[11px] text-gray-400">
                                                    +{plannedEvents.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-6xl font-bold text-[#1d1d1f] dark:text-white tracking-tighter flex items-end leading-none">
                                    {Math.abs(days)}
                                    <span className="text-lg font-medium text-gray-400 ml-1 mb-1.5">
                                        {unitLabel}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Info */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {displayDate}
                        </span>
                    </div>
                    {/* Progress Bar (only when in progress) */}
                    {isInProgress && (
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                            <div
                                className="h-full bg-teal-500 rounded-full opacity-80"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
};

export default CountdownCard;
