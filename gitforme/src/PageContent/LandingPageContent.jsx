
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparkleIcon,
    BrainCircuitIcon,
    FileTextIcon,
    CodeIcon,
    TargetIcon,
    BarChartIcon,
} from '../components/Iconsfile';
import FeatureCard from '../cards/FeatureCard';
import StepCard from '../cards/StepCard';


const LandingPageContent = () => {
    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };
    return (
        <motion.div initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <main className="flex flex-col items-center justify-center pt-16 md:pt-24 px-4 text-center">
                <div className="relative">
                    <SparkleIcon className="absolute top-[-3rem] left-[-5rem] w-20 h-20 text-red-300 rotate-[-15deg] opacity-50 -z-10" />
                    <SparkleIcon className="absolute top-[-1rem] right-[-5rem] w-24 h-24 text-teal-300 rotate-[20deg] opacity-50 -z-10" />
                    <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-5xl md:text-7xl font-bold tracking-tighter">Code to Context</motion.h1>
                    <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-5xl md:text-7xl font-bold tracking-tighter mt-1 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-red-500 pb-2">Instantly</motion.h1>
                    <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-6 text-lg text-gray-600 max-w-lg mx-auto">
                        Turn any Git repo into a structured, LLM-ready summary of its architecture, dependencies, and logic.
                    </motion.p>
                </div>
            </main>

            <motion.section variants={sectionVariants} className="py-24 px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter">How It Works</h2>
                    <p className="mt-3 text-lg text-gray-600">Get your code summary in three simple steps.</p>
                </div>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-stretch gap-8">
                    <StepCard number="1" title="Paste URL">Drop in any public GitHub repository URL to get started.</StepCard>
                    <StepCard number="2" title="Click cook">Our AI analyzes the codebase, structure, and dependencies.</StepCard>
                    <StepCard number="3" title="Get Context">Receive a structured summary, ready for your favorite LLM.</StepCard>
                </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="py-24 px-4 bg-white/50 backdrop-blur-sm border-y-2 border-black">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold tracking-tighter">Unlock Instant Code Understanding</h2>
                        <p className="mt-3 text-lg text-gray-600">Go from repository to readable context in seconds.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<BrainCircuitIcon />} title="Instant Architecture Overview">Grasp the high-level design and component interactions without reading a single line of code.</FeatureCard>
                        <FeatureCard icon={<FileTextIcon />} title="LLM-Optimized Summaries">Get summaries formatted as perfect context for prompts in ChatGPT, Gemini, or any other LLM.</FeatureCard>
                        <FeatureCard icon={<CodeIcon />} title="Key Logic Extraction">Automatically identifies and explains the core business logic and critical functions within the repository.</FeatureCard>
                    </div>
                </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold tracking-tighter">Become a Contributor, Faster</h2>
                        <p className="mt-3 text-lg text-gray-600">Tools to help you find your place and make an impact. 🤝</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FeatureCard icon={<TargetIcon />} title="Find 'Good First Issues'">
                            Jump right in. We highlight beginner-friendly issues to help you make your first contribution.
                        </FeatureCard>
                        <FeatureCard icon={<BarChartIcon />} title="Deep Repository Insights">
                            Go beyond the code with language breakdowns, commit activity graphs, and other key project metrics.
                        </FeatureCard>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}

export default LandingPageContent;