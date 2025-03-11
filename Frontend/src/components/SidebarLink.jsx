import { Link } from "react-router-dom";
const SidebarLink = ({ to, icon, label, isActive, themeStyles }) => (
    <Link
        to={to}
        className="flex items-center p-3 rounded-lg mb-3 text-base transition-all duration-300 ease-in-out shadow-md"
        style={{
        background: isActive(to) ? themeStyles.activeBg : themeStyles.hoverBg,
        color: isActive(to) ? themeStyles.activeText : themeStyles.text,
        fontWeight: isActive(to) ? "bold" : "normal",
        }}
    >
        <span className="text-lg mr-3">{icon}</span> {label}
    </Link>
);
export default SidebarLink;