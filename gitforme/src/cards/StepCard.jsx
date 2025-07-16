import { motion, AnimatePresence } from 'framer-motion';

const StepCard = ({ number, title, children }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        className="flex-1 min-w-[280px] bg-[#FEF9F2] border-2 border-black rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F9C79A] border-2 border-black font-bold text-black flex-shrink-0">
                {number}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-600">{children}</p>
    </motion.div>
);
export default StepCard;