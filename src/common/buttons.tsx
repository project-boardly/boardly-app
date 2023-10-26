import { NavLink } from "react-router-dom";
import { ReactNode } from "react";

const BASE_BTN_CLASSES = 'px-4 mx-1 py-2 rounded-full border transition duration-700 hover:bg-gray-200 hover:text-gray-900 focus:outline-none font-medium text-center'

const LIGHT_BTN_CLASSES = `${BASE_BTN_CLASSES} text-gray-800`;
const DARK_BTN_CLASSES = `${BASE_BTN_CLASSES} text-white bg-black`;
const OUTLINE_BTN_CLASSES = `${BASE_BTN_CLASSES} border-gray-800 border-2 text-gray-800`;
const OUTLINE_DISABLED_BTN_CLASSES = `${BASE_BTN_CLASSES} text-gray-400 border-gray-400`;

export function Button({
  children,
  onClick,
  variant,
  ...props
}: {
  children: ReactNode;
  onClick: any;
  variant?: string
}) {
  return (
    <button
      type="button"
      className={ variant === 'dark' ? DARK_BTN_CLASSES : LIGHT_BTN_CLASSES }
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  children,
  variant,
  ...props
}: {
  children: ReactNode
  to: string
  variant?: string
}) {
  function getClassName({ isActive }: { isActive: boolean }) {
    if (variant === 'outline') {
      return `group ${isActive ? OUTLINE_BTN_CLASSES : OUTLINE_DISABLED_BTN_CLASSES}`;
    }

    return `group ${isActive ? DARK_BTN_CLASSES : LIGHT_BTN_CLASSES}`;
  }

  return (
    <NavLink
      to={to}
      className={getClassName}
      {...props}
    >
      {children}
    </NavLink>
  );
}