import { motion } from 'framer-motion';
import myData from '../../data/my/data.json';
import { useTiltPress } from '../../hooks/useTiltPress';
const { personalInfo } = myData;

interface ProfileCardProps {
    onClick: () => void;
    layoutId?: string;
    hidden?: boolean;
    closing?: boolean;
}

const ProfileCard = ({ onClick, layoutId, hidden = false, closing = false }: ProfileCardProps) => {
    const { tiltStyle, onPointerDown, onPointerUp, onPointerLeave } = useTiltPress();
    return (
        <motion.div
            layoutId={layoutId} // 启用布局动画，实现无缝过渡
            className={`aspect-square cursor-pointer group relative z-10 overflow-hidden rounded-[32px] duration-200 bg-white/40 dark:bg-[#1c1c1e]/60 backdrop-blur-xl transition-colors duration-300 ${(hidden || closing) ? 'pointer-events-none' : ''}`}
            animate={{ opacity: hidden ? 0 : 1 }}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 250, damping: 25, mass: 1.0 }}
            style={tiltStyle}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
        >
            {/* Solid Overlay for Sky-Blue Glassmorphism tint */}
            <div className="absolute inset-0 bg-[#DCEBFF]/80 dark:bg-[#1A2B5C]/50 z-0"></div>

            {/* Solid background only: no decorative clouds */}

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-7">

                {/* Avatar Section */}
                <div className="relative mt-4">
                    {/* Glow ring around avatar */}
                    <div className="absolute -top-3 -left-3 w-36 h-36 rounded-full bg-[#CFE3FF]/40 dark:bg-[#2C3F7A]/35 blur-md"></div>
                    {/* Simple halo for clean mono look */}
                    <div className="w-32 h-32 rounded-full bg-[#E3EEFF]/70 dark:bg-[#223669]/30 absolute -top-2 -left-2 transition-colors duration-300"></div>
                    <div className="w-28 h-28 rounded-full bg-[#F5F9FF]/80 dark:bg-[#16264C]/40 ring-1 ring-[#CFE3FF]/60 dark:ring-[#2C3F7A]/50 shadow-lg overflow-hidden relative z-10 transition-colors duration-300">
                        <img src={personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Text Info */}
                <div className="flex flex-col items-start gap-0.5 mb-1 text-[#1d1d1f] dark:text-white transition-colors duration-300">
                    <h2 className="text-[32px] font-bold tracking-tight leading-none mb-1">
                        {personalInfo.name}
                    </h2>
                    <p className="text-[15px] text-[#1d1d1f]/60 dark:text-white/60 font-medium">
                        {personalInfo.email}
                    </p>
                    <div className="mt-3 text-[14px] font-bold flex items-center gap-1">
                        和你的日常，就是奇迹{/* <span className="text-[16px] relative -top-[1px]">_</span>*/}
                    </div>
                </div>
            </div>

            {/* No shine for pure mono look */}

        </motion.div >
    );
};

export default ProfileCard;
