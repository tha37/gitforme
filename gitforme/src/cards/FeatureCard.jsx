import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ icon, title, children }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        className="bg-white/50 backdrop-blur-sm border-2 border-black rounded-xl p-6 text-left shadow-[8px_8px_0px_rgba(0,0,0,0.1)] h-full">
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-[#F9C79A] p-2 rounded-lg border-2 border-black">{icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-600">{children}</p>
    </motion.div>
);

export default FeatureCard;