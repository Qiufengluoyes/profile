import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useState, useEffect, lazy, Suspense, memo, useRef } from 'react'
import {
  HomeIcon,
  BriefcaseIcon,
  BeakerIcon,
  PencilIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

// Apple风格的缓动函数
const appleEaseOut = [0.22, 1, 0.36, 1]; // 更精细的Apple风格缓出效果
const appleEaseIn = [0.64, 0, 0.78, 0]; // Apple风格缓入效果
const appleEaseInOut = [0.4, 0, 0.2, 1]; // Apple风格曲线

// 使用 lazy 加载页面组件，但预加载以提高速度
const Home = lazy(() => import('./pages/Home'));
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const Travels = lazy(() => import('./pages/Travels'))
const About = lazy(() => import('./pages/About'))
import WebWalker from './components/WebWalker'
import DynamicIslandNav from './components/DynamicIslandNav'
import { PerformanceProvider, usePerformanceMode } from './contexts/PerformanceContext'
import RestrictedAccess from './components/RestrictedAccess'
import ScrollToTop from './components/ScrollToTop'
import { preloadResourcesWithMinTime } from './utils/preloader'
const bgImage = 'https://img.klpz.net/file/tc/2026/03/13/69b3cbfa2648f_1773390842.webp'
const bgPlaceholder = 'data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAADwAwCdASoUAA0APzmEuVOvKKWisAgB4CcJZgCdEf/gPjzNvF5J8s1wAPfa9nR9ymMZZjBVj6isAgWQSgCrEdElEDGRKAq8rb0S2RWQUQoT7MFnf4HPdmIsTiW+I5Tryd7G1yX8IYDqAAAA'

// 将背景图片组件分离，减少重渲染
const BackgroundImage = memo(() => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setLoaded(true);
  }, []);

  const bgStyle: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="fixed inset-0 w-full z-[-1]">
      {/* 底层：高清图，始终存在 */}
      <div
        className="absolute inset-0"
        style={{ ...bgStyle, backgroundImage: `url(${bgImage})` }}
      />
      {/* 顶层：模糊占位图，高清图加载完后淡出 */}
      <div
        className="absolute inset-0"
        style={{
          ...bgStyle,
          backgroundImage: `url(${bgPlaceholder})`,
          filter: 'blur(8px)',
          transform: 'scale(1.05)',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}
      />
      {/* 亮色模式使用粉色遮罩，暗色模式使用深蓝色遮罩 */}
      <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/55"></div>
    </div>
  );
});

// 将菜单组件分离 - 已替换为 DynamicIslandNav
// const Menu = ... 移除
// const NavigationBar = ... 移除

// 将页面内容组件分离
const PageContent = memo(() => (
  // 增加顶部内边距，防止内容被灵动岛遮挡 (pt-20 ~ pt-24)
  <main className="flex-grow px-4 md:px-6 lg:px-8 pt-8 md:pt-24 pb-4 md:pb-8">
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[40vh]">
        <div className="flex flex-col items-center gap-4 px-8 py-6 bg-white/40 dark:bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[24px] shadow-lg shadow-black/5">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" className="text-black/10 dark:text-white/10" />
            <path d="M16 4 A12 12 0 0 1 28 16" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium text-[#6c6c6e] dark:text-gray-400 tracking-wide">Loading</span>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/travels" element={<Travels />} />
          <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  </main>
));

function AppContent() {
  const { isLowPerf } = usePerformanceMode();
  return (
    <MotionConfig transition={isLowPerf ? { type: 'tween', duration: 0.08, ease: 'linear' } : undefined}>
      <AppInner />
    </MotionConfig>
  );
}

function AppInner() {
  const { isLowPerf } = usePerformanceMode();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [themeInitialized, setThemeInitialized] = useState(false);
  const componentsPreloaded = useRef(false);


  // 立即初始化主题模式，不等待其他资源
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const getStoredMode = () => {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
        return savedMode;
      }
      const legacyUserSet = localStorage.getItem('theme-user-set') === '1';
      const legacyTheme = localStorage.getItem('theme');
      if (legacyUserSet && (legacyTheme === 'dark' || legacyTheme === 'light')) {
        return legacyTheme;
      }
      return 'system';
    };

    const applyMode = (mode: string, prefersDark: boolean) => {
      if (mode === 'dark') {
        applyTheme(true);
      } else if (mode === 'light') {
        applyTheme(false);
      } else {
        applyTheme(prefersDark);
      }
    };

    const initMode = getStoredMode();
    applyMode(initMode, mediaQuery.matches);
    if (!localStorage.getItem('theme-mode')) {
      localStorage.setItem('theme-mode', initMode);
    }
    setThemeInitialized(true);

    const handleChange = (e: MediaQueryListEvent) => {
      if (getStoredMode() === 'system') {
        applyMode('system', e.matches);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Safari / old browsers fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // 提前预加载组件
  useEffect(() => {
    if (!componentsPreloaded.current) {
      // 立即开始预加载主要组件
      const preloadPromises = [
        import('./pages/Home'),
        import('./pages/Contact'),
        import('./pages/Travels')
      ];

      preloadPromises.push(import('./pages/About'));
      // 使用Promise.all并行加载
      Promise.all(preloadPromises).catch(err => {
        console.warn('组件预加载错误:', err);
      });

      componentsPreloaded.current = true;
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      {/* WebWalker组件放在最外层，管理所有动画效果 */}
      <WebWalker />

      {/* 背景图片可以放在外部，确保在组件间过渡时保持显示 */}
      <BackgroundImage />

      {/* 主内容区域 - 使用Apple风格的动画 */}
      <motion.div
        key="main-content"
        className="min-h-screen flex flex-col relative"
        style={{ minHeight: '100dvh' }}
        ref={mainContentRef}
      >
        {/* 顶部导航栏 - Dynamic Island */}
        <DynamicIslandNav />


        {/* 分离的页面内容组件 */}
        <motion.div className="flex-grow flex flex-col min-h-0">
          <PageContent />
        </motion.div>

        {/* 底部胶囊 */}
        <motion.footer className="flex justify-center px-4 pb-24 md:pb-6 mt-auto">
          <div className="inline-flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 px-5 py-2 min-h-10 bg-white/30 dark:bg-[#1c1c1e]/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 rounded-full text-sm text-gray-500 dark:text-gray-400 text-center">
            <span>Designed By damesck · Copyright © 2026</span>
            <a href="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">damesck.net</a>
            <span>All Right Reserved.</span>
          </div>
        </motion.footer>
      </motion.div>
    </Router>
  )
}

function App() {
  return (
    <PerformanceProvider>
      <AppContent />
    </PerformanceProvider>
  );
}

export default App
